import { ENV_KEYS } from './enum';
import 'dotenv/config';

// Environment variables
export const ENV = Object.values(ENV_KEYS).reduce(
  (acc, key) => {
    acc[key] = process.env[key] || '';
    return acc;
  },
  {} as Record<ENV_KEYS, string>
);

// Projects to skip test
export const SKIP_PROJECTS = ENV[ENV_KEYS.SKIP_PROJECTS]
  .split(',')
  .map((project) => project.trim())
  .filter((project) => project !== '');

// Projects to run test
export const ONLY_PROJECTS = ENV[ENV_KEYS.ONLY_PROJECTS]
  .split(',')
  .map((project) => project.trim())
  .filter((project) => project !== '');

// Test data
export const DATA_PREFIX = 'E2E_DATA_'; // prefix of environment variables for test data
export const DATA_DIR = './src/data'; // data folder
// Auth
export const AUTH_DIR = '.auth'; // auth folder
