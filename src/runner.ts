import Webhooks from '@octokit/webhooks';
import is from '@sindresorhus/is';
import chalk from 'chalk';
import { Context, Octokit } from 'probot';
import { LoggerWithTarget } from 'probot/lib/wrap-logger';
import { dryRun, loadConfig } from './config';
import { isbranchAllowed } from './filter';
import { Config, WorkflowData, isEvent } from './types';

export class Runner {
  private readonly _log: LoggerWithTarget;
  constructor(
    private readonly _context: Context<Webhooks.WebhookPayloadCheckRun>
  ) {
    const { payload, log } = _context;
    const ctx = {
      repo: payload.repository.name,
      check_run: payload.check_run.id,
    };

    this._log = log.child(ctx);
  }

  async run(): Promise<void> {
    const log = this._log;
    const context = this._context;
    const { github, payload } = context;
    const id = payload.check_run.id;
    log('Running check ...');
    try {
      const { data: check } = await github.checks.get(
        context.repo({ check_run_id: id })
      );
      if (check.app.slug !== 'github-actions') {
        log({ app: check.app.slug }, 'Ignore app');
        return;
      }
      const cfg = await loadConfig(this._context, log);
      if (cfg.version !== 1) {
        log.error({ cfg }, 'Invalid config version');
        return;
      }
      log({ cfg }, 'config');
      const wfres = await this._getWorkflowId(cfg);
      if (!wfres) {
        return;
      }
      const { run_id, run_number, event, ...wf } = wfres;
      const { data: runs } = await github.actions.listWorkflowRuns(
        context.repo({ ...wf })
      );
      log({ event, run_id, run_number }, 'Current run data');
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
      log.error(e, 'unexpected error');
    }
  }

  private _check(
    cfg: Config,
    wf: Octokit.ActionsGetWorkflowRunResponse
  ): boolean {
    const log = this._log;
    if (!isEvent(wf.event)) {
      log.warn('Invalid event:', wf.event);
      return false;
    }
    const evCfg = cfg[wf.event];
    if (is.undefined(evCfg)) {
      log.debug('Invalid event:', wf.event);
      return false;
    }
    if (evCfg === null || is.nullOrUndefined(evCfg.branches)) {
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
}
