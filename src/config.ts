import { Config } from './types';
export const dryRun = process.env.DRY_RUN === 'true';
export const configFile = '.github/auto-cancel-actions.json';

export const defaultConfig: Config = {
  version: 1,
  push: { branches: ['!master'] },
  pull_request: {},
};
