import { Component } from "react";
import { C } from "../constants/colors";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Resin error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#f87171", marginBottom: 8 }}>
            Something went wrong
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 16, lineHeight: 1.4 }}>
            {this.state.error?.message || "Unknown error"}
          </div>
          <button onClick={() => { this.setState({ error: null }); window.location.reload(); }}
            style={{ padding: "10px 24px", borderRadius: 12, border: "none",
              background: C.accent, color: "#080502", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
            Reload app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
