import { EventPayloads } from '@octokit/webhooks';
import { Context, Logger } from 'probot';
import { Config } from './types';
export const dryRun = process.env.DRY_RUN === 'true';
export const configFile = 'auto-cancel-actions.yml';

export const defaultConfig: Config = {
  version: 1,
  push: { branches: ['!master'] },
  pull_request: {},
};

export async function loadConfig(
  context: Context<EventPayloads.WebhookPayloadCheckRun>,
  log: Logger
): Promise<Config> {
  const res = (await context.config<Config>(configFile)) as Config;

  if (!res) {
    log.warn({ file: configFile }, 'Not configured');
  }

  return res ?? defaultConfig;
}
