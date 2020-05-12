import Webhooks from '@octokit/webhooks';
import { Context } from 'probot';
import { LoggerWithTarget } from 'probot/lib/wrap-logger';
import { Config } from './types';
export const dryRun = process.env.DRY_RUN === 'true';
export const configFile = 'auto-cancel-actions.yml';

export const defaultConfig: Config = {
  version: 1,
  push: { branches: ['!master'] },
  pull_request: {},
};

export async function loadConfig(
  context: Context<Webhooks.WebhookPayloadCheckRun>,
  log: LoggerWithTarget
): Promise<Config> {
  const res = (await context.config<Config>(configFile)) as Config;

  if (!res) {
    log(
      { repo: context.payload.repository.full_name, file: configFile },
      'Not configured'
    );
  }

  return res ?? defaultConfig;
}
