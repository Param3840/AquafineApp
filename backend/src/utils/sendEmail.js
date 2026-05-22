const nodemailer = require("nodemailer");

// Runtime Environment Diagnostics (Runs once when module is loaded)
console.log("\n================================================");
console.log("[EMAIL DIAGNOSTICS] Checking email configurations in runtime...");
console.log(`[EMAIL DIAGNOSTICS] process.env.EMAIL_USER exists: ${!!process.env.EMAIL_USER}`);
console.log(`[EMAIL DIAGNOSTICS] process.env.EMAIL_PASS exists: ${!!process.env.EMAIL_PASS}`);

if (process.env.EMAIL_USER) {
  const emailStr = process.env.EMAIL_USER;
  const atIdx = emailStr.indexOf("@");
  const maskedEmail = atIdx > 2 
    ? `${emailStr.substring(0, 3)}...${emailStr.substring(atIdx)}` 
    : `***${emailStr}`;
  console.log(`[EMAIL DIAGNOSTICS] Masked EMAIL_USER: ${maskedEmail}`);
} else {
  console.warn("[EMAIL DIAGNOSTICS] Warning: EMAIL_USER is Undefined env variable");
}

if (process.env.EMAIL_PASS) {
  const rawPass = process.env.EMAIL_PASS;
  const cleanPass = rawPass.replace(/\s/g, "");
  console.log(`[EMAIL DIAGNOSTICS] EMAIL_PASS raw length: ${rawPass.length}, spaces-removed length: ${cleanPass.length}`);
  console.log(`[EMAIL DIAGNOSTICS] EMAIL_PASS matches standard 16-character Gmail app password: ${cleanPass.length === 16}`);
} else {
  console.warn("[EMAIL DIAGNOSTICS] Warning: EMAIL_PASS is Undefined env variable");
}

// Optional Server Startup SMTP connection handshake verification
if (process.env.VERIFY_SMTP_ON_STARTUP === "true") {
  console.log("[EMAIL DIAGNOSTICS] Optional startup SMTP verification enabled.");
  const emailUser = process.env.EMAIL_USER;
  const emailPassClean = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s/g, "") : "";
  if (emailUser && emailPassClean) {
    const testTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPassClean,
      },
      timeout: 10000,
    });
    testTransporter.verify()
      .then(() => console.log("[EMAIL DIAGNOSTICS SUCCESS] SMTP connection handshake verified successfully on startup."))
      .catch((err) => console.warn(`[EMAIL DIAGNOSTICS WARNING] Startup SMTP handshake failed: ${err.message}`));
  }
}
console.log("================================================\n");

/**
 * Maps Nodemailer/SMTP errors to explicit production failure reasons.
 */
const getFailureReason = (error) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return "Missing credentials / Undefined env variable";
  }

  const message = (error.message || "").toLowerCase();
  const code = (error.code || "").toLowerCase();

  // Gmail Authentication Failures (EAUTH / Invalid Credentials / App Password Rejected)
  if (
    message.includes("invalid login") || 
    message.includes("auth") || 
    message.includes("username and password not accepted") || 
    code === "eauth"
  ) {
    return "Gmail rejected auth / Invalid login";
  }

  // Network / Host timeout
  if (message.includes("timeout") || code === "etimeout") {
    return "SMTP timeout";
  }

  // DNS Lookup / Host name resolution failures
  if (
    message.includes("getaddrinfo") || 
    message.includes("dns") || 
    code === "eai_again" || 
    code === "enotfound"
  ) {
    return "DNS issue";
  }

  // Render Platform / Outgoing Ports blocking issues
  if (
    message.includes("connection") || 
    message.includes("connect") || 
    message.includes("socket") || 
    code === "econnrefused" || 
    code === "econnreset"
  ) {
    return "transporter failure / Render runtime issue";
  }

  return "transporter failure";
};

/**
 * Sends an HTML verification email using a dual-transporter mechanism.
 */
const sendEmail = async ({ to, subject, html, verificationToken }) => {
  console.log(`[EMAIL] Executing sendEmail pipeline. Target: ${to}`);
  if (verificationToken) {
    console.log(`[EMAIL SERVICE] Associated Verification Token: ${verificationToken}`);
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("[EMAIL ERROR] Missing email credentials inside runtime.");
    console.error("[EMAIL FAILURE REASON] Missing credentials / Undefined env variable");
    throw new Error("Missing credentials / Undefined env variable");
  }

  const emailUser = process.env.EMAIL_USER;
  const emailPassClean = process.env.EMAIL_PASS.replace(/\s/g, "");

  // --- CONFIGURATION 1: Primary built-in Gmail service (Port 465 SSL) ---
  try {
    console.log("[EMAIL] Attempting Primary Transporter (service: 'gmail' preset)...");
    const primaryTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPassClean,
      },
      timeout: 10000, // 10s connection timeout
    });

    console.log("[EMAIL] Directly executing transporter.sendMail()");
    const info = await primaryTransporter.sendMail({
      from: `"Aquafine" <${emailUser}>`,
      to,
      subject,
      html,
    });
    console.log("[EMAIL] Email successfully dispatched");
    console.log(`[EMAIL SUCCESS] Mail delivered via Primary Transporter. MessageId: ${info.messageId}`);
    return info;
  } catch (err1) {
    console.warn(`[EMAIL WARNING] Primary Transporter sendMail failed: ${err1.message}`);
    console.warn("[EMAIL] Detail primary sendMail error object:", err1);

    // --- CONFIGURATION 2: Fallback Explicit Port 587 (TLS) ---
    try {
      console.log("[EMAIL] Attempting Fallback Transporter (explicit host: 'smtp.gmail.com', port: 587)...");
      const fallbackTransporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // false for port 587 (TLS upgrade)
        requireTLS: true,
        auth: {
          user: emailUser,
          pass: emailPassClean,
        },
        timeout: 10000, // 10s connection timeout
      });

      console.log("[EMAIL] Directly executing transporter.sendMail()");
      const info = await fallbackTransporter.sendMail({
        from: `"Aquafine" <${emailUser}>`,
        to,
        subject,
        html,
      });
      console.log("[EMAIL] Email successfully dispatched");
      console.log(`[EMAIL SUCCESS] Mail delivered via Fallback Transporter. MessageId: ${info.messageId}`);
      return info;
    } catch (err2) {
      console.error(`[EMAIL ERROR] Fallback Transporter sendMail failed: ${err2.message}`);
      console.error("[EMAIL ERROR] Detail fallback sendMail error object:", err2);

      const failureLabel = getFailureReason(err2);
      console.error(`[EMAIL FAILURE REASON] ${failureLabel}`);
      throw err2;
    }
  }
};

module.exports = sendEmail;
