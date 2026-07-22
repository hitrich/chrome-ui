import { expect, test } from "@playwright/test";

test("landing presents the approved content and routes into components", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Chrome/);
  await expect(page.getByRole("heading", { level: 1, name: "Interfaces forged from reflected color." })).toBeVisible();
  await expect(page.getByText("pnpm add @loreanai/chrome-ui")).toBeVisible();
  await page.getByRole("link", { name: /Explore components/ }).click();
  await expect(page).toHaveURL(/\/components\/button/);
  await expect(page.getByRole("heading", { level: 1, name: "Button" })).toBeVisible();
});

test("landing dialog completion closes the overlay and restores focus", async ({ page, isMobile }) => {
  test.skip(isMobile, "the compact landing intentionally omits the dialog sample");
  await page.goto("/");
  const trigger = page.getByRole("button", { name: /Open dialog/ });
  await trigger.click();
  await expect(page.getByRole("dialog", { name: "Material detail" })).toBeVisible();
  await page.getByRole("button", { name: "Understood" }).click();
  await expect(page.getByRole("dialog", { name: "Material detail" })).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("theme selection persists across reloads", async ({ page, isMobile }) => {
  await page.goto("/components/button");
  if (isMobile) await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "Ink", exact: true }).click();
  await expect(page.getByRole("button", { name: "Ink", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(page.locator(".chrome-root").first()).toHaveAttribute("data-chrome-theme", "ink");
});

test("component preview state changes real control behavior", async ({ page }) => {
  await page.goto("/components/button");
  await page.getByRole("button", { name: "Disabled", exact: true }).click();
  await expect(page.getByRole("button", { name: /Create project/ }).first()).toBeDisabled();
});

test("structured disabled examples are programmatic and visibly subdued", async ({ page }) => {
  await page.goto("/components/select");
  const disabledSelect = page.getByRole("combobox", { name: "Unavailable input" });
  await expect(disabledSelect).toBeDisabled();
  expect(Number.parseFloat(await disabledSelect.evaluate((element) => getComputedStyle(element).opacity))).toBeLessThan(0.5);

  await page.goto("/components/switch");
  const disabledSwitch = page.getByRole("switch", { name: "Unavailable setting" });
  await expect(disabledSwitch).toBeDisabled();
  await expect(disabledSwitch).toHaveAttribute("data-state", "checked");

  await page.goto("/components/select");
  await page.getByRole("combobox", { name: "Input source" }).first().click();
  const disabledOption = page.getByRole("option", { name: "Line input unavailable" });
  await expect(disabledOption).toHaveAttribute("data-disabled", "");
  expect(Number.parseFloat(await disabledOption.evaluate((element) => getComputedStyle(element).opacity))).toBeLessThan(0.5);
  await disabledOption.click({ force: true });
  await expect(disabledOption).toBeVisible();
  await expect(page.getByRole("option", { name: "Analog 4" })).toHaveAttribute("data-state", "checked");

  await page.goto("/components/dropdown");
  await page.getByRole("button", { name: /Project actions/ }).click();
  const disabledMenuItem = page.getByRole("menuitem", { name: "Delete unavailable" });
  await expect(disabledMenuItem).toHaveAttribute("data-disabled", "");
  expect(Number.parseFloat(await disabledMenuItem.evaluate((element) => getComputedStyle(element).opacity))).toBeLessThan(0.5);
  await disabledMenuItem.click({ force: true });
  await expect(page.getByRole("menuitem", { name: "Delete unavailable" })).toBeVisible();
});

test("component usage can be copied and playground controls update the preview", async ({ page }) => {
  await page.goto("/components/button");
  await page.getByRole("button", { name: "Copy usage" }).click();
  await expect(page.getByRole("button", { name: "Usage copied" })).toBeVisible();
  await page.goto("/playground");
  await page.getByRole("textbox", { name: "Label" }).fill("Launch sequence");
  await expect(page.getByRole("button", { name: /Launch sequence/ })).toBeVisible();
  await expect(page.getByText('<Button variant="primary" size="lg">Launch sequence</Button>', { exact: true })).toBeVisible();
  await page.getByRole("switch", { name: "Directional icon" }).click();
  await expect(page.getByRole("switch", { name: "Directional icon" })).toHaveAttribute("aria-checked", "false");
});

test("clipboard fallback restores focus and cleans up after a denied copy", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error("Permission denied")) }
    });
    document.execCommand = () => { throw new Error("Clipboard unavailable"); };
  });
  await page.goto("/");
  const copyButton = page.locator(".install-command");
  await copyButton.click();
  await expect(copyButton).toHaveAttribute("data-status", "error");
  await expect(copyButton).toBeFocused();
  await expect(page.locator("textarea[readonly]")).toHaveCount(0);
});

