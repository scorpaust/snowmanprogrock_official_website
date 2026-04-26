import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register Service Worker for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('✅ Service Worker registered successfully:', registration.scope);

        // Check for updates immediately on load
        registration.update();

        // Listen for new service worker installations
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // A new service worker is available - tell it to take over and reload
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });

        // Reload the page once the new service worker takes control
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing) return;
          refreshing = true;
          window.location.reload();
        });
      })
      .catch((error) => {
        console.warn('⚠️ Service Worker registration failed (expected in development):', error.message);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
