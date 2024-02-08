import { test, expect, type Page } from "@playwright/test"

const PAGE_ENDPOINT = "https://app.livecast.solutions/"

const CREDENTIALS = {
  username: "duyvo1",
  password: "DuyVo@123"
}

test.beforeEach(async ({ page }) => {
  await page.goto(PAGE_ENDPOINT)
})

test.describe("Sign In", () => {
  test("should allow me to sign in", async ({ page }) => {
    await page.getByRole("button", { name: "Use username instead" }).click()

    // Create sign in locator
    const username = page.getByPlaceholder("Username")
    const password = page.getByPlaceholder("Password")

    // Fill value
    await username.fill(CREDENTIALS.username)
    await password.fill(CREDENTIALS.password)
    await password.press("Enter")

    await expect(page).toHaveURL(/rooms/)

    // Check accessToken stored
    await checkAccessTokenInLocalStorage(page)

    // Select layout
    await page.getByRole("button", { name: "LiveCast" }).click()
  })
})

test.describe("Sign Up", () => {
  test("should allow me to sign up", async ({ page }) => {
    await page.getByTestId("to-register").click()

    // Create sign up locator
    const username = await page.getByPlaceholder("Username")
    const password = await page.getByTestId("password")
    const confirmPassword = page.getByPlaceholder("Confirm password")
    const phone = page.getByPlaceholder("+1 (702) 123-")
    const signUpButton = page.getByTestId("sign-up-button")
    const verifyButton = page.getByRole("button", { name: "Submit" })

    await username.fill("duyvo123")
    await phone.fill("+84927970451")
    await password.click()
    await password.getByRole("textbox").fill(CREDENTIALS.password)
    await confirmPassword.fill(CREDENTIALS.password)

    await signUpButton.click()

    // Redirect to verification page
    await expect(page).toHaveURL(/verification-code-register/)

    await verifyButton.click()

    await page.waitForTimeout(2)

    await verifyButton.click()

    await expect(page).toHaveURL(/rooms/)

    // Select layout
    await page.getByRole("button", { name: "LiveCast" }).click()
  })
})

async function checkAccessTokenInLocalStorage(page: Page) {
  return await page.waitForFunction(() => {
    return sessionStorage["accessToken"] !== undefined
  })
}
