import "server-only";

/**
 * Optional outbound Telegram notification.
 *
 * The bot token and chat id are SERVER-ONLY environment variables and are never
 * sent to the browser. If they are not configured the function is a no-op, so
 * the platform works fully without Telegram integration.
 *
 * Notifications are best-effort: a Telegram outage must never cause a customer's
 * quote request to fail, so errors are swallowed and logged.
 */
export async function notifyTelegram(message: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) return false;

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message.slice(0, 4000),
        disable_web_page_preview: true,
      }),
      // Do not let a slow third party hold up the user's submission.
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) {
      console.error("[telegram] notification failed with status", response.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[telegram] notification error", error instanceof Error ? error.message : error);
    return false;
  }
}

/** Format a quote request for a Telegram message. */
export function formatQuoteNotification(input: {
  reference: string;
  fullName: string;
  company: string;
  phone: string;
  email: string;
  productService: string;
  quantity: string;
  timeline: string;
  city: string;
  country: string;
  requirements: string;
}): string {
  const lines = [
    "New quote request",
    `Ref: ${input.reference}`,
    `Name: ${input.fullName}`,
    input.company ? `Company: ${input.company}` : "",
    `Phone: ${input.phone}`,
    input.email ? `Email: ${input.email}` : "",
    `Product/service: ${input.productService}`,
    input.quantity ? `Quantity: ${input.quantity}` : "",
    input.timeline ? `Timeline: ${input.timeline}` : "",
    [input.city, input.country].filter(Boolean).length ? `Location: ${[input.city, input.country].filter(Boolean).join(", ")}` : "",
    "",
    "Requirements:",
    input.requirements,
  ];
  return lines.filter((line) => line !== "").join("\n");
}
