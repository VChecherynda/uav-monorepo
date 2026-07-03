import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("demo@uav.test");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "AUTHENTICATE" }).click();
  await expect(page.getByText("Falcon-1")).toBeVisible();
});

test("operator logs in and sees the fleet", async ({ page }) => {
  await expect(page).toHaveURL("/");
  await expect(page.getByText("UAV FLEET").first()).toBeVisible();
  await page.getByText("Falcon-1").click();
  await expect(
    page.getByText("SELECT DRONE TO VIEW TELEMETRY"),
  ).not.toBeVisible();
});

test("operator issues RTH and sees optimistic update then confirmation", async ({
  page,
}) => {
  const falconCard = page.locator(".card").filter({ hasText: "Falcon-1" });

  const rthButton = falconCard.getByRole("button", { name: "RTH" });
  await rthButton.click();

  // OPTIMISTIC
  await expect(page.getByText("RETURNING")).toBeVisible();

  // SERVER CONFIRMED
  await expect(page.getByText("ACKNOWLEDGED")).toBeVisible();
});
