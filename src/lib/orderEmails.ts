import { Resend } from "resend";
import { formatCurrency } from "./permits";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "./marketplace";

const FROM_ADDRESS =
  process.env.RESEND_FROM_EMAIL ?? "Knutsford SRC <onboarding@resend.dev>";

function getClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function nl2br(value: string) {
  return escapeHtml(value).replace(/\n/g, "<br />");
}

export async function sendNewMarketplaceOrderEmail({
  to,
  name,
  orderNumber,
  storeName,
  buyerName,
  total,
  itemCount,
  fulfilment,
  note,
  orderUrl,
}: {
  to: string;
  name: string;
  orderNumber: string;
  storeName: string;
  buyerName: string;
  total: number;
  itemCount: number;
  fulfilment: string;
  note?: string | null;
  orderUrl: string;
}) {
  const client = getClient();
  if (!client) {
    return { sent: false, error: "Email sending is not configured yet." };
  }

  const { error } = await client.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `New order ${orderNumber} for ${storeName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto;">
        <h2 style="color: #14120c;">New marketplace order</h2>
        <p>Hi ${escapeHtml(name)},</p>
        <p>You have received a new order in your Knutsford student store.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 6px 0; color: #666;">Order</td><td style="padding: 6px 0; font-weight: 600;">${escapeHtml(orderNumber)}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Buyer</td><td style="padding: 6px 0; font-weight: 600;">${escapeHtml(buyerName)}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Items</td><td style="padding: 6px 0; font-weight: 600;">${itemCount}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Total</td><td style="padding: 6px 0; font-weight: 600;">${formatCurrency(total)}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Fulfilment</td><td style="padding: 6px 0; font-weight: 600;">${escapeHtml(fulfilment)}</td></tr>
        </table>
        ${note ? `<p style="background: #f6f4ec; padding: 12px; border-radius: 8px;"><strong>Buyer note:</strong><br />${nl2br(note)}</p>` : ""}
        <p>Review the order, confirm payment and update its progress from your seller dashboard.</p>
        <p>
          <a href="${orderUrl}" style="display: inline-block; background: #14120c; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600;">Manage order</a>
        </p>
        <p style="color: #888; font-size: 12px; margin-top: 24px;">Knutsford University SRC Marketplace</p>
      </div>
    `,
  });

  if (error) {
    return { sent: false, error: error.message };
  }
  return { sent: true, error: null };
}

export async function sendMarketplaceOrderUpdateEmail({
  to,
  name,
  orderNumber,
  storeName,
  status,
  paymentStatus,
  note,
  orderUrl,
}: {
  to: string;
  name: string;
  orderNumber: string;
  storeName: string;
  status: string;
  paymentStatus: string;
  note?: string | null;
  orderUrl: string;
}) {
  const client = getClient();
  if (!client) {
    return { sent: false, error: "Email sending is not configured yet." };
  }

  const { error } = await client.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `Order ${orderNumber} updated — ${storeName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto;">
        <h2 style="color: #14120c;">Order update</h2>
        <p>Hi ${escapeHtml(name)},</p>
        <p>${escapeHtml(storeName)} has updated your order <strong>${escapeHtml(orderNumber)}</strong>.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 6px 0; color: #666;">Order status</td><td style="padding: 6px 0; font-weight: 600;">${escapeHtml(ORDER_STATUS_LABELS[status] ?? status)}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Payment</td><td style="padding: 6px 0; font-weight: 600;">${escapeHtml(PAYMENT_STATUS_LABELS[paymentStatus] ?? paymentStatus)}</td></tr>
        </table>
        ${note ? `<p style="background: #f6f4ec; padding: 12px; border-radius: 8px;">${nl2br(note)}</p>` : ""}
        <p>
          <a href="${orderUrl}" style="display: inline-block; background: #14120c; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600;">View order</a>
        </p>
        <p style="color: #888; font-size: 12px; margin-top: 24px;">Knutsford University SRC Marketplace</p>
      </div>
    `,
  });

  if (error) {
    return { sent: false, error: error.message };
  }
  return { sent: true, error: null };
}

export async function sendMarketplacePaymentSubmittedEmail({
  to,
  name,
  orderNumber,
  storeName,
  buyerName,
  reference,
  note,
  orderUrl,
}: {
  to: string;
  name: string;
  orderNumber: string;
  storeName: string;
  buyerName: string;
  reference: string;
  note?: string | null;
  orderUrl: string;
}) {
  const client = getClient();
  if (!client) {
    return { sent: false, error: "Email sending is not configured yet." };
  }

  const { error } = await client.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `Payment submitted for ${orderNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto;">
        <h2 style="color: #14120c;">Payment submitted</h2>
        <p>Hi ${escapeHtml(name)},</p>
        <p>${escapeHtml(buyerName)} has marked payment as sent for order <strong>${escapeHtml(orderNumber)}</strong> at ${escapeHtml(storeName)}.</p>
        <p style="background: #f6f4ec; padding: 12px; border-radius: 8px;"><strong>Reference:</strong> ${escapeHtml(reference)}</p>
        ${note ? `<p style="background: #f6f4ec; padding: 12px; border-radius: 8px;">${nl2br(note)}</p>` : ""}
        <p>Check your payment account and confirm the payment in your seller dashboard.</p>
        <p>
          <a href="${orderUrl}" style="display: inline-block; background: #14120c; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600;">Review payment</a>
        </p>
        <p style="color: #888; font-size: 12px; margin-top: 24px;">Knutsford University SRC Marketplace</p>
      </div>
    `,
  });

  if (error) {
    return { sent: false, error: error.message };
  }
  return { sent: true, error: null };
}
