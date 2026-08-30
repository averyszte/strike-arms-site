import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { verifySupabaseConfig } from "./src/lib/verify-supabase-config";

// PORT and BASE_PATH were required because Replit injected both. Nothing
// injects them now, and this file is evaluated for every command -- so a
// missing PORT threw before `vite build` had done anything, which is a
// confusing way for a deploy to fail over a variable a build does not use.
//
// Both now have defaults. A value that IS supplied is still validated: falling
// back to 5173 because someone typed PORT=0 would start a server on the wrong
// port and say nothing.

const DEFAULT_PORT = 5173;

const rawPort = process.env.PORT;
const port = rawPort ? Number(rawPort) : DEFAULT_PORT;

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Served from the domain root. Cloudflare Pages does not set this, and a base
// of "" rather than "/" produces asset URLs relative to the current path, which
// works on / and 404s on every nested route.
const basePath = process.env.BASE_PATH || "/";

export default defineConfig(async ({ mode }) => {
  // Fail the build rather than shipping a bundle whose Supabase credentials are
  // absent, still placeholders, or from two different projects. These values are
  // inlined here, so this is the last point at which the cause is still obvious.
  const clientEnv = loadEnv(mode, import.meta.dirname, "VITE_");
  verifySupabaseConfig(
    clientEnv.VITE_SUPABASE_URL ?? "",
    clientEnv.VITE_SUPABASE_ANON_KEY ?? "",
  );

  return {
    base: basePath,
    plugins: [
      react(),
      tailwindcss(),
      runtimeErrorOverlay(),
      ...(process.env.NODE_ENV !== "production" &&
      process.env.REPL_ID !== undefined
        ? [
            await import("@replit/vite-plugin-cartographer").then((m) =>
              m.cartographer({
                root: path.resolve(import.meta.dirname, ".."),
              }),
            ),
            await import("@replit/vite-plugin-dev-banner").then((m) =>
              m.devBanner(),
            ),
          ]
        : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
        "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
      },
      dedupe: ["react", "react-dom"],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      port,
      strictPort: true,
      host: "0.0.0.0",
      allowedHosts: true,
      fs: {
        strict: true,
      },
    },
    preview: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
    },
  };
});
