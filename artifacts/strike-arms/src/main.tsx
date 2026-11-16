import { createRoot, hydrateRoot } from "react-dom/client";
import { hydrate } from "@tanstack/react-query";
import App from "./App";
import { CHUNK_RELOAD_KEY, shouldReloadForChunkError } from "@/lib/chunk-reload-guard";
import { createQueryClient } from "@/lib/create-query-client";
import {
  PRERENDERED_PATH_ATTRIBUTE,
  PRERENDER_TAG_ATTRIBUTE,
  QUERY_STATE_ELEMENT_ID,
} from "@/lib/prerender-html";
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

/** The prerendered React Query cache, or undefined when there is none. */
function readQueryState(): unknown {
  const text = document.getElementById(QUERY_STATE_ELEMENT_ID)?.textContent;
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

// Helmet adds its own head tags and does not de-duplicate, so the copies the
// prerender put there (scripts/prerender.mjs) go before React starts.
document.querySelectorAll(`[${PRERENDER_TAG_ATTRIBUTE}]`).forEach((tag) => tag.remove());

const root = document.getElementById("root")!;
const queryClient = createQueryClient();
const queryState = readQueryState();
// Hydrate only HTML rendered for this exact path. Anything else (the plain
// shell, or a page served for the wrong path) is rendered from scratch.
const isPrerendered =
  root.getAttribute(PRERENDERED_PATH_ATTRIBUTE) === window.location.pathname &&
  queryState !== undefined;

if (isPrerendered) {
  hydrate(queryClient, queryState);
  hydrateRoot(root, <App queryClient={queryClient} isHydrating />);
} else {
  root.replaceChildren();
  createRoot(root).render(<App queryClient={queryClient} />);
}
