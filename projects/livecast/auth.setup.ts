import { Page, test as setup } from "@playwright/test"

export const CREDENTIALS1 = {
  username: "duyvo1",
  password: "DuyVo@123"
}

export const CREDENTIALS2 = {
  username: "duyvo1105",
  password: "DuyVo@123"
}

const PAGE_ENDPOINT = "https://app.livecast.solutions/"

setup("Do login", async ({ page }) => {
  await page.goto(PAGE_ENDPOINT)

  await page.getByRole("button", { name: "Use username instead" }).click()

  // Create sign in locator
  const username = page.getByPlaceholder("Username")
  const password = page.getByPlaceholder("Password")

  // Fill value
  await username.fill(CREDENTIALS1.username)
  await password.fill(CREDENTIALS1.password)
  await password.press("Enter")

  // await page.context().storageState({ path: STORAGE_STATE })
})
