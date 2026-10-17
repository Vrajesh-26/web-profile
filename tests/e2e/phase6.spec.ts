import { expect, test, type Page } from "@playwright/test";

const ownerEmail = process.env.E2E_OWNER_EMAIL ?? process.env.OWNER_EMAIL;
const ownerPassword = process.env.E2E_OWNER_PASSWORD ?? process.env.OWNER_PASSWORD;
const ownerReady = Boolean(ownerEmail && ownerPassword && process.env.DATABASE_URL);

function testClientIp() {
  return `2001:db8:${Date.now().toString(16)}:${Math.random().toString(16).slice(2, 6)}::1`;
}

async function signIn(page: Page) {
  await page.context().setExtraHTTPHeaders({ "x-forwarded-for": testClientIp() });
  await page.goto("/login");
  await page.getByLabel("Email").fill(ownerEmail!);
  await page.getByLabel("Password").fill(ownerPassword!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByLabel("Password").fill("");
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("public HTML excludes private values and dashboard redirects while logged out", async ({ page }) => {
  const response = await page.goto("/");
  const html = await response?.text() ?? "";
  const visibleText = await page.locator("body").innerText();
  expect(html.includes(ownerEmail ?? "owner-email-not-configured")).toBe(false);
  expect(html).not.toMatch(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  expect(visibleText).not.toMatch(/\+?\d[\d\s().-]{8,}\d/);

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login(?:\?.*)?$/);
});

test("wrong password fails, owner login works, and a dashboard skill is published", async ({ page, browser }) => {
  test.skip(!ownerReady, "Set OWNER_EMAIL, OWNER_PASSWORD, and DATABASE_URL for dashboard tests.");

  const failedLoginContext = await browser.newContext();
  const failedLoginPage = await failedLoginContext.newPage();
  await failedLoginContext.setExtraHTTPHeaders({ "x-forwarded-for": testClientIp() });
  await failedLoginPage.goto("/login");
  await failedLoginPage.getByLabel("Email").fill(ownerEmail!);
  await failedLoginPage.getByLabel("Password").fill(`${ownerPassword}-invalid`);
  await failedLoginPage.getByRole("button", { name: "Sign in" }).click();
  await expect(failedLoginPage.getByRole("alert").filter({ hasText: "Sign-in failed" })).toBeVisible();
  await failedLoginContext.close();

  await signIn(page);

  const skillName = `Phase 6 ${Date.now()}`;
  await page.goto("/dashboard/skills");
  await page.getByLabel("Skill name").first().fill(skillName);
  await page.getByLabel("Display group").first().fill("Testing");
  await page.getByRole("button", { name: "Add skill" }).click();
  await expect(page.getByRole("status")).toContainText("Skill saved");

  await page.goto("/");
  await expect(page.getByText(skillName, { exact: true })).toBeVisible();

  await page.goto("/dashboard/skills");
  await page.getByRole("button", { name: `Delete ${skillName}` }).click();
});

test("agent contact requires a key and rejects it after dashboard revocation", async ({ page, request }) => {
  test.skip(!ownerReady, "Set OWNER_EMAIL, OWNER_PASSWORD, and DATABASE_URL for dashboard tests.");

  const keylessResponse = await request.get("/api/agent/contact");
  expect(keylessResponse.status()).toBe(401);

  await signIn(page);
  await page.goto("/dashboard/agents");
  const label = `Phase 6 ${Date.now()}`;
  await page.getByLabel("Label").fill(label);
  await page.getByRole("button", { name: "Create key" }).click();
  const key = await page.locator("code").filter({ hasText: /^pf_/ }).innerText();

  const validResponse = await request.get("/api/agent/contact", {
    headers: { Authorization: `Bearer ${key}` },
  });
  expect(validResponse.status()).toBe(200);

  const keyRow = page.getByRole("article").filter({ hasText: label });
  await keyRow.getByRole("button", { name: "Revoke" }).click();
  await expect(keyRow).toContainText("Revoked");

  const revokedResponse = await request.get("/api/agent/contact", {
    headers: { Authorization: `Bearer ${key}` },
  });
  expect(revokedResponse.status()).toBe(401);
});