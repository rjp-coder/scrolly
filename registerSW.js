export function registerSW() {
  console.log("Registering SW");
  if (!("serviceWorker" in navigator)) return;
  console.log("SW in navigator");

  console.log("adding ev listener on load");
  window.addEventListener("load", async () => {
    console.log("about to register");
    const promise = navigator.serviceWorker
      .register("./sw.js")
      .catch((err) => console.warn("SW registration failed:", err));
    await promise;
    console.log("registration successful");
  });
}
