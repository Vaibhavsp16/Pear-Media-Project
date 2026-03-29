import { InferenceClient } from "@huggingface/inference";
import { AppError } from "../utils/errors.js";
import {
  buildEnhancementMessages,
} from "../utils/promptTemplates.js";

let client;

function getClient() {
  if (!process.env.HF_TOKEN) {
    throw new AppError("HF_TOKEN is missing. Add it to your environment variables.", 500);
  }

  if (!client) {
    client = new InferenceClient(process.env.HF_TOKEN);
  }

  return client;
}

function parseJsonPayload(content) {
  const raw = String(content || "").trim();
  const normalized = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(normalized);
  } catch {
    const objectMatch = normalized.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }

    throw new Error("Model response was not valid JSON.");
  }
}

function extractSection(content, label) {
  const pattern = new RegExp(`\\*\\*${label}:\\*\\*\\s*([\\s\\S]*?)(?=\\n\\n\\*\\*|$)`, "i");
  return content.match(pattern)?.[1]?.trim() || "";
}

function parseListWithScores(section) {
  return section
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^\d+\.\s*(.+?)(?:\s*\((\d+)%\))?$/);
      if (!match) {
        return null;
      }

      return {
        label: match[1].trim(),
        score: Number(match[2] || 0),
      };
    })
    .filter(Boolean);
}

function parseList(section) {
  return section
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^\d+\.\s*/, "").trim());
}

function parseVisionPayload(content) {
  try {
    return parseJsonPayload(content);
  } catch {
    return {
      caption: extractSection(content, "Caption"),
      summary: extractSection(content, "Summary"),
      detectedStyle: extractSection(content, "Detected Style"),
      keyObjects: parseList(extractSection(content, "Key Objects")),
      objects: parseListWithScores(extractSection(content, "Objects with Confidence Scores")),
      styles: parseListWithScores(extractSection(content, "Styles with Confidence Scores")),
      variationPrompt: extractSection(content, "Variation Prompt"),
      editPrompt: extractSection(content, "Edit Prompt"),
    };
  }
}

async function runChat(messages) {
  const hf = getClient();
  const candidates = [
    {
      model: process.env.HF_TEXT_MODEL || "meta-llama/Llama-3.1-8B-Instruct",
      provider: process.env.HF_TEXT_PROVIDER || "sambanova",
    },
    {
      model: "meta-llama/Llama-3.1-8B-Instruct",
      provider: "sambanova",
    },
    {
      model: "meta-llama/Llama-3.1-8B-Instruct",
      provider: "auto",
    },
  ];
  const failures = [];

  for (const candidate of candidates) {
    try {
      const response = await hf.chatCompletion({
        model: candidate.model,
        provider: candidate.provider,
        messages,
        max_tokens: 700,
        temperature: 0.3,
      });

      return response?.choices?.[0]?.message?.content || "";
    } catch (error) {
      failures.push(`${candidate.model} via ${candidate.provider}: ${error.message}`);
    }
  }

  throw new AppError("No Hugging Face chat model was available for prompt processing.", 502, failures);
}

export async function enhancePrompt({ prompt, style }) {
  if (!prompt?.trim()) {
    throw new AppError("Enter a prompt before enhancing it.", 400);
  }

  const content = await runChat(buildEnhancementMessages({ prompt, style }));
  const parsed = parseJsonPayload(content);

  return {
    tone: parsed.tone || "balanced",
    intent: parsed.intent || "Create an image based on the prompt",
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
    enhancedPrompt: parsed.enhancedPrompt || prompt,
    negativePrompt:
      parsed.negativePrompt || "low quality, blurry, distorted anatomy, watermark, text artifacts",
    rationale: parsed.rationale || "Expanded with clearer visual direction.",
  };
}

export async function analyzeImage({ imageBuffer, mimeType, variationGoal, style }) {
  if (!imageBuffer?.length) {
    throw new AppError("Please upload an image before analyzing it.", 400);
  }

  const hf = getClient();
  const imageDataUrl = `data:${mimeType};base64,${imageBuffer.toString("base64")}`;
  const response = await hf.chatCompletion({
    model: process.env.HF_VISION_MODEL || "CohereLabs/aya-vision-32b",
    provider: process.env.HF_VISION_PROVIDER || "cohere",
    messages: [
      {
        role: "system",
        content:
          "You analyze images for creative production teams. Return valid JSON only with keys caption, summary, detectedStyle, keyObjects, objects, styles, variationPrompt, and editPrompt. objects and styles must be arrays of objects with label and score fields where score is 0-100.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: JSON.stringify({
              requestedGoal: variationGoal,
              preferredStyle: style,
              instructions: [
                "Write a clear one-sentence caption.",
                "Write a 1-2 sentence summary of the image.",
                "Infer a single best detectedStyle.",
                "Return 3-6 keyObjects as strings.",
                "Return 3-6 objects with confidence-style scores.",
                "Return 2-4 styles with confidence-style scores.",
                "Create variationPrompt for generating similar images from scratch.",
                "Create editPrompt for future image-editing flows.",
              ],
            }),
          },
          {
            type: "image_url",
            image_url: {
              url: imageDataUrl,
            },
          },
        ],
      },
    ],
    max_tokens: 700,
    temperature: 0.2,
  });

  const parsed = parseVisionPayload(response?.choices?.[0]?.message?.content || "");
  const objects = Array.isArray(parsed.objects)
    ? parsed.objects.map((item) => ({
        label: item.label || item.name || "object",
        score: Number(item.score || 0),
      }))
    : [];
  const styles = Array.isArray(parsed.styles)
    ? parsed.styles.map((item) => ({
        label: item.label || item.name || "style",
        score: Number(item.score || 0),
      }))
    : [];

  return {
    caption: parsed.caption || "An uploaded image",
    objects,
    styles,
    summary: parsed.summary || parsed.caption || "Image analysis completed.",
    detectedStyle: parsed.detectedStyle || styles[0]?.label || "mixed",
    keyObjects: Array.isArray(parsed.keyObjects)
      ? parsed.keyObjects
      : objects.map((item) => item.label),
    variationPrompt:
      parsed.variationPrompt ||
      `${parsed.caption || "Subject reference"}, ${variationGoal}, ${style} style`,
    editPrompt:
      parsed.editPrompt ||
      `Create a ${style} variation of this image while preserving the main subject and composition.`,
  };
}