test("mobile navigation opens and reaches foundations", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile-only flow");
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("dialog", { name: "Navigate Chrome" })).toBeVisible();
  await page.getByRole("link", { name: "Foundations" }).click();
  await expect(page).toHaveURL(/\/foundations\/color/);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("link", { name: "Slider", exact: true }).click();
  await expect(page).toHaveURL(/\/components\/slider/);
});

test("full motion remains available when the operating system requests reduction", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/components/button");
  const root = page.locator(".chrome-root").first();
  const button = page.getByRole("button", { name: /Create project/ }).first();
  const reducedDuration = await button.evaluate((element) => Number.parseFloat(getComputedStyle(element).transitionDuration));
  await root.evaluate((element) => element.setAttribute("data-chrome-motion", "full"));
  const fullDuration = await button.evaluate((element) => Number.parseFloat(getComputedStyle(element).transitionDuration));
  expect(fullDuration).toBeGreaterThan(reducedDuration);
});

test("mobile landing has no horizontal overflow and preserves touch targets", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile-only layout contract");
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  const targets = [
    page.getByRole("button", { name: "Open navigation" }),
    page.getByRole("link", { name: /Explore components/ }),
    page.getByRole("textbox", { name: "Email" }),
    page.getByRole("switch", { name: "Motion" }),
    page.getByRole("tab", { name: "Preview" }),
    page.getByRole("slider", { name: "Intensity" })
  ];
  for (const target of targets) {
    const box = await target.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});

test("landing remains overflow free across responsive breakpoints", async ({ page, isMobile }) => {
  test.skip(isMobile, "the desktop project owns the breakpoint matrix");
  await page.goto("/");
  for (const width of [320, 360, 390, 426, 760, 761, 900, 901, 1024, 1180, 1181, 1366, 1586]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), `overflow at ${width}px`).toBe(true);
    expect(await page.locator(".site-header").evaluate((element) => element.scrollWidth <= element.clientWidth), `header overflow at ${width}px`).toBe(true);
  }
});

test("landing motion switch updates the material motion boundary", async ({ page }) => {
  await page.goto("/");
  const root = page.locator(".chrome-root").first();
  const motion = page.getByRole("switch", { name: "Motion" });
  await motion.click();
  await expect(root).toHaveAttribute("data-chrome-motion", "reduced");
  expect(await page.locator("html").evaluate((element) => getComputedStyle(element).scrollBehavior)).toBe("auto");
  await motion.click();
  await expect(root).toHaveAttribute("data-chrome-motion", "system");
  await expect.poll(() => page.locator("html").evaluate((element) => getComputedStyle(element).scrollBehavior)).toBe("smooth");

  await page.goto("/components/chrome-provider");
  await expect(page.locator(".provider-demo .chrome-root")).toHaveAttribute("data-chrome-motion", "reduced");
  expect(await page.locator("html").evaluate((element) => getComputedStyle(element).scrollBehavior)).toBe("smooth");
});

test("component and mixer screens stay operable at responsive boundary widths", async ({ page, isMobile }) => {
  test.skip(isMobile, "the desktop project owns the cross-page breakpoint matrix");

  for (const width of [320, 390, 761, 1181]) {
    await page.setViewportSize({ width, height: 900 });

    await page.goto("/components/button");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), `component overflow at ${width}px`).toBe(true);
    await page.getByRole("button", { name: "Default", exact: true }).click();
    const previewButton = page.getByRole("button", { name: /Create project/ }).first();
    await page.keyboard.press("Shift+Tab");
    await expect(previewButton).toBeFocused();
    const previewMetrics = await previewButton.evaluate((element) => {
      const styles = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return { height: box.height, outline: styles.outlineStyle };
    });
    expect(previewMetrics.height, `component target at ${width}px`).toBeGreaterThanOrEqual(44);
    expect(previewMetrics.outline, `component focus at ${width}px`).not.toBe("none");

    await page.goto("/patterns/control-room");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), `Control Room overflow at ${width}px`).toBe(true);
    const muteButton = page.getByRole("button", { name: "Mute SYNTH", exact: true });
    await muteButton.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(muteButton).toBeFocused();
    const muteMetrics = await muteButton.evaluate((element) => {
      const styles = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return { height: box.height, outline: styles.outlineStyle };
    });
    expect(muteMetrics.height, `mixer target at ${width}px`).toBeGreaterThanOrEqual(40);
    expect(muteMetrics.outline, `mixer focus at ${width}px`).not.toBe("none");
  }
});

