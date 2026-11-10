import { Component } from "react";
import type { ReactNode } from "react";

interface GraphErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface GraphErrorBoundaryState {
  hasError: boolean;
}

// F04, casos de error: si el renderizado del grafo falla se muestra un texto de respaldo en vez
// de tumbar la app. Se re-monta con `key` cuando llegan datos nuevos.
export class GraphErrorBoundary extends Component<GraphErrorBoundaryProps, GraphErrorBoundaryState> {
  state: GraphErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): GraphErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    console.error("[skills] Falló el render del grafo:", error.message);
  }

  render(): ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
