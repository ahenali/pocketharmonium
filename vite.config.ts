import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

// Plain Vite config (no third-party wrapper packages).
// Order matters: tsconfig paths -> tailwind -> tanstack start -> react -> nitro.
export default defineConfig({
  plugins: [
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart({
      server: { entry: "server" },
    }),
    viteReact(),
    // Handles the production server build. Defaults to the "node-server"
    // preset; override with e.g. `NITRO_PRESET=cloudflare` if you deploy
    // elsewhere, or pass { config: { preset: "..." } } here.
    nitro(),
  ],
  resolve: {
    dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-start"],
  },
});
