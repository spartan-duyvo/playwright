import { type Page } from "@playwright/test"

export async function login(page: Page, { username, password }) {
  await page.getByRole("button", { name: "Use username instead" }).click()

  // Create sign in locator
  const usernameField = await page.getByPlaceholder("Username")
  const pwdField = await page.getByPlaceholder("Password")
  const signInBtn = await page.getByRole("button", { name: "Sign in" })

  // Fill value
  await usernameField.fill(username)
  await pwdField.fill(password)

  await signInBtn.click()

  await page.waitForTimeout(3000)

  // Select layout
  const layoutBtn = await page.getByRole("button", { name: "LiveCast" })
  if (layoutBtn) {
    await layoutBtn.click()
  }
}
