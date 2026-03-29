function formatTimestamp(value) {
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function HistoryPanel({ items }) {
  return (
    <aside className="panel history-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Bonus feature</p>
          <h3>Prompt history</h3>
        </div>
      </div>
      {items.length === 0 ? (
        <p className="muted">Your recent enhancements and image analyses will appear here.</p>
      ) : (
        <div className="history-list">
          {items.map((item) => (
            <article className="history-item" key={item.id}>
              <div className="history-meta">
                <span className="pill">{item.type}</span>
                <span className="muted">{formatTimestamp(item.createdAt)}</span>
              </div>
              <p>{item.title}</p>
            </article>
          ))}
        </div>
      )}
    </aside>
  );
}
