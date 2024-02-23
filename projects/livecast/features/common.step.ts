import { expect } from "@playwright/test"
import fs from "fs"

import { LOGIN_PAGE, TIMEOUT } from "../common/enum"
import { Given, Then, When } from "../common/fixtures"
import { LocalStorageData } from "../common/types/data"
import {
  getAuthPath,
  getTestDataByKey,
  loadData,
  trimUrl
} from "../common/utils"

Given("I load data {string}", async ({ scenarioData }, dataName) => {
  scenarioData.testData = loadData(dataName)
})

Given(
  "I login as user {string} from data {string}",
  async (
    { scenarioData, basePage, loginPage, context, $testInfo },
    userKey,
    dataName
  ) => {
    const authPath = getAuthPath($testInfo, dataName, userKey)
    if (fs.existsSync(authPath)) {
      // already login in current worker
      await $testInfo.attach("Login method", {
        body: "Cache data of previous login in current worker"
      })
      // navigate to any page to have privelege to set local storage
      await loginPage.goto()
      await expect(loginPage.getPage()).toHaveURL(
        new RegExp(loginPage.getUrl())
      )

      // load auth data from file
      const storageStateData = JSON.parse(
        fs.readFileSync(authPath).toString("utf-8")
      )
      const localStorageAllData =
        storageStateData?.origins as Array<LocalStorageData>
      const localStorageData = localStorageAllData.find(
        (localStorageByOrigin) =>
          trimUrl(localStorageByOrigin.origin) == trimUrl(basePage.getUrl())
      )
      if (localStorageData) {
        await basePage.setLocalStorage(localStorageData.localStorage)
      }
      await context.addCookies(storageStateData?.cookies)

      // navigate to home page
      await basePage.goto()
      await expect(loginPage.getPage()).toHaveURL(new RegExp(basePage.getUrl()))
    } else {
      // login in current worker
      await $testInfo.attach("Login method", { body: "Login with test data" })
      // load data
      scenarioData.testData = loadData(dataName)
      const username = getTestDataByKey(
        scenarioData.testData,
        userKey + LOGIN_PAGE.KEY_USERNAME
      )
      const password = getTestDataByKey(
        scenarioData.testData,
        userKey + LOGIN_PAGE.KEY_PASSWORD
      )
      scenarioData.userKey = userKey
      scenarioData.userName = username

      await loginPage.login(username, password)

      // login will navigate to home page
      await expect(loginPage.getPage()).toHaveURL(new RegExp(basePage.getUrl()))
      // wait for page loaded completely so that local storage is set
      await expect(basePage.getPage().getByText("Version")).toBeVisible({
        timeout: TIMEOUT.XLONG
      })
      // save auth data to file
      await context.storageState({ path: authPath })
    }
  }
)

Given("I go to home page", async ({ basePage }) => {
  await basePage.goto()
})

Given("I go to login page", async ({ loginPage }) => {
  await loginPage.goto()
})

When("I wait for {int} seconds", async ({ basePage }, seconds) => {
  await basePage.waitForTimeout(seconds * 1000)
})

When(
  "I type test data {string} to input {string}",
  async ({ scenarioData, basePage }, dataKey, inputName) => {
    const dataContent = getTestDataByKey(scenarioData.testData, dataKey)
    await basePage.fillByRoleTextbox(inputName, dataContent)
  }
)

When(
  "I type text {string} to input {string}",
  async ({ basePage }, text, inputName) => {
    await basePage.fillByRoleTextbox(inputName, text)
  }
)

When(
  "I type text {string} to input having placeholder {string}",
  async ({ basePage }, text, placeholder) => {
    await basePage.fillByPlaceholder(placeholder, text)
  }
)

When(
  "I click element with role {string} and name {string}",
  async ({ basePage }, role, name) => {
    await basePage.clickByRole(role, name)
  }
)

When("I click element with text {string}", async ({ basePage }, text) => {
  await basePage.clickByText(text)
})

When("I click link {string}", async ({ basePage }, name) => {
  await basePage.clickByRole("link", name)
})

When("I click button {string}", async ({ basePage }, name) => {
  await basePage.clickByRole("button", name)
})

When("I click button with locator {string}", async ({ basePage }, locator) => {
  await basePage.clickByLocator(locator)
})

Then("I should be in home page", async ({ basePage }) => {
  await expect(basePage.getPage()).toHaveURL(new RegExp(basePage.getUrl()))
})

Then("I should see in title {string}", async ({ basePage }, keyword) => {
  await expect(basePage.getPage()).toHaveTitle(new RegExp(keyword))
})

Then("The text of {string} should be visible", async ({ basePage }, text) => {
  await expect(basePage.getPage().getByText(text)).toBeVisible()
})

Then(
  "The element with text {string} and order {int} should be visible",
  async ({ basePage }, text, order) => {
    // order is 0-based
    await expect(basePage.getPage().getByText(text).nth(order)).toBeVisible()
  }
)

Then(
  "The element with role {string} and order {int} should be visible",
  async ({ basePage }, text, order) => {
    // order is 0-based
    await expect(basePage.getPage().getByRole(text).nth(order)).toBeVisible()
  }
)
