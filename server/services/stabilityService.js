import { AppError } from "../utils/errors.js";
import { getStyleHint } from "../utils/promptTemplates.js";

function getEndpoint() {
  if (!process.env.STABILITY_API_KEY) {
    throw new AppError("STABILITY_API_KEY is missing. Add it to your environment variables.", 500);
  }

  return process.env.STABILITY_TEXT_ENDPOINT || "https://api.stability.ai/v2beta/stable-image/generate/core";
}

function buildPrompt(prompt, style, negativePrompt = "") {
  const sections = [prompt.trim(), `Visual direction: ${getStyleHint(style)}`];

  if (negativePrompt.trim()) {
    sections.push(`Avoid: ${negativePrompt.trim()}`);
  }

  return sections.join(". ");
}

async function requestImage({ prompt, style, aspectRatio, negativePrompt }) {
  const endpoint = getEndpoint();
  const formData = new FormData();
  formData.set("prompt", buildPrompt(prompt, style, negativePrompt));
  formData.set("aspect_ratio", aspectRatio);
  formData.set("output_format", "png");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
      Accept: "image/*",
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new AppError("Stability AI image generation failed.", response.status, errorText);
  }

  const imageBuffer = Buffer.from(await response.arrayBuffer());
  return `data:image/png;base64,${imageBuffer.toString("base64")}`;
}

async function generateBatch(params) {
  const count = Math.min(Math.max(Number(params.numberOfImages) || 3, 1), 4);
  return Promise.all(Array.from({ length: count }, () => requestImage(params)));
}

export async function generateImages({
  prompt,
  style,
  negativePrompt,
  numberOfImages = 3,
  aspectRatio = "1:1",
}) {
  if (!prompt?.trim()) {
    throw new AppError("Approve or provide a prompt before generating images.", 400);
  }

  return generateBatch({
    prompt,
    style,
    negativePrompt,
    numberOfImages,
    aspectRatio,
  });
}

export async function generateVariations({
  prompt,
  style,
  numberOfImages = 3,
}) {
  if (!prompt?.trim()) {
    throw new AppError("Analyze the image first so a variation prompt can be created.", 400);
  }

  return generateBatch({
    prompt: `${prompt}. Create related variations that preserve the key subject but explore alternate compositions and mood.`,
    style,
    numberOfImages,
    aspectRatio: "1:1",
  });
}
