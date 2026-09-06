const nodemailer = require('nodemailer');
const dns = require('dns');

// Force IPv4 DNS resolution across runtime to prevent ENETUNREACH on platforms without IPv6 routing
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

/*
|--------------------------------------------------------------------------
| Email Service — Gmail SMTP via Nodemailer
|--------------------------------------------------------------------------
|
| Free · 500 emails/day · No domain required · Any recipient works
|
| SETUP:
|   1. Create/use a Gmail account for OneCoolie
|        e.g. noreply.onecoolie@gmail.com
|   2. Enable 2-Step Verification:
|        https://myaccount.google.com/security
|   3. Create App Password:
|        https://myaccount.google.com/apppasswords
|        → Name it "OneCoolie"
|        → Copy the 16-char password (no spaces needed)
|   4. Set in server/.env:
|        GMAIL_USER=noreply.onecoolie@gmail.com
|        GMAIL_APP_PASSWORD=abcdefghijklmnop
|
*/

const FROM_NAME  = process.env.OTP_FROM_NAME || 'OneCoolie';
const FROM_EMAIL = process.env.GMAIL_USER;

const buildOtpHtml = (otp, expiryMinutes = 10) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Your OneCoolie OTP</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#000;padding:28px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td>
                <div style="background:#2563EB;width:36px;height:36px;border-radius:10px;display:inline-block;text-align:center;line-height:36px;color:#fff;font-weight:700;font-size:14px;vertical-align:middle;">OC</div>
                <span style="color:#fff;font-size:18px;font-weight:700;margin-left:10px;vertical-align:middle;">OneCoolie</span>
              </td>
              <td align="right"><span style="color:#71717a;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Verification</span></td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 32px 28px;">
            <p style="margin:0 0 6px;color:#71717a;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">One-Time Password</p>
            <h1 style="margin:0 0 16px;color:#09090b;font-size:22px;font-weight:700;">Your verification code</h1>
            <p style="margin:0 0 24px;color:#52525b;font-size:14px;line-height:1.6;">
              Use this code to verify your email for OneCoolie. Valid for <strong>${expiryMinutes} minutes</strong>.
            </p>
            <div style="background:#f4f4f5;border-radius:12px;padding:28px;text-align:center;margin:0 0 24px;">
              <span style="font-family:'Courier New',monospace;font-size:48px;font-weight:700;letter-spacing:14px;color:#09090b;">
                ${otp}
              </span>
            </div>
            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px 18px;margin:0 0 20px;">
              <p style="margin:0;color:#1d4ed8;font-size:13px;line-height:1.5;">
                <strong>Never share this code.</strong> OneCoolie staff will never ask for your OTP. Expires in ${expiryMinutes} minutes.
              </p>
            </div>
            <p style="margin:0;color:#a1a1aa;font-size:12px;">If you didn't request this, ignore this email.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#fafafa;border-top:1px solid #e4e4e7;padding:16px 32px;">
            <p style="margin:0;color:#a1a1aa;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
              OneCoolie Pilot Network · KZJ · WL · BZA · SC
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const createTransport = (port, secure) => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port,
    secure,
    family: 4, // CRITICAL: Force IPv4 to prevent ENETUNREACH on cloud environments (like Render) that lack IPv6 routing
    auth: {
      user: FROM_EMAIL,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};

// Brevo HTTP API (Port 443 — bypasses cloud SMTP port blocks entirely)
const sendViaBrevo = async (to, otp, expiryMinutes) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return null;

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: FROM_NAME,
        email: process.env.BREVO_SENDER_EMAIL || '2303A52362@sru.edu.in',
      },
      to: [{ email: to }],
      subject: `${otp} — Your OneCoolie verification code`,
      htmlContent: buildOtpHtml(otp, expiryMinutes),
      textContent: `Your OneCoolie OTP: ${otp}\n\nExpires in ${expiryMinutes} minutes. Never share this code.`,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Brevo HTTP API Error: ${data.message || JSON.stringify(data)}`);
  }
  console.log('OTP EMAIL SENT (Brevo HTTP API):', { messageId: data.messageId, to });
  return data;
};

// Resend HTTP API (Port 443 — bypasses cloud SMTP port blocks entirely)
const sendViaResend = async (to, otp, expiryMinutes) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || `${FROM_NAME} <onboarding@resend.dev>`,
      to: [to],
      subject: `${otp} — Your OneCoolie verification code`,
      html: buildOtpHtml(otp, expiryMinutes),
      text: `Your OneCoolie OTP: ${otp}\n\nExpires in ${expiryMinutes} minutes. Never share this code.`,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Resend HTTP API Error: ${data.message || JSON.stringify(data)}`);
  }
  console.log('OTP EMAIL SENT (Resend HTTP API):', { messageId: data.id, to });
  return data;
};

const sendOtpEmail = async (to, otp, expiryMinutes = 10) => {
  // 1. If Brevo API key is configured, use HTTP API over Port 443 (100% unblocked on cloud hosts)
  if (process.env.BREVO_API_KEY) {
    try {
      return await sendViaBrevo(to, otp, expiryMinutes);
    } catch (brevoErr) {
      console.error('BREVO HTTP API FAILED:', brevoErr.message);
    }
  }

  // 2. If Resend API key is configured, use HTTP API over Port 443
  if (process.env.RESEND_API_KEY) {
    try {
      return await sendViaResend(to, otp, expiryMinutes);
    } catch (resendErr) {
      console.error('RESEND HTTP API FAILED:', resendErr.message);
    }
  }

  // 3. Gmail SMTP with forced IPv4 (family: 4)
  const mailPayload = {
    from:    `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: `${otp} — Your OneCoolie verification code`,
    html:    buildOtpHtml(otp, expiryMinutes),
    text:    `Your OneCoolie OTP: ${otp}\n\nExpires in ${expiryMinutes} minutes. Never share this code.`,
  };

  try {
    const transport465 = createTransport(465, true);
    const info = await transport465.sendMail(mailPayload);
    console.log('OTP EMAIL SENT (port 465):', { messageId: info.messageId, to });
    return info;
  } catch (e) {
    console.error('SMTP PRIMARY FAILED:', e.message);
    console.error('SMTP FULL ERROR:', JSON.stringify(e, Object.getOwnPropertyNames(e)));
    try {
      const transport587 = createTransport(587, false);
      const info = await transport587.sendMail(mailPayload);
      console.log('OTP EMAIL SENT (port 587):', { messageId: info.messageId, to });
      return info;
    } catch (fallbackErr) {
      console.error('SMTP FALLBACK FAILED:', fallbackErr.message);
      console.error('SMTP FALLBACK FULL ERROR:', JSON.stringify(fallbackErr, Object.getOwnPropertyNames(fallbackErr)));
      const combinedError = new Error(`SMTP Error: [Port 465: ${e.message}] [Port 587: ${fallbackErr.message}]`);
      combinedError.code = fallbackErr.code || e.code;
      throw combinedError;
    }
  }
};

module.exports = { sendOtpEmail };
