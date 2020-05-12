import { Probot, Application, Context } from 'probot';
import Webhooks from '@octokit/webhooks';
import chalk from 'chalk';

const dryRun = process.env.DRY_RUN === 'true';

async function getWorkflowId(
  context: Context<Webhooks.WebhookPayloadCheckRun>,
  repo: { repo: string; owner: string },
  id: number
): Promise<{
  branch: string;
  workflow_id: number;
  run_id: number;
  run_number: number;
} | null> {
  const { github: api } = context;
  try {
    const { data: job } = await api.actions.getWorkflowJob({
      ...repo,
      job_id: id,
    });
    const { data: wf } = await api.actions.getWorkflowRun({
      ...repo,
      run_id: job.run_id,
    });
    if (wf.head_branch === 'master') {
      context.log(chalk.yellow('Ignore master'));
      return null;
    }
    const [, workflow_id] = /\/(\d+)$/.exec(wf.workflow_url) ?? [];
    return {
      workflow_id: parseInt(workflow_id),
      branch: wf.head_branch,
      run_id: job.run_id,
      run_number: wf.run_number,
    };
  } catch (e) {
    context.log.error(chalk.red('unexpected error'), e);
    return null;
  }
}

Probot.run((app: Application) => {
  app.log('App loaded');
  app.on('check_run.created', async (context) => {
    const id = context.payload.check_run.id;
    const repo = context.repo();

    context.log('Running check:', chalk.grey(`${id}`));

    try {
      const { data: check } = await context.github.checks.get({
        ...repo,
        check_run_id: id,
      });
      if (check.app.slug !== 'github-actions') {
        context.log('Ignore app:', check.app.slug);
        return;
      }

      const wfres = await getWorkflowId(context, repo, id);
      if (!wfres) {
        context.log.warn('Missing workflow data');
        return;
      }

      const { run_id, run_number, ...wf } = wfres;

      const { data: runs } = await context.github.actions.listWorkflowRuns({
        ...repo,
        ...wf,
      });

      const event = context.event;

      context.log('event:', event);

      for (const run of runs.workflow_runs) {
        if (run.id === run_id) {
          context.log(chalk.yellow('Ignore me'), ':', chalk.grey(run.html_url));
          continue;
        }

        if (run.run_number > run_number) {
          context.log(
            chalk.yellow('Ignore newer'),
            ':',
            chalk.grey(run.html_url)
          );
          continue;
        }
        if (run.status !== 'in_progress' && run.status !== 'queued') {
          context.log(
            chalk.yellow(`Ignore state`),
            run.status,
            ':',
            chalk.grey(run.html_url)
          );
          continue;
        }
        if (run.event !== event) {
          context.log(
            chalk.yellow(`Ignore event`),
            run.event,
            ':',
            chalk.grey(run.html_url)
          );
          continue;
        }
        if (dryRun) {
          context.log.warn(
            chalk.yellow('[DRY_RUN]'),
            chalk.blue('Would cancel'),
            ':',
            run.id,
            chalk.grey(run.html_url)
          );
          continue;
        }

        context.log.info(
          chalk.blue('Cancel:'),
          ':',
          run.id,
          chalk.grey(run.html_url)
        );
        await context.github.actions.cancelWorkflowRun({
          ...repo,
          run_id: run.id,
        });
      }
    } catch (e) {
      context.log.error(chalk.red('unexpected error'), e);
    }
  });
});
