// playwright config — screenshots for ci
import { defineConfig } from "@playwright/test";

export default defineConfig({
  webServer: {
    command: "npm run preview -- --host 0.0.0.0 --port 4173",
    port: 4173,
    reuseExistingServer: false,
    timeout: 120_000
  },
  use: {
    baseURL: "http://localhost:4173",
    screenshot: "on"
  },
  testDir: "tests",
  outputDir: "test-results",
  timeout: 30_000
});
