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
 * Sends a HTML verification email using a dual-transporter mechanism.
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

  let transporter;
  let connectionSuccess = false;
  let connectionError = null;

  // --- CONFIGURATION 1: Primary built-in Gmail service (Port 465 SSL) ---
  try {
    console.log("[EMAIL] Attempting Primary Transporter (service: 'gmail' preset)...");
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPassClean,
      },
      timeout: 10000, // 10s connection timeout
    });

    console.log("[EMAIL] Verifying primary SMTP connection handshake...");
    await transporter.verify();
    console.log("[EMAIL SUCCESS] SMTP connected successfully (Primary: service: 'gmail')");
    connectionSuccess = true;
  } catch (err1) {
    connectionError = err1;
    console.warn(`[EMAIL WARNING] Primary SMTP handshake failed: ${err1.message}`);
    console.warn("[EMAIL] Detail primary verification error object:", err1);
  }

  // --- CONFIGURATION 2: Fallback Explicit Port 587 (TLS) ---
  if (!connectionSuccess) {
    try {
      console.log("[EMAIL] Attempting Fallback Transporter (explicit host: 'smtp.gmail.com', port: 587)...");
      transporter = nodemailer.createTransport({
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

      console.log("[EMAIL] Verifying fallback SMTP connection handshake...");
      await transporter.verify();
      console.log("[EMAIL SUCCESS] SMTP connected successfully (Fallback: port 587)");
      connectionSuccess = true;
    } catch (err2) {
      connectionError = err2;
      console.error(`[EMAIL ERROR] Fallback SMTP handshake failed: ${err2.message}`);
      console.error("[EMAIL ERROR] Detail fallback verification error object:", err2);
    }
  }

  // If both configurations failed, throw connection error
  if (!connectionSuccess) {
    const failureLabel = getFailureReason(connectionError);
    console.error(`[EMAIL FAILURE REASON] ${failureLabel}`);
    throw connectionError;
  }

  // --- SENDING MAIL ---
  try {
    console.log(`[EMAIL] Transport validated. Sending payload to ${to}...`);
    const info = await transporter.sendMail({
      from: `"Aquafine" <${emailUser}>`,
      to,
      subject,
      html,
    });
    console.log("[EMAIL SUCCESS] Verification email sent successfully");
    console.log(`[EMAIL SUCCESS] Mail delivered. MessageId: ${info.messageId}`);
    return info;
  } catch (sendError) {
    const failureLabel = getFailureReason(sendError);
    console.error(`[EMAIL ERROR] sendMail operation failed: ${sendError.message}`);
    console.error(`[EMAIL FAILURE REASON] ${failureLabel}`);
    throw sendError;
  }
};

module.exports = sendEmail;
