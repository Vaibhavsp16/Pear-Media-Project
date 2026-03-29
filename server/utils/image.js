import { AppError } from "./errors.js";

export function parseDataUrl(dataUrl) {
  if (!dataUrl || typeof dataUrl !== "string") {
    throw new AppError("Please upload an image before continuing.", 400);
  }

  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    throw new AppError("Unsupported image format. Please upload PNG, JPG, WEBP, or GIF.", 400);
  }

  const [, mimeType, base64] = match;
  return {
    mimeType,
    buffer: Buffer.from(base64, "base64"),
  };
}

export function sanitizeImageUrls(output) {
  if (!output) {
    return [];
  }

  if (Array.isArray(output)) {
    return output.filter(Boolean).map(String);
  }

  return [String(output)];
}
