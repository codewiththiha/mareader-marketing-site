// playwright config — screenshots and behaviour for ci
import { defineConfig } from "@playwright/test";

export default defineConfig({
  webServer: {
    command: "npm run preview -- --host 0.0.0.0 --port 4173",
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },
  use: {
    baseURL: "http://localhost:4173",
    screenshot: "only-on-failure",
    launchOptions: {
      args: ["--disable-gpu", "--disable-dev-shm-usage"]
    }
  },
  testDir: "tests",
  outputDir: "test-results",
  timeout: 60_000,
  // one renderer at a time: headless shell SEGVs under parallel memory pressure
  workers: 1
});
