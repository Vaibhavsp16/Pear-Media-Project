const STYLE_HINTS = {
  realistic: "photorealistic, detailed lighting, natural textures",
  cinematic: "cinematic composition, dramatic lighting, rich atmosphere",
  anime: "anime illustration, clean line work, expressive colors",
  editorial: "premium editorial art direction, polished composition, design-forward",
  fantasy: "fantasy concept art, magical ambience, imaginative details",
};

export function getStyleHint(style) {
  return STYLE_HINTS[style] || STYLE_HINTS.realistic;
}

export function buildEnhancementMessages({ prompt, style }) {
  return [
    {
      role: "system",
      content:
        "You are an expert prompt engineer for image generation. Return valid JSON only with the keys tone, intent, keywords, enhancedPrompt, negativePrompt, and rationale. Make the enhancedPrompt vivid, production-ready, and optimized for modern text-to-image models without changing the user's core idea.",
    },
    {
      role: "user",
      content: JSON.stringify({
        userPrompt: prompt,
        requestedStyle: style,
        styleHint: getStyleHint(style),
        instructions: [
          "Infer tone, intent, and 5-8 visual keywords.",
          "Rewrite the prompt for an image model in 2-4 concise sentences.",
          "Include framing, mood, lighting, materials, and composition when useful.",
          "Create a short negativePrompt that avoids distortions, watermarks, and low-quality artifacts.",
          "Keep the result aligned with the original request."
        ],
      }),
    },
  ];
}

export function buildImageSummaryMessages({ caption, objects, styles, variationGoal, style }) {
  return [
    {
      role: "system",
      content:
        "You turn structured image signals into a polished creative brief. Return valid JSON only with the keys summary, detectedStyle, keyObjects, variationPrompt, and editPrompt.",
    },
    {
      role: "user",
      content: JSON.stringify({
        caption,
        topObjects: objects,
        topStyles: styles,
        requestedGoal: variationGoal,
        preferredStyle: style,
        instructions: [
          "Write a 1-2 sentence summary of the image.",
          "Pick a single best detectedStyle.",
          "Return 3-6 keyObjects.",
          "Create variationPrompt for generating similar images from scratch.",
          "Create editPrompt for image-to-image variation generation while preserving recognizable content."
        ],
      }),
    },
  ];
}

export function getObjectCandidates() {
  return [
    "person",
    "portrait",
    "face",
    "fashion",
    "product",
    "food",
    "drink",
    "city",
    "building",
    "interior",
    "furniture",
    "landscape",
    "mountain",
    "beach",
    "ocean",
    "forest",
    "flower",
    "animal",
    "cat",
    "dog",
    "car",
    "technology",
    "phone",
    "laptop",
    "illustration",
    "painting",
    "poster"
  ];
}

export function getStyleCandidates() {
  return [
    "realistic photography",
    "studio portrait",
    "cinematic",
    "anime",
    "editorial",
    "minimalist",
    "illustration",
    "watercolor",
    "3D render",
    "vintage film",
    "moody",
    "bright commercial",
    "luxury",
    "fantasy concept art"
  ];
}
