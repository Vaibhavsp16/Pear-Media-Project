export function ThemeToggle({ theme, onToggle }) {
  return (
    <button className="ghost-button" type="button" onClick={onToggle}>
      {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
    </button>
  );
}
