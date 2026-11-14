import { createRoot } from "react-dom/client";
import App from "./App";
import { CHUNK_RELOAD_KEY, shouldReloadForChunkError } from "@/lib/chunk-reload-guard";
import "./index.css";

// A page chunk from before the latest deploy failed to load: reload once to
// pick up the new build, but never more than once in a short spell.
window.addEventListener("vite:preloadError", (event) => {
  try {
    const now = Date.now();
    if (!shouldReloadForChunkError(sessionStorage.getItem(CHUNK_RELOAD_KEY), now)) return;
    sessionStorage.setItem(CHUNK_RELOAD_KEY, String(now));
  } catch {
    // No sessionStorage (private mode, blocked storage): let the error show.
    return;
  }
  event.preventDefault();
  window.location.reload();
});

createRoot(document.getElementById("root")!).render(<App />);
