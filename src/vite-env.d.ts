/// <reference types="vite/client" />

declare global {
  interface Window {
    showSessionExpiredModal?: () => void;
    dispatchTokenUpdate?: (token: string) => void;
  }
}
export {};
