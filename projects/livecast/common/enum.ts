export enum ENV_KEYS {
  // Run options
  SKIP_PROJECTS = "E2E_SKIP_PROJECTS",
  ONLY_PROJECTS = "E2E_ONLY_PROJECTS",

  // Test settings
  BASE_URL = "E2E_BASE_URL"

  // Test data environment variables are existed but not defined here
}

export enum TIMEOUT {
  XSHORT = 2000,
  SHORT = 5000,
  MEDIUM = 10000,
  LONG = 30000,
  XLONG = 60000
}

export enum DATA_PATHS {
  // Test data file paths, relative to data folder
  USER = "user.local.json"
}

export enum LOGIN_PAGE {
  PATH = "/auth/login",
  KEY_USERNAME = ".username",
  KEY_PASSWORD = ".password",
  INPUT_USERNAME = "Username",
  INPUT_PASSWORD = "Password",
  BUTTON_LOGIN = "Sign In"
}

export enum USER_MANAGEMENT_PAGE {
  PATH = "/user-management"
}
