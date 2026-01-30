"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0d1117] to-[#161b22] flex items-center justify-center px-5" style={{ minHeight: '100dvh' }}>
          <div className="text-white text-center max-w-[430px]">
            <p className="text-lg mb-4">Une erreur s'est produite</p>
            <p className="text-sm text-white/60">Rechargez la page pour réessayer</p>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
