import { FormEvent, useState } from "react";
import Button from "../common/Button";
import { environments } from "../../data/mock";
import { useAppStore } from "../../store/appStore";

export default function Topbar() {
  const [query, setQuery] = useState("");
  const environment = useAppStore((state) => state.environment);
  const setEnvironment = useAppStore((state) => state.setEnvironment);
  const darkMode = useAppStore((state) => state.darkMode);
  const toggleDarkMode = useAppStore((state) => state.toggleDarkMode);
  const pushToast = useAppStore((state) => state.pushToast);

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    pushToast({
      type: "info",
      message: query ? `Searching for "${query}"` : "Enter API, path, service, route, correlation ID or execution ID."
    });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-ink-200/70 bg-white/80 px-4 py-3 backdrop-blur dark:border-ink-800 dark:bg-ink-950/80">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-600 dark:text-ink-200">Environment</label>
          <select
            value={environment}
            onChange={(event) => setEnvironment(event.target.value as typeof environment)}
            className="rounded-lg border border-ink-300 bg-white px-2 py-1.5 text-sm dark:border-ink-700 dark:bg-ink-900"
          >
            {environments.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <Button tone="secondary" onClick={toggleDarkMode}>
            {darkMode ? "Light Theme" : "Dark Theme"}
          </Button>
        </div>

        <form onSubmit={onSearch} className="flex items-center gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Global search: API, path, route, execution, correlation..."
            className="w-[340px] max-w-[60vw] rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm placeholder:text-ink-400 dark:border-ink-700 dark:bg-ink-900"
          />
          <Button type="submit">Search</Button>
        </form>
      </div>
    </header>
  );
}
