export function registerSW() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    // Derive the base path so this works regardless of repo name on GitHub Pages
    const base = import.meta.env.BASE_URL;
    navigator.serviceWorker
      .register(`${base}sw.js`)
      .then((reg) => console.log("SW registered, scope:", reg.scope))
      .catch((err) => console.error("SW registration failed:", err));
  });
}

