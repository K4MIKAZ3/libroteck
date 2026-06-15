"use client";

declare global {
  interface Window {
    googlefc?: {
      showRevocationMessage?: () => void;
    };
  }
}

export function CookieSettingsLink() {
  function openCookieSettings() {
    window.googlefc?.showRevocationMessage?.();
  }

  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className="text-[#ffd600] underline-offset-2 hover:underline"
    >
      Configuración de cookies
    </button>
  );
}
