import { Probot } from 'probot';
import { Runner } from './runner';
import { ProbotCheckRunContext } from './types';

Probot.run((app) => {
  app.log('App loaded');
  app.on('check_run.created', (context: ProbotCheckRunContext) =>
    new Runner(context).run()
  );
}).catch((e) => {
  console.error('unexpected error', e);
  process.exit(100);
});