test("increased contrast reinforces structural and focus boundaries", async ({ page }) => {
  await page.emulateMedia({ contrast: "more" });
  await page.goto("/");
  expect(await page.evaluate(() => matchMedia("(prefers-contrast: more)").matches)).toBe(true);
  const installColors = await page.locator(".install-command").evaluate((element) => {
    const styles = getComputedStyle(element);
    return { border: styles.borderTopColor, text: styles.color };
  });
  expect(installColors.border).toBe(installColors.text);

  await page.goto("/components/button");
  await page.getByRole("button", { name: "Default", exact: true }).click();
  const previewButton = page.getByRole("button", { name: /Create project/ }).first();
  await page.keyboard.press("Shift+Tab");
  await expect(previewButton).toBeFocused();
  expect(await previewButton.evaluate((element) => Number.parseFloat(getComputedStyle(element).outlineWidth))).toBeGreaterThanOrEqual(3);
});

test("Control Room transport, export dialog, and toast respond", async ({ page }) => {
  await page.goto("/patterns/control-room");
  await expect(page.locator(".chrome-toast")).toHaveCount(0);
  await page.getByRole("button", { name: "Save snapshot", exact: true }).click();
  await expect(page.locator(".chrome-toast")).toContainText("Snapshot saved");
  await page.locator(".chrome-toast").evaluate((element) => element.setAttribute("data-test-instance", "first"));
  await page.getByRole("button", { name: "Save snapshot", exact: true }).click();
  await expect(page.locator('.chrome-toast[data-test-instance="first"]')).toHaveCount(0);
  await page.getByRole("button", { name: "Start playback" }).click();
  await expect(page.getByRole("button", { name: "Pause playback" })).toBeVisible();
  await page.getByRole("button", { name: "Export", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Export Violet Transmission" })).toBeVisible();
  await page.getByRole("button", { name: "Export package" }).click();
  await expect(page.locator(".chrome-toast")).toContainText("Export complete");
});

test("Control Room navigation, markers, recording, and track removal update local state", async ({ page }) => {
  await page.goto("/patterns/control-room");
  await page.getByRole("button", { name: "Library", exact: true }).click();
  await expect(page.getByRole("button", { name: "Library", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Next marker" }).click();
  await expect(page.locator("footer time")).toHaveText("02:29.08");
  await page.getByRole("button", { name: "Record", exact: true }).click();
  await expect(page.getByRole("button", { name: "Stop recording", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Mute SYNTH", exact: true }).click();
  await expect(page.getByRole("button", { name: "Mute SYNTH", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Remove track", exact: true }).click();
  await expect(page.getByRole("button", { name: "Select SYNTH track" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "FX / CHANNEL 03" })).toBeVisible();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByRole("button", { name: "Select SYNTH track" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "SYNTH / CHANNEL 03" })).toBeVisible();
});

test("Control Room reflows rather than clipping tracks on short desktop viewports", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop short-height contract");
  await page.setViewportSize({ width: 1366, height: 667 });
  await page.goto("/patterns/control-room");
  const workspaceBox = await page.locator(".mixer-workspace").boundingBox();
  const lastTrackBox = await page.getByRole("button", { name: "Select FX track" }).boundingBox();
  expect(workspaceBox).not.toBeNull();
  expect(lastTrackBox).not.toBeNull();
  expect(lastTrackBox!.y + lastTrackBox!.height).toBeLessThanOrEqual(workspaceBox!.y + workspaceBox!.height);
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeGreaterThan(667);
});
