import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // The docs build from the package source, so package edits hot-reload; the published dist is checked by test:package.
  resolve: {
    alias: [
      { find: /^@loreanai\/chrome-ui$/, replacement: fileURLToPath(new URL("../../packages/chrome-ui/src/index.ts", import.meta.url)) },
      { find: /^@loreanai\/chrome-ui\/styles\.css$/, replacement: fileURLToPath(new URL("../../packages/chrome-ui/src/index.css", import.meta.url)) }
    ]
  },
  server: { port: 4173, strictPort: true },
  preview: { port: 4173, strictPort: true }
});
