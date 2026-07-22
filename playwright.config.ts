import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./apps/docs/tests",
  fullyParallel: true,
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1586, height: 992 } } },
    { name: "mobile", use: { ...devices["iPhone 13"], browserName: "chromium", viewport: { width: 426, height: 923 }, deviceScaleFactor: 2 } }
  ],
  webServer: {
    command: "pnpm --filter chrome-docs preview",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true
  }
});
