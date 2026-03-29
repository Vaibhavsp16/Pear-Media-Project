import { useState } from "react";
import { api } from "../lib/api";
import { STYLE_OPTIONS } from "../lib/constants";
import { Dropzone } from "./Dropzone";
import { ImageCard } from "./ImageCard";
import { Loader } from "./Loader";

export function ImageWorkflow({ onHistoryAdd }) {
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [style, setStyle] = useState("cinematic");
  const [variationGoal, setVariationGoal] = useState(
    "Create premium stylistic variations suitable for a marketing concept board."
  );
  const [analysis, setAnalysis] = useState(null);
  const [images, setImages] = useState([]);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState("");

  async function handleAnalyze() {
    try {
      setError("");
      setLoadingStep("Analyzing uploaded image");
      setImages([]);
      const result = await api.analyzeImage({
        imageDataUrl,
        variationGoal,
        style,
      });
      setAnalysis(result);
      onHistoryAdd({
        type: "Image",
        title: result.summary,
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoadingStep("");
    }
  }

  async function handleGenerateVariations() {
    try {
      setError("");
      setLoadingStep("Generating image variations");
      const result = await api.generateVariations({
        imageDataUrl,
        prompt: analysis?.variationPrompt || variationGoal,
        style,
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
            <p className="eyebrow">Image to variations</p>
            <h2>Upload an image and generate related creative directions</h2>
          </div>
        </div>

        <Dropzone previewUrl={imageDataUrl} onFileSelect={({ dataUrl }) => setImageDataUrl(dataUrl)} />

        <div className="field-row">
          <label className="field">
            <span>Target style</span>
            <select value={style} onChange={(event) => setStyle(event.target.value)}>
              {STYLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          <span>Variation brief</span>
          <textarea
            rows="4"
            value={variationGoal}
            onChange={(event) => setVariationGoal(event.target.value)}
            placeholder="Example: Keep the hero object but explore editorial lighting and premium brand styling."
          />
        </label>

        <div className="action-row">
          <button
            className="primary-button"
            type="button"
            onClick={handleAnalyze}
            disabled={!imageDataUrl || Boolean(loadingStep)}
          >
            Analyze image
          </button>
          {analysis ? (
            <button className="ghost-button" type="button" onClick={handleGenerateVariations} disabled={Boolean(loadingStep)}>
              Generate variations
            </button>
          ) : null}
        </div>

        {loadingStep ? <Loader label={loadingStep} /> : null}
        {error ? <p className="error-text">{error}</p> : null}
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Analysis results</p>
            <h3>Detected caption, style, and variation prompt</h3>
          </div>
        </div>

        {analysis ? (
          <>
            <p>{analysis.summary}</p>
            {analysis.warning ? <p className="muted">{analysis.warning}</p> : null}

            <div className="insight-grid">
              <article className="insight-card">
                <span className="muted">Caption</span>
                <strong>{analysis.caption}</strong>
              </article>
              <article className="insight-card">
                <span className="muted">Detected style</span>
                <strong>{analysis.detectedStyle}</strong>
              </article>
            </div>

            <div className="detail-block">
              <span className="muted">Objects</span>
              <div className="pill-row">
                {analysis.objects.map((item) => (
                  <span className="pill" key={item.label}>
                    {item.label} {item.score}%
                  </span>
                ))}
              </div>
            </div>

            <div className="detail-block">
              <span className="muted">Style signals</span>
              <div className="pill-row">
                {analysis.styles.map((item) => (
                  <span className="pill" key={item.label}>
                    {item.label} {item.score}%
                  </span>
                ))}
              </div>
            </div>

            <label className="field">
              <span>Variation prompt</span>
              <textarea rows="6" readOnly value={analysis.variationPrompt} />
            </label>

            <div className="action-row">
              <button className="primary-button" type="button" onClick={handleGenerateVariations} disabled={Boolean(loadingStep)}>
                Generate stylistic variations
              </button>
              {images.length > 0 ? (
                <button className="ghost-button" type="button" onClick={handleGenerateVariations} disabled={Boolean(loadingStep)}>
                  Regenerate
                </button>
              ) : null}
            </div>
          </>
        ) : (
          <p className="muted">Upload an image to detect caption, object cues, style hints, and a prompt for follow-up generation.</p>
        )}

        {images.length > 0 ? (
          <div className="results-grid">
            {images.map((src, index) => (
              <ImageCard key={src + index} src={src} index={index} label="Variation" />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
