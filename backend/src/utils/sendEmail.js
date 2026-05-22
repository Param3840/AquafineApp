const { Resend } = require("resend");

// Runtime Environment Diagnostics (Runs once when module is loaded)
console.log("\n================================================");
console.log("[EMAIL DIAGNOSTICS] Checking email configurations in runtime...");
console.log(`[EMAIL DIAGNOSTICS] process.env.RESEND_API_KEY exists: ${!!process.env.RESEND_API_KEY}`);

if (process.env.RESEND_API_KEY) {
  const keyStr = process.env.RESEND_API_KEY;
  const maskedKey = keyStr.length > 8 
    ? `${keyStr.substring(0, 4)}...${keyStr.substring(keyStr.length - 4)}` 
    : `***`;
  console.log(`[EMAIL DIAGNOSTICS] Masked RESEND_API_KEY: ${maskedKey}`);
} else {
  console.warn("[EMAIL DIAGNOSTICS] Warning: RESEND_API_KEY is Undefined env variable");
}

if (process.env.RESEND_FROM_EMAIL) {
  console.log(`[EMAIL DIAGNOSTICS] RESEND_FROM_EMAIL configured: ${process.env.RESEND_FROM_EMAIL}`);
} else {
  console.log("[EMAIL DIAGNOSTICS] RESEND_FROM_EMAIL not configured, using default onboarding@resend.dev");
}
console.log("================================================\n");

/**
 * Sends an HTML verification email using Resend API.
 */
const sendEmail = async ({ to, subject, html, verificationToken }) => {
  console.log(`[EMAIL] Executing Resend API sendEmail pipeline. Target: ${to}`);
  if (verificationToken) {
    console.log(`[EMAIL SERVICE] Associated Verification Token: ${verificationToken}`);
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("[EMAIL ERROR] Missing RESEND_API_KEY credentials inside runtime.");
    throw new Error("Missing RESEND_API_KEY / Undefined env variable");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Aquafine <onboarding@resend.dev>";

  const mailOptions = {
    from: fromEmail,
    to: [to],
    subject,
    html,
  };

  console.log("[EMAIL] Target recipient:", to);
  console.log("[EMAIL] Mail options subject:", mailOptions.subject);
  console.log("[EMAIL] Mail options from:", mailOptions.from);

  try {
    console.log("[EMAIL] Directly executing Resend API send()");
    console.log("[EMAIL] Before Resend send");

    const response = await resend.emails.send(mailOptions);

    if (response.error) {
      console.error("[EMAIL FAILURE]");
      console.error("Resend API returned error details:", response.error);
      throw response.error;
    }

    console.log("[EMAIL SUCCESS]");
    console.log(response.data);
    console.log("[EMAIL] Email successfully dispatched");
    console.log(`[EMAIL SUCCESS] Mail delivered via Resend. Message ID/Response:`, response.data);
    return response.data;
  } catch (error) {
    console.error("[EMAIL FAILURE]");
    console.error("Error Details:", error);
    console.error("Error Message:", error.message);
    console.error("Error Code:", error.code || "N/A");
    console.error("Error Response:", error.response || "N/A");
    throw error;
  }
};

module.exports = sendEmail;
