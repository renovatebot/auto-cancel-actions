import Webhooks from '@octokit/webhooks';
import { Context } from 'probot';
import { Config } from './types';
export const dryRun = process.env.DRY_RUN === 'true';
export const configFile = '.github/auto-cancel-actions.yml';

export const defaultConfig: Config = {
  version: 1,
  push: { branches: ['!master'] },
  pull_request: {},
};

export async function loadConfig(
  context: Context<Webhooks.WebhookPayloadCheckRun>
): Promise<Config> {
  const res = (await context.config<Config>(configFile)) as Config;

  if (!res) {
    context.log('Not configured');
  }

  return res ?? defaultConfig;
}
