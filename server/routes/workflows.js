import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/errors.js";
import { parseDataUrl } from "../utils/image.js";
import { analyzeImage, enhancePrompt } from "../services/huggingFaceService.js";
import { generateImages, generateVariations } from "../services/stabilityService.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true, service: "pear-media-ai-studio" });
});

router.post(
  "/text/enhance",
  asyncHandler(async (req, res) => {
    const { prompt, style = "realistic" } = req.body || {};
    const result = await enhancePrompt({ prompt, style });

    res.json(result);
  })
);

router.post(
  "/text/generate",
  asyncHandler(async (req, res) => {
    const {
      prompt,
      style = "realistic",
      negativePrompt = "",
      numberOfImages = 3,
      aspectRatio = "1:1",
    } = req.body || {};

    const images = await generateImages({
      prompt,
      style,
      negativePrompt,
      numberOfImages,
      aspectRatio,
    });

    res.json({ images });
  })
);

router.post(
  "/image/analyze",
  asyncHandler(async (req, res) => {
    const { imageDataUrl, variationGoal = "Create similar premium variations", style = "realistic" } =
      req.body || {};
    const { buffer, mimeType } = parseDataUrl(imageDataUrl);
    const result = await analyzeImage({
      imageBuffer: buffer,
      mimeType,
      variationGoal,
      style,
    });

    res.json(result);
  })
);

router.post(
  "/image/variations",
  asyncHandler(async (req, res) => {
    const {
      imageDataUrl,
      prompt,
      style = "realistic",
      numberOfImages = 3,
    } = req.body || {};

    parseDataUrl(imageDataUrl);
    const images = await generateVariations({
      prompt,
      style,
      numberOfImages,
    });

    res.json({ images });
  })
);

router.use((_req, _res, next) => {
  next(new AppError("The requested API route was not found.", 404));
});

export default router;
