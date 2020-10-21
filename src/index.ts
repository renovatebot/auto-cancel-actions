import { Application, Probot } from 'probot';
import { Runner } from './runner';
import { ProbotCheckRunContext } from './types';

Probot.run((app: Application) => {
  app.log('App loaded');
  // TODO: fix types
  app.on('check_run.created', (context) =>
    new Runner(context as ProbotCheckRunContext).run()
  );
}).catch((e) => {
  console.error('unexpected error', e);
  process.exit(100);
});
