import { expect, test, type Page } from "@playwright/test";

const routes = [
  "/",
  "/foundations",
  "/foundations/buttons",
  "/components",
  "/components/base",
  "/components/blocks",
  "/components/charts",
  "/components/button",
  "/components/combobox",
  "/components/tree-view",
  "/templates/dashboard",
  "/templates/control-room",
  "/templates/finance-desk",
  "/templates/agent-console",
  "/templates/analytics",
  "/templates/settings"
];

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}

async function horizontalOverflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
}

for (const route of routes) {
  test(`${route} renders one heading without errors or sideways scroll`, async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
}

test("every route stays overflow free across breakpoints", async ({ page, isMobile }) => {
  test.skip(isMobile, "the desktop project owns the breakpoint matrix");
  test.setTimeout(120_000); // 16 routes × 4 widths
  for (const width of [1440, 1024, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(await horizontalOverflow(page), `${route} at ${width}px`).toBeLessThanOrEqual(0);
    }
  }
});

test("unknown routes fall back to the landing page", async ({ page }) => {
  await page.goto("/no-such-page");
  await expect(page).toHaveURL(/\/$/);
});

test("text selection keeps accessible contrast in both themes", async ({ page }) => {
  await page.goto("/components");
  const ratios = await page.getByRole("heading", { level: 1 }).evaluate((element) => {
    const root = element.closest<HTMLElement>(".chrome-root")!;
    const luminance = (value: string) => {
      const [r = 0, g = 0, b = 0] = value.match(/[\d.]+/g)!.slice(0, 3).map((channel) => {
        const normalized = Number(channel) / 255;
        return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return r * 0.2126 + g * 0.7152 + b * 0.0722;
    };
    return (["ink", "satin"] as const).map((theme) => {
      root.dataset.chromeTheme = theme;
      const selection = getComputedStyle(element, "::selection");
      const foreground = luminance(selection.color);
      const background = luminance(selection.backgroundColor);
      return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
    });
  });
  for (const ratio of ratios) expect(ratio).toBeGreaterThanOrEqual(4.5);
});
