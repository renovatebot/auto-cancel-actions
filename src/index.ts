import { Application, Probot } from 'probot';
import { Runner } from './runner';

Probot.run((app: Application) => {
  app.log('App loaded');
  app.on('check_run.created', (context) => new Runner(context).run());
});
