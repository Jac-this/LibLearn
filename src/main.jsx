import { StrictMode, Component, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const LazyApp = lazy(() => import("./App.jsx"));

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main style={{ padding: "40px", fontFamily: "system-ui, sans-serif", color: "#17243a", background: "#fff", minHeight: "100vh", boxSizing: "border-box" }}>
          <h1>LibLearn encountered an error</h1>
          <p>The application loaded, but App.jsx failed while loading or rendering.</p>
          <pre style={{ whiteSpace: "pre-wrap", marginTop: "20px", padding: "16px", background: "#f4f4f4", borderRadius: "8px", overflow: "auto" }}>
            {this.state.error?.stack || this.state.error?.message || String(this.state.error)}
          </pre>
        </main>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppErrorBoundary>
      <Suspense fallback={<main style={{ padding: "40px", fontFamily: "system-ui, sans-serif" }}><h1>Loading LibLearn…</h1></main>}>
        <LazyApp />
      </Suspense>
    </AppErrorBoundary>
  </StrictMode>,
);
