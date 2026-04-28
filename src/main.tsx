import { StrictMode, Component, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { ToastProvider } from './components/ui/Toast.tsx'

// Force Dark Mode
// Force Dark Mode - Removed for Light Mode conversion
// document.documentElement.classList.add('dark');

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch() {
    /* Errors are handled by the boundary UI below */
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-zinc-200 max-w-md w-full text-center">
            <h1 className="text-xl font-bold text-red-600 mb-2">Something went wrong.</h1>
            <p className="text-sm text-zinc-600 mb-6">The application encountered an unexpected error.</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-zinc-900 text-white py-2.5 rounded-xl font-medium hover:bg-zinc-800 transition-colors"
              >
                Reload Application
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  new Promise<void>((resolve) => {
                    const req = indexedDB.deleteDatabase('ChiroCardDB');
                    req.onsuccess = () => resolve();
                    req.onerror = () => resolve();
                  }).then(() => {
                    window.location.reload();
                  });
                }}
                className="w-full bg-white text-red-600 border border-red-200 py-2.5 rounded-xl font-medium hover:bg-red-50 transition-colors"
              >
                Clear Data & Reload
              </button>
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

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      // Check for updates every 60 minutes
      setInterval(() => {
        registration.update().catch(() => {});
      }, 60 * 60 * 1000);

      // Notify user when a new service worker is waiting
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available — prompt user to refresh
              if (confirm('A new version of ChiroCard is available. Reload to update?')) {
                window.location.reload();
              }
            }
          });
        }
      });
    }).catch(() => {
      // Silent fail for SW registration errors
    });
  });
}
