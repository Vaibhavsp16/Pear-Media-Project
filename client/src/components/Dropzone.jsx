import { useRef, useState } from "react";

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function Dropzone({ onFileSelect, previewUrl }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  async function handleFiles(fileList) {
    const file = fileList?.[0];
    if (!file) {
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    onFileSelect({
      file,
      dataUrl,
    });
  }

  return (
    <div
      className={`dropzone ${isDragging ? "is-dragging" : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={async (event) => {
        event.preventDefault();
        setIsDragging(false);
        await handleFiles(event.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={(event) => handleFiles(event.target.files)}
      />
      <div>
        <p className="dropzone-title">Drag and drop an image</p>
        <p className="muted">PNG, JPG, WEBP, or GIF. Works best under 1 MB for quick demos.</p>
      </div>
      <button className="ghost-button" type="button" onClick={() => inputRef.current?.click()}>
        Choose file
      </button>
      {previewUrl ? <img className="upload-preview" src={previewUrl} alt="Uploaded preview" /> : null}
    </div>
  );
}
