import { Component, lazy, Suspense, type ErrorInfo, type ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

type WidgetModule = { default?: React.ComponentType };
type WidgetLoader = () => Promise<WidgetModule>;

const widgetLoaders = import.meta.glob<WidgetModule>([
  "./components/*.tsx",
  "./editors/*.tsx",
  "./dialogs/*.tsx",
  "./charts/*.tsx",
  "./filters/*.tsx",
  "./stats/*.tsx",
  "./views/*.tsx",
]) as Record<string, WidgetLoader>;

function widgetName(path: string): string {
  return path.split("/").pop()?.replace(/\.tsx$/, "") ?? path;
}

const widgets = Object.entries(widgetLoaders)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, load]) => ({
    name: widgetName(path),
    Component: lazy(async () => {
      const module = await load();
      if (!module.default) throw new Error(`${widgetName(path)} does not export a default component`);
      return { default: module.default };
    }),
  }));

class WidgetErrorBoundary extends Component<
  { name: string; children: ReactNode },
  { error: Error | null; retryKey: number }
> {
  state = { error: null, retryKey: 0 };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`Widget ${this.props.name} failed`, error, info.componentStack);
  }

  retry = () => this.setState((state) => ({ error: null, retryKey: state.retryKey + 1 }));

  render() {
    if (this.state.error) {
      return (
        <section role="alert" aria-label={`${this.props.name} failed`}>
          <h2>{this.props.name}</h2>
          <p>This widget could not be rendered.</p>
          <button type="button" onClick={this.retry}>Retry</button>
        </section>
      );
    }
    return <div key={this.state.retryKey}>{this.props.children}</div>;
  }
}

const PAGE_SIZE = 12;

export function App() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const shown = useMemo(
    () => widgets.filter((widget) => widget.name.toLowerCase().includes(query.trim().toLowerCase())),
    [query],
  );
  const pageCount = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageWidgets = shown.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => setPage(1), [query]);

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 16 }}>
      <h1>Snaclite widgets ({shown.length}/{widgets.length})</h1>
      <label htmlFor="widget-filter">Filter widgets</label>
      <input id="widget-filter" placeholder="Filter widgets" value={query} onChange={(e) => setQuery(e.target.value)} />
      <p aria-live="polite">Page {currentPage} of {pageCount}</p>
      <nav aria-label="Widget pages">
        <button type="button" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
        <button type="button" disabled={currentPage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Next</button>
      </nav>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16, marginTop: 16 }}>
        {pageWidgets.map(({ name, Component }) => (
          <WidgetErrorBoundary key={name} name={name}>
            <Suspense fallback={<p role="status">Loading {name}…</p>}>
              <Component />
            </Suspense>
          </WidgetErrorBoundary>
        ))}
      </div>
    </main>
  );
}

export default App;
