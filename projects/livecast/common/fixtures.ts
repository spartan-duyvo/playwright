import { createBdd } from "playwright-bdd"
import { test as base } from "playwright-bdd"

import { BasePage } from "../pages/base.page"
import { LoginPage } from "../pages/login.page"

import { ScenarioData } from "./types/data"
import { ONLY_PROJECTS, SKIP_PROJECTS } from "./constant"

export type DataFixtures = {
  scenarioData: ScenarioData // shared data between steps
}

export type HooksFixtures = {
  // skip test by projects specified in SKIP_PROJECTS or ONLY_PROJECTS environment variables
  skipTestByProject: void
}

export type PageObjectFixtures = {
  basePage: BasePage
  loginPage: LoginPage
}

export const test = base.extend<
  DataFixtures & HooksFixtures & PageObjectFixtures
>({
  scenarioData: [
    async ({}, use) => {
      await use(new ScenarioData())
    },
    { scope: "test", auto: false }
  ],

  skipTestByProject: [
    async ({}, use, testInfo) => {
      // filter by SKIP_PROJECTS
      testInfo.skip(
        SKIP_PROJECTS.includes(testInfo.project.name),
        `Project ${testInfo.project.name} is skipped`
      )
      // filter by ONLY_PROJECTS only if SKIP_PROJECTS is empty
      if (SKIP_PROJECTS.length == 0 && ONLY_PROJECTS.length > 0) {
        testInfo.skip(
          !ONLY_PROJECTS.includes(testInfo.project.name),
          `Only projects ${ONLY_PROJECTS} are allowed to run`
        )
      }
      await use()
    },
    { scope: "test", auto: true }
  ],

  basePage: ({ page }, use) => use(new BasePage(page, "")),
  loginPage: ({ page }, use) => use(new LoginPage(page))
})

export const { Given, When, Then } = createBdd(test)
