import { test, expect, type Page } from "@playwright/test"

import { CREDENTIALS } from "./config-global"

const PAGE_ENDPOINT = "https://app.livecast.solutions/"

test.beforeEach(async ({ page }) => {
  await page.goto(PAGE_ENDPOINT)

  // Sign in
  await login(page, CREDENTIALS[0])
})

test.describe("New room", () => {
  test("should allow me to create new room with only name", async ({
    page
  }) => {
    await expect(page).toHaveURL(/rooms/)

    // Create new room
    await createNewRoom(page, "nameOnly")

    await expect(page.getByText("Live Preview")).toBeVisible()

    await page.close()
  })

  test("should allow me to create new room full filled fields", async ({
    page
  }) => {
    await expect(page).toHaveURL(/rooms/)

    // Create new room
    await createNewRoom(page, "full")

    await expect(page.getByText("Live Preview")).toBeVisible()

    await page.close()
  })
})

test.describe("Join room", () => {
  test.beforeEach(async ({ page }) => {
    // Create new room
    await createNewRoom(page, "nameOnly")
  })

  test("should allow me to join room as host", async ({ page }) => {
    await expect(page.getByText("Live Preview")).toBeVisible()

    await endLiveStream(page)

    await expect(page).toHaveURL(/rooms/)
  })

  test("should allow me to join room as member", async ({ browser }) => {
    // Create a new page.
    const newPage = await browser.newPage()
    await newPage.goto(PAGE_ENDPOINT)

    // Sign In with another account
    await login(newPage, CREDENTIALS[1])

    await newPage.getByText("Automation Room 1").first().click()

    // member join successful
    await expect(newPage.getByText("duyvo1").first()).toBeVisible()

    await newPage.close()
  })

  test("should increase the number of audience when a new member join the live stream", async ({
    page,
    browser
  }) => {
    // Create a new page
    const newPage = await browser.newPage()
    await newPage.goto(PAGE_ENDPOINT)

    // Sign In with another account
    await login(newPage, CREDENTIALS[1])

    await newPage.getByText("Automation Room 1").first().click()

    await page.getByText("Total Views").click()

    await page.waitForTimeout(2)

    // create a member locator
    const memberCount = page.getByRole("heading", { name: "Total Views (2)" })

    await expect(memberCount).toBeVisible()

    await page.keyboard.press("Escape")

    await endLiveStream(page)

    // Clean up
    await page.close()

    await newPage.close()
  })

  test("should increase the number of audience when multiple members join the live stream", async ({
    page,
    browser
  }) => {
    const audienceAccounts = CREDENTIALS.slice(1)

    for (let index = 0; index < audienceAccounts.length; index++) {
      const account = audienceAccounts[index]
      // Create a new page
      const newPage = await browser.newPage()
      await newPage.goto(PAGE_ENDPOINT)

      await page.waitForTimeout(1)

      // Sign In with another account
      await login(newPage, account)

      await newPage.getByText("Automation Room 1").first().click()
    }

    return
    await page.getByText("Total Views").click()

    await page.waitForTimeout(2)

    // create a member locator
    const memberCount = page.getByRole("heading", {
      name: `Total Views (${CREDENTIALS.length - 2})`
    })

    await expect(memberCount).toBeVisible()

    await page.keyboard.press("Escape")

    await endLiveStream(page)

    // Clean up
    // await page.close()
  })

  // test("should allow me to leave room", async ({ page }) => {
  //   await endLiveStream(page)

  //   await expect(page).toHaveURL(/rooms/)
  // })
})

async function login(page: Page, { username, password }) {
  await page.getByRole("button", { name: "Use username instead" }).click()

  // Create sign in locator
  const usernameField = page.getByPlaceholder("Username")

  const pwdField = page.getByPlaceholder("Password")

  // Fill value
  await usernameField.fill(username)
  await pwdField.fill(password)
  await pwdField.press("Enter")

  // Select layout
  await page.getByRole("button", { name: "LiveCast" }).click()
}

async function createNewRoom(page: Page, type: "full" | "nameOnly") {
  // New room
  await page.getByRole("button", { name: "Go Live" }).click()
  // Fill room
  const roomName = page.locator('input[name="name"]')
  const roomDesc = page.locator('textarea[name="description"]')

  if (type === "full") {
    roomDesc.fill("Automation room description")
  }

  const goLiveButton = page.getByRole("button", { name: "Go Live" })

  await roomName.fill("Automation room 1")
  await goLiveButton.click()
}

async function endLiveStream(page: Page) {
  await page.getByRole("button", { name: "End Live" }).click()

  await expect(
    page.getByText("Do you want to end a live stream?")
  ).toBeVisible()

  await page.getByRole("button", { name: "Sure" }).click()
}
