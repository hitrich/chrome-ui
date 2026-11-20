import { expect, test } from "@playwright/test";

test("the docs theme switch persists across reloads", async ({ page }) => {
  await page.goto("/components");
  const root = page.locator(".app-root");
  await expect(root).toHaveAttribute("data-chrome-theme", "satin");
  await page.getByRole("button", { name: "Switch to Ink theme" }).click();
  await expect(root).toHaveAttribute("data-chrome-theme", "ink");
  await page.reload();
  await expect(root).toHaveAttribute("data-chrome-theme", "ink");
  await page.getByRole("button", { name: "Switch to Satin theme" }).click();
  await expect(root).toHaveAttribute("data-chrome-theme", "satin");
});

test("the landing install command copies with visible feedback", async ({ page, context, isMobile }) => {
  test.skip(isMobile, "clipboard permissions are granted on the desktop project");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page.getByRole("button", { name: "Copy install command" }).click();
  await expect(page.getByText("Copied", { exact: true }).first()).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("npm i @loreanai/chrome-ui");
});

test("the base catalog filters by name and recovers from an empty result", async ({ page }) => {
  await page.goto("/components/base");
  const filter = page.getByPlaceholder("Filter by name");
  await filter.fill("tree");
  await expect(page.getByRole("link", { name: "Tree View" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Checkbox", exact: true })).toHaveCount(0);
  await filter.fill("zzz");
  await expect(page.getByText("No components match")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByRole("link", { name: "Checkbox", exact: true })).toBeVisible();
});

test("block previews switch to Ink without changing the page theme", async ({ page }) => {
  await page.goto("/components/blocks");
  await page.getByLabel("Preview theme").getByRole("button", { name: "Ink" }).click();
  await expect(page.locator('#data-grid [data-chrome-theme="ink"]').first()).toBeVisible();
  await expect(page.locator(".app-root")).toHaveAttribute("data-chrome-theme", "satin");
});

test("finance desk approvals keep the selection summary and actions in step", async ({ page }) => {
  await page.goto("/templates/finance-desk");
  const selectAll = page.getByRole("checkbox", { name: /^Select all payments/ });
  const approve = page.getByRole("button", { name: /^Approve \d+ payments?$/ });
  await selectAll.click();
  await expect(page.getByText(/^[1-9]\d* selected ·/)).toBeVisible();
  await expect(approve).toBeEnabled();
  await selectAll.click();
  await expect(page.getByText(/^0 selected ·/)).toBeVisible();
  await expect(approve).toBeDisabled();
});

test("settings enable save only after an edit and discard restores it", async ({ page }) => {
  await page.goto("/templates/settings");
  const save = page.getByRole("button", { name: "Save changes" });
  await expect(save).toBeDisabled();
  await page.getByLabel("Workspace name").fill("Orbital Ops EU");
  await expect(save).toBeEnabled();
  await page.getByRole("button", { name: "Discard" }).click();
  await expect(save).toBeDisabled();
  await expect(page.getByLabel("Workspace name")).toHaveValue("Orbital Ops");
});

test("the agent console composer sends a message into the thread", async ({ page }) => {
  await page.goto("/templates/agent-console");
  await page.getByLabel("Message to ops-agent").fill("Check eu-west-1 before the rollback.");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Check eu-west-1 before the rollback.")).toBeVisible();
  await expect(page.getByLabel("Message to ops-agent")).toHaveValue("");
});

test("control room incident details open in a drawer and return focus", async ({ page }) => {
  await page.goto("/templates/control-room");
  const trigger = page.getByRole("button", { name: "search-indexer health checks timing out" });
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("the docs navigation becomes a drawer on phones", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile-only layout");
  await page.goto("/components");
  const open = page.getByRole("button", { name: "Open navigation" });
  await open.click();
  await expect(page.getByRole("navigation", { name: "Docs navigation" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(open).toBeFocused();
});
