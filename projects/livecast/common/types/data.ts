/**
 * Scenario data.
 *
 * Variables shared between steps should be defined here.
 */
export class ScenarioData {
  constructor(
    public testData: Record<string, object> = {},

    public userKey: string = "",
    public userName: string = ""
  ) {}
}

export class LocalStorageItem {
  constructor(public name: string, public value: string) {}
}

export class LocalStorageData {
  constructor(
    public origin: string,
    public localStorage: Array<LocalStorageItem>
  ) {}
}
