/**
 * Cấu hình Cloudflare Workers AI — CHỈ dùng phía server.
 * Hai biến này không có tiền tố NEXT_PUBLIC_ nên không bao giờ lọt ra trình duyệt.
 */
export const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID ?? "";
export const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN ?? "";

export const isAiConfigured = CF_ACCOUNT_ID.length > 0 && CF_API_TOKEN.length > 0;

export const CF_IMAGE_MODEL = "@cf/black-forest-labs/flux-1-schnell";

export function cfImageEndpoint(): string {
  return `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${CF_IMAGE_MODEL}`;
}
