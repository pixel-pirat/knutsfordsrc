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
