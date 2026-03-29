export function Loader({ label = "Processing..." }) {
  return (
    <div className="loader-row" role="status" aria-live="polite">
      <span className="spinner" />
      <span>{label}</span>
    </div>
  );
}
