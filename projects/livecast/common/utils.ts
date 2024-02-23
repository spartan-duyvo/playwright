import { TestInfo } from '@playwright/test';
import fs from 'fs';
import path from 'path';

import { TestDataNameUnknownError } from './types/exception';
import { AUTH_DIR, DATA_DIR, DATA_PREFIX } from './constant';
import { DATA_PATHS } from './enum';

/**
 * Load data with specified name.
 *
 * If the environment variable corresponding to the data name is set,
 * the data will be read from the environment variable (in JSON format, encoded by base64).
 *
 * Otherwise, the data will be read from the data file specified in DATA_PATHS.
 * @param name name of data defined in DATA_PATHS
 */
export function loadData(name: keyof typeof DATA_PATHS) {
  if (Object.keys(DATA_PATHS).indexOf(name) === -1) {
    throw new TestDataNameUnknownError(name);
  }

  // Corresponding environment variable
  const dataEnvKey = DATA_PREFIX + name;

  if (dataEnvKey in process.env) {
    const dataContent = (process.env[dataEnvKey] as string).trim();
    if (dataContent !== '') {
      return JSON.parse(Buffer.from(dataContent, 'base64').toString('utf-8'));
    }
  }

  const dataFullPath = path.join(DATA_DIR, DATA_PATHS[name]);

  return JSON.parse(fs.readFileSync(dataFullPath).toString('utf-8'));
}

/**
 * Get test data by key pattern.
 * @param testData Test data object
 * @param key Key pattern to get test data. See more at https://lodash.com/docs/4.17.15#get
 * @returns data content
 */
export function getTestDataByKey(testData: Record<string, object>, key: string): string {
  return testData[key] as unknown as string;
}

/**
 * Get path to auth file of the user in the test data.
 *
 * This returns same path for same user in same test data, in every test running in same worker.
 * For 2 tests running in different workers, this always returns different path.
 * @param testInfo TestInfo object
 * @param dataName name of data defined in DATA_PATHS
 * @param userKey key of user in test data
 * @returns path to auth file of the user in the test data, specific to current test worker
 */
export function getAuthPath(testInfo: TestInfo, dataName: string, userKey: string): string {
  // use testInfo.project.outputDir instead of testInfo.outputDir to allow access to auth file from all tests
  return path.join(
    testInfo.project.outputDir,
    AUTH_DIR,
    dataName + '_' + userKey + '_' + testInfo.parallelIndex + '.json'
  );
}

/**
 * Trim URL by removing trailing slash (/).
 * @param url URL to trim
 * @returns URL after trimming
 */
export function trimUrl(url: string) {
  return url.replace(/\/+$/, '');
}

/**
 * Get random integer in range [min, max].
 * @param min minimum number (inclusive)
 * @param max maximum number (inclusive)
 * @returns Random integer in range [min, max]
 */
export function randomIntInRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Repeat an async function.
 * @param times number of times to repeat
 * @param func async function to repeat
 * @returns Promise that resolves when the function is repeated for the specified times
 */
export async function repeatAsync(times: number, func: () => Promise<void>) {
  for (let i = 0; i < times; i++) {
    await func();
  }
}
