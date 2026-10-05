import "server-only";

import QRCode from "qrcode";

/**
 * QR code generation.
 *
 * Rendered server-side to a data URL, so no third-party QR service is
 * involved and nothing about the visitor is sent anywhere.
 */
export async function generateQrDataUrl(text: string, size = 512): Promise<string | null> {
  if (!text) return null;
  try {
    return await QRCode.toDataURL(text, {
      width: size,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#12151a", light: "#ffffff" },
    });
  } catch {
    return null;
  }
}
