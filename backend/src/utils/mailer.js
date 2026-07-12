import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from './logger.js';

// Built once and reused — creating a new SMTP connection pool per email
// would be wasteful under any real load.
let transporter = null;
function getTransporter() {
  if (!env.smtp.host) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
    });
  }
  return transporter;
}

// Sends an email, or — if SMTP_HOST was never configured in .env — logs it
// to the console instead. This is what lets you build and test the whole
// Sign Up / Forgot Password flow locally on day one, before you've decided
// on and configured a real mail provider (Gmail App Password, Resend,
// Brevo, etc.). It is NOT something to leave relying on in production:
// once SMTP_HOST is set, this automatically starts sending real email —
// but if you deploy without ever setting it, OTP codes would only ever
// reach your server's own console, not your users' inboxes.
//
// `attachments` follows nodemailer's own shape — [{ filename, content,
// contentType }] — content can be a Buffer directly (which is exactly
// what toPDF()/toXLSX() already return), so emailing a report is just
// generating the same buffer the download button generates and handing
// it to this function instead of sending it over HTTP.
export async function sendMail({ to, subject, html, text, attachments }) {
  const t = getTransporter();

  if (!t) {
    logger.warn(
      `SMTP not configured — email NOT actually sent. Would have sent to ${to}:`,
      `\n  Subject: ${subject}`,
      `\n  Body: ${text || html}`,
      attachments?.length ? `\n  Attachments: ${attachments.map((a) => a.filename).join(', ')}` : ''
    );
    return { devMode: true };
  }

  return t.sendMail({ from: env.smtp.from, to, subject, html, text, attachments });
}
