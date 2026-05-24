import { expect, test } from "@playwright/test";

test("dashboard to copilot flow", async ({ page }) => {
  await page.goto("/");

  // Click Enter Demo on the landing page
  await page.getByRole("button", { name: "Enter Demo" }).click();

  await expect(
    page.getByRole("heading", { name: "PlanPilot AI Dashboard" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Open AI Copilot" }).click();

  await expect(
    page.getByRole("heading", { name: "AI Sprint Copilot" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Generate Sprint Plan" }).click();

  // Wait for the plan to load
  await expect(page.getByText("Create Board Tasks")).toBeVisible({
    timeout: 10_000,
  });

  // Health summary should appear after plan generation
  await expect(page.getByLabel("Health summary panel")).toBeVisible();

  // Risk level should be one of the valid values
  const healthText = await page.getByLabel("Health summary panel").textContent();
  const validLevels = ["Low Risk", "Medium Risk", "High Risk"];
  const hasRiskLevel = validLevels.some((level) =>
    healthText?.includes(level),
  );
  expect(hasRiskLevel).toBe(true);

  const selectElements = page.locator("select");
  await selectElements.nth(1).selectOption({ index: 1 });

  await page.getByRole("button", { name: "Create Board Tasks" }).click();

  await expect(page.getByText("Open project board")).toBeVisible();
});
