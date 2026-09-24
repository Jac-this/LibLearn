import { StrictMode, Component } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

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
        <main style={{ padding: "40px", fontFamily: "system-ui, sans-serif", color: "#17243a" }}>
          <h1>LibLearn encountered an error</h1>
          <p>The app started, but a runtime error prevented the page from rendering.</p>
          <pre style={{ whiteSpace: "pre-wrap", marginTop: "20px", padding: "16px", background: "#f4f4f4", borderRadius: "8px" }}>
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
      <App />
    </AppErrorBoundary>
  </StrictMode>,
);
