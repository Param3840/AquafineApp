const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  console.log(`[EMAIL] Attempting to send email to: ${to}`);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("[EMAIL ERROR] Missing email credentials (EMAIL_USER or EMAIL_PASS not configured in .env)");
    throw new Error("Email credentials are not configured");
  }

  const emailPassClean = process.env.EMAIL_PASS.replace(/\s/g, "");
  console.log(`[EMAIL] Using sender account: ${process.env.EMAIL_USER}`);

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: emailPassClean,
    },
    timeout: 10000, // 10 seconds timeout
  });

  // Verify connection configuration
  try {
    console.log("[EMAIL] Verifying SMTP connection to smtp.gmail.com...");
    await transporter.verify();
    console.log("[EMAIL] SMTP connection verified successfully.");
  } catch (verifyError) {
    console.error(`[EMAIL ERROR] SMTP verification failed: ${verifyError.message}`);
    console.error("[EMAIL ERROR] Detailed SMTP verification error object:", verifyError);
    throw verifyError;
  }

  // Send mail
  try {
    const info = await transporter.sendMail({
      from: `"Aquafine" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[EMAIL SUCCESS] Email sent successfully to ${to}. MessageId: ${info.messageId}`);
    return info;
  } catch (sendError) {
    console.error(`[EMAIL ERROR] Failed to send email to ${to}: ${sendError.message}`);
    console.error("[EMAIL ERROR] Detailed sendMail error object:", sendError);
    throw sendError;
  }
};

module.exports = sendEmail;
