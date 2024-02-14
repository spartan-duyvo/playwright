import { test, expect, type Page } from "@playwright/test"

import { CREDENTIALS } from "./config-global"
import { login } from "./utils"

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
  })

  test("should allow me to create new room full filled fields", async ({
    page
  }) => {
    await expect(page).toHaveURL(/rooms/)

    // Create new room
    await createNewRoom(page, "full")

    await expect(page.getByText("Live Preview")).toBeVisible()
  })

  test("should allow me to create new room with disabled chat", async ({
    page
  }) => {
    await expect(page).toHaveURL(/rooms/)

    // Create new room
    await createNewRoom(page, "disabledChat")

    await expect(page.getByText("Live Preview")).toBeVisible()
  })

  test.afterEach(async ({ page }) => {
    await endLiveStream(page)

    await page.close()
  })
})

test.describe("Join room", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    if (
      testInfo.title === "should allow me to see join live room notification"
    ) {
      await createNewRoom(page, "disabledChat")
      return
    }

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

    await page.close()

    await newPage.close()
  })

  test("should increase the number of audience correctly when multiple members join the live stream", async ({
    page,
    browser
  }) => {
    // Can only sign in 4 accounts at the same time?
    const audienceAccounts = CREDENTIALS.slice(1, 4)

    for (let index = 0; index < audienceAccounts.length; index++) {
      const account = audienceAccounts[index]
      // Create a new page
      const newPage = await browser.newPage()
      await newPage.goto(PAGE_ENDPOINT)

      await newPage.waitForTimeout(1)

      // Sign In with another account
      await login(newPage, account)

      await newPage.getByText("Automation Room 1").first().click()
    }

    await page.getByText("Total Views").click()

    await page.waitForTimeout(2)

    // create a member locator
    const memberCount = page.getByRole("heading", {
      name: `Total Views (${audienceAccounts.length})`
    })

    await expect(memberCount).toBeVisible()

    await page.keyboard.press("Escape")

    await endLiveStream(page)

    // Clean up
    await page.close()
  })

  test("should allow me to chat in live room", async ({ browser, page }) => {
    // Create a new page.
    const newPage = await browser.newPage()
    await newPage.goto(PAGE_ENDPOINT)

    // Sign In with another account
    await login(newPage, CREDENTIALS[1])

    await newPage.getByText("Automation Room 1").first().click()

    // member join successful
    await expect(newPage.getByText("duyvo1").first()).toBeVisible()

    // Wait for connecting to Agora-chat
    await newPage.waitForTimeout(3)

    // Send a message
    const chatField = await newPage.getByPlaceholder("Send a message")
    if (chatField) {
      await chatField.fill("hello the host")
      await newPage.waitForTimeout(1)
      await chatField.press("Enter")
    }

    // Wait message sent because we're using third party
    // this might be having a little delay in receive a message
    await page.waitForTimeout(3)

    await expect(page.getByText("hello the host")).toBeVisible()

    await endLiveStream(page)

    await newPage.close()

    await page.close()
  })

  test("should allow me to see join live room notification", async ({
    browser,
    page
  }) => {
    // Create a new page.
    const newPage = await browser.newPage()
    await newPage.goto(PAGE_ENDPOINT)

    // Sign In with another account
    await login(newPage, CREDENTIALS[1])

    await newPage.getByText("Automation Room 1").first().click()

    // member join successful
    await expect(newPage.getByText("duyvo1").first()).toBeVisible()

    // Wait for the join notificat(ion visible in the chat
    await expect(page.getByText(CREDENTIALS[1].username)).toBeVisible()
    await expect(page.getByText("has joined the room")).toBeVisible()

    await endLiveStream(page)

    await newPage.close()

    await page.close()
  })
})

async function createNewRoom(
  page: Page,
  type: "full" | "nameOnly" | "disabledChat"
) {
  // New room
  await page.getByRole("button", { name: "Go Live" }).click()
  // Fill room
  const roomName = page.locator('input[name="name"]')
  const roomDesc = page.locator('textarea[name="description"]')
  const roomChatSwitch = page.locator('input[name="allowChatting"]')

  if (type === "full") {
    roomDesc.fill("Automation room description")
  }

  if (type === "disabledChat") {
    roomChatSwitch.click()
  }

  const goLiveBtn = page.getByRole("button", { name: "Go Live" })

  await roomName.fill("Automation room 1")
  await goLiveBtn.click()
}

async function endLiveStream(page: Page) {
  await page.getByRole("button", { name: "End Live" }).click()

  await expect(
    page.getByText("Do you want to end a live stream?")
  ).toBeVisible()

  await page.getByRole("button", { name: "Sure" }).click()
}
