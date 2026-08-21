import { Resend } from "resend";
import { formatCurrency } from "./permits";

const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL ?? "Knutsford SRC <onboarding@resend.dev>";

function getClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendPermitEmail({
  to,
  studentName,
  referenceNumber,
  amount,
  issuedAt,
  expiresAt,
}: {
  to: string;
  studentName: string;
  referenceNumber: string;
  amount: string | null;
  issuedAt: Date | string;
  expiresAt: Date | string | null;
}) {
  const client = getClient();
  if (!client) {
    return { sent: false, error: "Email sending is not configured yet." };
  }

  const issuedDate = new Date(issuedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const expiryDate = expiresAt
    ? new Date(expiresAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "No expiry set";

  const { error } = await client.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `Your Knutsford SRC Permit — ${referenceNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #14120c;">Permit Receipt</h2>
        <p>Hi ${studentName},</p>
        <p>Your permit has been issued. Here are the details:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 6px 0; color: #666;">Reference</td><td style="padding: 6px 0; font-weight: 600;">${referenceNumber}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Amount Paid</td><td style="padding: 6px 0; font-weight: 600;">${formatCurrency(amount)}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Date Issued</td><td style="padding: 6px 0; font-weight: 600;">${issuedDate}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Expires</td><td style="padding: 6px 0; font-weight: 600;">${expiryDate}</td></tr>
        </table>
        <p>Please keep this email as your receipt. Your physical card can be collected from the SRC office.</p>
        <p style="color: #888; font-size: 12px; margin-top: 24px;">Knutsford University SRC</p>
      </div>
    `,
  });

  if (error) {
    return { sent: false, error: error.message };
  }
  return { sent: true, error: null };
}

export async function sendPasswordChangedEmail({
  to,
  name,
}: {
  to: string;
  name: string;
}) {
  const client = getClient();
  if (!client) {
    return { sent: false, error: "Email sending is not configured yet." };
  }

  const { error } = await client.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Your Knutsford SRC password was changed",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #14120c;">Password Changed</h2>
        <p>Hi ${name},</p>
        <p>This is a confirmation that the password on your Knutsford SRC account was just changed. If you made this change, no further action is needed.</p>
        <p style="color: #b91c1c; font-weight: 600;">If you did not make this change, contact the SRC office immediately.</p>
        <p style="color: #888; font-size: 12px; margin-top: 24px;">Knutsford University SRC</p>
      </div>
    `,
  });

  if (error) {
    return { sent: false, error: error.message };
  }
  return { sent: true, error: null };
}

export async function sendStudentWelcomeEmail({
  to,
  name,
  indexNumber,
  temporaryPassword,
  program,
  level,
  loginUrl,
}: {
  to: string;
  name: string;
  indexNumber: string;
  temporaryPassword: string;
  program: string | null;
  level: string | null;
  loginUrl: string;
}) {
  const client = getClient();
  if (!client) {
    return { sent: false, error: "Email sending is not configured yet." };
  }

  const { error } = await client.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Welcome to Knutsford SRC — Your Account Details",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #14120c;">Welcome, ${name}</h2>
        <p>An account has been created for you on the Knutsford SRC Student Digital Hub. Here are your login details:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 6px 0; color: #666;">Index Number</td><td style="padding: 6px 0; font-weight: 600;">${indexNumber}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Temporary Password</td><td style="padding: 6px 0; font-weight: 600;">${temporaryPassword}</td></tr>
          ${program ? `<tr><td style="padding: 6px 0; color: #666;">Programme</td><td style="padding: 6px 0; font-weight: 600;">${program}</td></tr>` : ""}
          ${level ? `<tr><td style="padding: 6px 0; color: #666;">Level</td><td style="padding: 6px 0; font-weight: 600;">Level ${level}</td></tr>` : ""}
        </table>
        <p style="margin-top: 20px; font-weight: 600;">How to log in:</p>
        <ol style="padding-left: 20px; margin: 8px 0; color: #333;">
          <li style="margin-bottom: 6px;">Go to <a href="${loginUrl}">${loginUrl}</a></li>
          <li style="margin-bottom: 6px;">Enter your Index Number and the Temporary Password above</li>
          <li style="margin-bottom: 6px;">Once logged in, open Settings and change your password</li>
          <li>Complete the rest of your profile if anything is missing</li>
        </ol>
        <p>
          <a href="${loginUrl}" style="display: inline-block; background: #14120c; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600;">Log In</a>
        </p>
        <p style="color: #888; font-size: 13px;">Or visit: ${loginUrl}</p>
        <p style="color: #888; font-size: 12px; margin-top: 24px;">Knutsford University SRC</p>
      </div>
    `,
  });

  if (error) {
    return { sent: false, error: error.message };
  }
  return { sent: true, error: null };
}
