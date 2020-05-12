import { Context, Octokit } from 'probot';
import Webhooks from '@octokit/webhooks';
import chalk from 'chalk';
import is from '@sindresorhus/is';
import { Config, isEvent, WorkflowData } from './types';
import {
  defaultConfig,
  dryRun,
  loadJsonConfig,
  loadYamlConfig,
} from './config';
import { isbranchAllowed } from './filter';

export class Runner {
  constructor(
    private readonly _context: Context<Webhooks.WebhookPayloadCheckRun>
  ) {}

  async run(): Promise<void> {
    const context = this._context;
    const { github, log, payload } = context;
    const id = payload.check_run.id;
    log('Running check:', chalk.grey(`${id}`));
    try {
      const { data: check } = await github.checks.get(
        context.repo({ check_run_id: id })
      );
      if (check.app.slug !== 'github-actions') {
        log('Ignore app:', check.app.slug);
        return;
      }
      const cfg = (await this._loadConfig()) ?? defaultConfig;
      if (cfg.version !== 1) {
        log.warn('Invalid config version:', cfg.version);
        return;
      }
      const wfres = await this._getWorkflowId(cfg);
      if (!wfres) {
        return;
      }
      const { run_id, run_number, event, ...wf } = wfres;
      const { data: runs } = await github.actions.listWorkflowRuns(
        context.repo({ ...wf })
      );
      log('event:', event);
      for (const run of runs.workflow_runs) {
        if (run.id === run_id) {
          log(chalk.yellow('Ignore me'), ':', chalk.grey(run.html_url));
          continue;
        }
        if (run.run_number > run_number) {
          log(chalk.yellow('Ignore newer'), ':', chalk.grey(run.html_url));
          continue;
        }
        if (run.status !== 'in_progress' && run.status !== 'queued') {
          log(
            chalk.yellow(`Ignore state`),
            run.status,
            ':',
            chalk.grey(run.html_url)
          );
          continue;
        }
        if (run.event !== event) {
          log(
            chalk.yellow(`Ignore event`),
            run.event,
            ':',
            chalk.grey(run.html_url)
          );
          continue;
        }
        if (dryRun || cfg.dryRun) {
          log.warn(
            chalk.yellow('[DRY_RUN]'),
            chalk.blue('Would cancel'),
            ':',
            run.id,
            chalk.grey(run.html_url)
          );
          continue;
        }
        log.info(chalk.blue('Cancel:'), ':', run.id, chalk.grey(run.html_url));
        await github.actions.cancelWorkflowRun(
          context.repo({ run_id: run.id })
        );
      }
    } catch (e) {
      log.error(chalk.red('unexpected error'), e);
    }
  }

  private _check(
    cfg: Config,
    wf: Octokit.ActionsGetWorkflowRunResponse
  ): boolean {
    const { log } = this._context;
    if (!isEvent(wf.event)) {
      log.warn('Invalid event:', wf.event);
      return false;
    }
    const evCfg = cfg[wf.event];
    if (!is.object(evCfg)) {
      log.debug('Invalid event:', wf.event);
      return false;
    }
    if (!evCfg.branches) {
      return true;
    }
    if (isbranchAllowed(wf.head_branch, evCfg.branches)) {
      return true;
    }
    log(chalk.yellow('Ignore branch:'), wf.head_branch);
    return false;
  }
  private async _getWorkflowId(cfg: Config): Promise<WorkflowData | null> {
    const context = this._context;
    const { github: api, log, payload } = context;
    try {
      const { data: job } = await api.actions.getWorkflowJob(
        context.repo({ job_id: payload.check_run.id })
      );
      const { data: wf } = await api.actions.getWorkflowRun(
        context.repo({ run_id: job.run_id })
      );
      if (!this._check(cfg, wf)) {
        return null;
      }
      const [, workflow_id] = /\/(\d+)$/.exec(wf.workflow_url) ?? [];
      return {
        workflow_id: parseInt(workflow_id),
        branch: wf.head_branch,
        run_id: job.run_id,
        run_number: wf.run_number,
        event: wf.event,
      };
    } catch (e) {
      log.error(chalk.red('unexpected error'), e);
      return null;
    }
  }

  private async _loadConfig(): Promise<Config | null> {
    const data = await loadJsonConfig(this._context);
    return data ?? (await loadYamlConfig(this._context));
  }
}
