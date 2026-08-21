import { StrictMode, Component, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { ToastProvider } from './components/ui/Toast.tsx'

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null, confirmWipe: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, confirmWipe: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch() {
    /* Errors are handled by the boundary UI below */
  }

  handleWipe = () => {
    localStorage.clear();
    new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase('ChiroCardDB');
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    }).then(() => {
      window.location.reload();
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-2xl border border-zinc-200 max-w-md w-full text-center">
            <h1 className="text-xl font-bold text-red-600 mb-2">Something went wrong.</h1>
            <p className="text-sm text-zinc-600 mb-6">The application encountered an unexpected error. Your health record on this device is still saved.</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-zinc-900 text-white py-2.5 rounded-xl font-medium hover:bg-zinc-800 transition-colors"
              >
                Reload Application
              </button>
              {this.state.confirmWipe ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-left space-y-3">
                  <p className="text-sm text-red-800">This permanently deletes your health record on this device. Export a backup from Settings first if you can still open the app after a reload.</p>
                  <button
                    onClick={this.handleWipe}
                    className="w-full bg-red-600 text-white py-2.5 rounded-xl font-medium hover:bg-red-700 transition-colors"
                  >
                    Permanently delete and reload
                  </button>
                  <button
                    onClick={() => this.setState({ confirmWipe: false })}
                    className="w-full bg-white text-zinc-700 border border-zinc-200 py-2.5 rounded-xl font-medium hover:bg-zinc-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => this.setState({ confirmWipe: true })}
                  className="w-full bg-white text-red-600 border border-red-200 py-2.5 rounded-xl font-medium hover:bg-red-50 transition-colors"
                >
                  Reset local data…
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      setInterval(() => {
        registration.update().catch(() => {});
      }, 60 * 60 * 1000);

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              newWorker.postMessage('SKIP_WAITING');
            }
          });
        }
      });
    }).catch(() => {
      // Silent fail for SW registration errors
    });
  });
}
