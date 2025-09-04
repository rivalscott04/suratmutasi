import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Disable noisy console output in production (keep errors)
if (import.meta.env.PROD) {
  const noop = (..._args: unknown[]) => {};
  console.log = noop;
  console.debug = noop;
  console.info = noop;
  console.warn = noop;
}

createRoot(document.getElementById("root")!).render(<App />);
