import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    // Playwright owns tests/, vitest owns the unit tests sitting beside the source.
    exclude: [...configDefaults.exclude, "tests/**"],
  },
});
