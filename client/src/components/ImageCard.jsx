import { useEffect, useState } from "react";

async function getObjectUrl(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

async function downloadImage(url, filename) {
  const downloadUrl = await getObjectUrl(url);
  const anchor = document.createElement("a");
  anchor.href = downloadUrl;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(downloadUrl);
}

export function ImageCard({ src, index, label }) {
  const [openUrl, setOpenUrl] = useState(src.startsWith("data:") ? "" : src);

  useEffect(() => {
    let isActive = true;
    let objectUrl = "";

    async function prepareOpenUrl() {
      if (!src.startsWith("data:")) {
        setOpenUrl(src);
        return;
      }

      objectUrl = await getObjectUrl(src);
      if (isActive) {
        setOpenUrl(objectUrl);
      } else {
        URL.revokeObjectURL(objectUrl);
      }
    }

    prepareOpenUrl();

    return () => {
      isActive = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  return (
    <article className="image-card">
      <img className="result-image" src={src} alt={`${label} ${index + 1}`} loading="lazy" />
      <div className="image-card-footer">
        <span>{label} {index + 1}</span>
        <div className="inline-actions">
          <button
            className="ghost-button"
            type="button"
            onClick={() => downloadImage(src, `${label.toLowerCase().replace(/\s+/g, "-")}-${index + 1}.jpg`)}
          >
            Download
          </button>
          <a
            className="ghost-button"
            href={openUrl || "#"}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!openUrl}
            onClick={(event) => {
              if (!openUrl) {
                event.preventDefault();
              }
            }}
          >
            Open
          </a>
        </div>
      </div>
    </article>
  );
}
