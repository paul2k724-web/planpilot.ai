import { expect, test } from "@playwright/test";

test("dashboard to copilot flow", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "PlanPilot AI Dashboard" })
  ).toBeVisible();

  await page.getByRole("link", { name: "Open AI Copilot" }).click();

  await expect(
    page.getByRole("heading", { name: "AI Sprint Copilot" })
  ).toBeVisible();

  await page.getByRole("button", { name: "Generate Sprint Plan" }).click();

  await expect(page.getByText("Create Board Tasks")).toBeVisible();

  const selectElements = page.locator("select");
  await selectElements.nth(1).selectOption({ index: 1 });

  await page.getByRole("button", { name: "Create Board Tasks" }).click();

  await expect(page.getByText("Open project board")).toBeVisible();
});
