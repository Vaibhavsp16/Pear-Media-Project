import { useEffect, useMemo, useState } from "react";
import { HistoryPanel } from "./components/HistoryPanel";
import { ImageWorkflow } from "./components/ImageWorkflow";
import { TextWorkflow } from "./components/TextWorkflow";
import { ThemeToggle } from "./components/ThemeToggle";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { HISTORY_LIMIT, TABS } from "./lib/constants";

function createHistoryItem(entry) {
  return {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    ...entry,
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState("text");
  const [theme, setTheme] = useLocalStorage("pear-theme", "dark");
  const [history, setHistory] = useLocalStorage("pear-history", []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const stats = useMemo(
    () => [
      { label: "Flows", value: "2" },
      { label: "APIs", value: "Hugging Face + Stability AI" },
      { label: "Bonus", value: "History, dark mode, drag-drop, copy, download" },
    ],
    []
  );

  function handleHistoryAdd(entry) {
    setHistory((current) => [createHistoryItem(entry), ...current].slice(0, HISTORY_LIMIT));
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Production-ready prototype</p>
          <h1>Pear Media AI Studio</h1>
          <p className="hero-text">
            A single-page AI tool for prompt enhancement, image generation, image analysis, and creative variation ideation.
          </p>
        </div>
        <div className="hero-actions">
          <ThemeToggle theme={theme} onToggle={() => setTheme((current) => (current === "dark" ? "light" : "dark"))} />
        </div>
      </header>

      <section className="stats-strip">
        {stats.map((item) => (
          <article className="stat-card" key={item.label}>
            <span className="muted">{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </section>

      <nav className="tabs" aria-label="Workflow tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tab-button ${activeTab === tab.id ? "is-active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="main-grid">
        <div className="main-column">
          {activeTab === "text" ? <TextWorkflow onHistoryAdd={handleHistoryAdd} /> : null}
          {activeTab === "image" ? <ImageWorkflow onHistoryAdd={handleHistoryAdd} /> : null}
        </div>
        <HistoryPanel items={history} />
      </main>
    </div>
  );
}
