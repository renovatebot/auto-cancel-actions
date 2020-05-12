import { Config } from './types';
import { Context } from 'probot';
import Webhooks from '@octokit/webhooks';
export const dryRun = process.env.DRY_RUN === 'true';
export const configJsonFile = '.github/auto-cancel-actions.json';
export const configYmlFile = '.github/auto-cancel-actions.yml';

export const defaultConfig: Config = {
  version: 1,
  push: { branches: ['!master'] },
  pull_request: {},
};

export async function loadJsonConfig(
  context: Context<Webhooks.WebhookPayloadCheckRun>
): Promise<Config | null> {
  const { github, log } = context;
  try {
    const { data } = await github.repos.getContents(
      context.repo({ path: configJsonFile })
    );
    if (Array.isArray(data) || typeof data.content !== 'string') {
      log('Invalid response');
      return null;
    }

    return JSON.parse(Buffer.from(data.content, 'base64').toString());
  } catch (e) {
    if (e.status === 404) {
      log.debug('Not configured');
      return null;
    }
    throw e;
  }
}

export async function loadYamlConfig(
  context: Context<Webhooks.WebhookPayloadCheckRun>
): Promise<Config | null> {
  return (await context.config<Config>(configYmlFile)) as Config;
}
