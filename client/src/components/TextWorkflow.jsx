import { useMemo, useState } from "react";
import { api } from "../lib/api";
import { ASPECT_OPTIONS, STYLE_OPTIONS } from "../lib/constants";
import { ImageCard } from "./ImageCard";
import { Loader } from "./Loader";

async function copyText(value) {
  await navigator.clipboard.writeText(value);
}

export function TextWorkflow({ onHistoryAdd }) {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("realistic");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [enhancement, setEnhancement] = useState(null);
  const [images, setImages] = useState([]);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState("");

  const canGenerate = Boolean(enhancement?.enhancedPrompt);

  const keywordList = useMemo(() => enhancement?.keywords || [], [enhancement]);

  async function handleEnhance() {
    try {
      setError("");
      setLoadingStep("Enhancing your prompt");
      setImages([]);
      const result = await api.enhancePrompt({ prompt, style });
      setEnhancement(result);
      onHistoryAdd({
        type: "Text",
        title: result.enhancedPrompt,
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoadingStep("");
    }
  }

  async function handleGenerate() {
    try {
      setError("");
      setLoadingStep("Generating image variations");
      const result = await api.generateFromPrompt({
        prompt: enhancement.enhancedPrompt,
        style,
        negativePrompt: enhancement.negativePrompt,
        aspectRatio,
        numberOfImages: 3,
      });
      setImages(result.images || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoadingStep("");
    }
  }

  return (
    <section className="workflow-grid">
      <div className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Text to image</p>
            <h2>Turn a rough idea into a polished image prompt</h2>
          </div>
        </div>

        <label className="field">
          <span>Original prompt</span>
          <textarea
            rows="6"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Example: A premium skincare product launch image with glossy bottles on marble."
          />
        </label>

        <div className="field-row">
          <label className="field">
            <span>Style</span>
            <select value={style} onChange={(event) => setStyle(event.target.value)}>
              {STYLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Aspect ratio</span>
            <select value={aspectRatio} onChange={(event) => setAspectRatio(event.target.value)}>
              {ASPECT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="action-row">
          <button className="primary-button" type="button" onClick={handleEnhance} disabled={!prompt.trim() || Boolean(loadingStep)}>
            Enhance prompt
          </button>
          {canGenerate ? (
            <button className="ghost-button" type="button" onClick={handleGenerate} disabled={Boolean(loadingStep)}>
              Generate images
            </button>
          ) : null}
        </div>

        {loadingStep ? <Loader label={loadingStep} /> : null}
        {error ? <p className="error-text">{error}</p> : null}
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Approval step</p>
            <h3>Enhanced prompt</h3>
          </div>
          {enhancement?.enhancedPrompt ? (
            <button className="ghost-button" type="button" onClick={() => copyText(enhancement.enhancedPrompt)}>
              Copy prompt
            </button>
          ) : null}
        </div>

        {enhancement ? (
          <>
            <div className="insight-grid">
              <article className="insight-card">
                <span className="muted">Tone</span>
                <strong>{enhancement.tone}</strong>
              </article>
              <article className="insight-card">
                <span className="muted">Intent</span>
                <strong>{enhancement.intent}</strong>
              </article>
            </div>

            <label className="field">
              <span>Enhanced prompt</span>
              <textarea rows="8" value={enhancement.enhancedPrompt} readOnly />
            </label>

            <label className="field">
              <span>Negative prompt</span>
              <textarea rows="3" value={enhancement.negativePrompt} readOnly />
            </label>

            <div className="pill-row">
              {keywordList.map((keyword) => (
                <span className="pill" key={keyword}>
                  {keyword}
                </span>
              ))}
            </div>

            <p className="muted">{enhancement.rationale}</p>

            <div className="action-row">
              <button className="primary-button" type="button" onClick={handleGenerate} disabled={Boolean(loadingStep)}>
                Approve and generate
              </button>
              {images.length > 0 ? (
                <button className="ghost-button" type="button" onClick={handleGenerate} disabled={Boolean(loadingStep)}>
                  Regenerate
                </button>
              ) : null}
            </div>
          </>
        ) : (
          <p className="muted">We will show tone, keywords, the rewritten prompt, and a negative prompt here.</p>
        )}

        {images.length > 0 ? (
          <div className="results-grid">
            {images.map((src, index) => (
              <ImageCard key={src + index} src={src} index={index} label="Generated image" />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
