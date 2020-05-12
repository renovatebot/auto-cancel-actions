import { Probot, Application } from 'probot';
import { Runner } from './runner';

Probot.run((app: Application) => {
  app.log('App loaded');
  app.on('check_run.created', async (context) => {
    new Runner(context).run();
  });
});
