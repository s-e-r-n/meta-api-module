import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

const server_only_stub = {
  name: "server-only-stub",
  enforce: "pre" as const,
  resolveId: (id: string) =>
    id === "server-only" ? "\0server-only" : undefined,
  load: (id: string) => (id === "\0server-only" ? "export {}" : undefined),
};

export default defineConfig({
  plugins: [react(), server_only_stub],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    exclude: [...configDefaults.exclude, "tests/**"],
  },
});
