import { type Page } from "@playwright/test"

export async function login(page: Page, { username, password }) {
  await page.getByRole("button", { name: "Use username instead" }).click()

  // Create sign in locator
  const usernameField = page.getByPlaceholder("Username")

  const pwdField = page.getByPlaceholder("Password")

  // Fill value
  await usernameField.fill(username)
  await pwdField.fill(password)
  await pwdField.press("Enter")

  await page.waitForTimeout(2)

  // Select layout
  await page.getByRole("button", { name: "LiveCast" }).click()
}
