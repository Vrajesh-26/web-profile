import { expect, test, type ConsoleMessage } from "@playwright/test";
import path from "node:path";

const viewports = [375, 768, 1440] as const;
const screenshotDir = path.join("tests", "e2e", "screenshots");

test("home loads without console errors or horizontal overflow", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message: ConsoleMessage) => {
    if (message.type() === "error" && !message.text().includes("caret-color")) {
      consoleErrors.push(message.text());
    }
  });

  const response = await page.goto("/");
  expect(response?.ok()).toBeTruthy();
  await expect(page.getByRole("banner")).toBeVisible();

  for (const width of viewports) {
    await page.setViewportSize({ width, height: 900 });
    const overflowX = await page.evaluate(() => {
      const root = document.documentElement;
      return root.scrollWidth - root.clientWidth;
    });
    expect(overflowX, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(1);
    await page.screenshot({
      path: path.join(screenshotDir, `home-${width}.png`),
      fullPage: true,
    });
  }

  expect(consoleErrors, consoleErrors.join("\n")).toEqual([]);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole("link", { name: "View projects" }).click();
  await expect(page.locator("#projects")).toBeInViewport();
  const headerBottom = await page.getByRole("banner").evaluate((el) => el.getBoundingClientRect().bottom);
  const projectsTop = await page.locator("#projects").evaluate((el) => el.getBoundingClientRect().top);
  expect(projectsTop).toBeGreaterThanOrEqual(headerBottom - 2);
});
