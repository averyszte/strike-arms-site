import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import { AlertTriangle } from 'lucide-react';

import { CTA_PRIMARY, CTA_SECONDARY } from '@/lib/storefront-styles';

/**
 * The last line of defence for a render crash.
 *
 * Without it one component throwing unmounts the whole app and leaves a blank
 * white page. The fallback is deliberately standalone, with no header or
 * footer, because the layout may be the thing that threw. Navigating clears
 * it, so the header links still work once the page behind them renders.
 */

type BoundaryProps = { resetKey: string; children: ReactNode };
type BoundaryState = { hasError: boolean };

class ErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Render error', error, info.componentStack);
  }

  componentDidUpdate(previous: BoundaryProps) {
    if (this.state.hasError && previous.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    return this.state.hasError ? <CrashFallback /> : this.props.children;
  }
}

function CrashFallback() {
  return (
    <main
      role="alert"
      className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center"
    >
      <AlertTriangle className="mb-4 h-10 w-10 text-muted-foreground" aria-hidden="true" />
      <h1 className="mb-2 text-2xl font-black uppercase tracking-tight text-foreground">
        Something went wrong
      </h1>
      <p className="mb-8 max-w-md text-sm text-muted-foreground">
        This page hit an error. Reloading usually fixes it. If it keeps happening, get in touch
        and let us know which page it was.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" className={CTA_PRIMARY} onClick={() => window.location.reload()}>
          Reload the page
        </button>
        {/* A full navigation, not a router link: it starts the app fresh. */}
        <a href="/" className={CTA_SECONDARY}>
          Go to the homepage
        </a>
      </div>
    </main>
  );
}

export function AppErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}
