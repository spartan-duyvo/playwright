import { expect, test } from "@playwright/test"

import { CREDENTIALS } from "./config-global"
import { login } from "./utils"

const PAGE_ENDPOINT = "https://app.livecast.solutions/"

const MOCK_FIRST_NAME = ["Vo", "Vo1", "Nguyen", "Dave", "Hello1"]
const MOCK_LAST_NAME = ["Duy", "Binh", "Mai", "hello", "John"]

test.beforeEach(async ({ page }) => {
  await page.goto(PAGE_ENDPOINT)

  // Sign in
  await login(page, CREDENTIALS[0])
})

test.describe("Profile Editing", () => {
  test("should allow me to update the account information", async ({
    page
  }) => {
    await page.getByAltText("duyvo1").click()

    await page.getByText("Settings").click()

    const profileFName = page.locator('input[name="firstName"]')
    const profileLName = page.locator('input[name="lastName"]')
    const profileBio = page.locator('textarea[name="bio"]')
    // const profileBirthday = page.getByText("Birthday").click()
    const random = Math.floor(Math.random() * MOCK_FIRST_NAME.length)
    const firstName = MOCK_FIRST_NAME[random]
    const lastName = MOCK_LAST_NAME[random]

    await profileFName.fill(firstName)

    await profileLName.fill(lastName)

    await profileBio.fill("Howdy, welcome to our positive community")

    // update button
    const updateBtn = page.getByRole("button", { name: "Update" })

    await updateBtn.click()

    await page.waitForTimeout(3)

    expect(page.getByText(`${firstName} ${lastName}`)).toBeVisible()
  })

  test.afterEach(async ({ page }) => {
    await page.close()
  })
})
