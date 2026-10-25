import { useLocation } from "wouter";
import { PREVIEW_PARAM, shouldShowComingSoon } from "@/lib/coming-soon-gate";

const PREVIEW_STORAGE_KEY = "strike-arms-preview";

/** Remembers ?preview on this browser, so the full site stays open after it. */
function hasPreviewPass(): boolean {
  try {
    if (new URLSearchParams(window.location.search).has(PREVIEW_PARAM)) {
      window.localStorage.setItem(PREVIEW_STORAGE_KEY, "1");
      return true;
    }
    return window.localStorage.getItem(PREVIEW_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function useComingSoon(): boolean {
  const [pathname] = useLocation();
  return shouldShowComingSoon(window.location.hostname, pathname, hasPreviewPass());
}
