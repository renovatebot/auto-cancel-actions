import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods';
import { EventPayloads, WebhookEvent } from '@octokit/webhooks';
import { Context } from 'probot';

export type ProbotCheckRunContext = WebhookEvent<EventPayloads.WebhookPayloadCheckRun> &
  Omit<Context, keyof WebhookEvent>;

export type GetJobForWorkflowRunResponse = {
  data: { run_id: number };
};

export type GetWorkflowRunResponse = RestEndpointMethodTypes['actions']['getWorkflowRun']['response'];

export type EventConfig = {
  branches?: string[];
};

export enum EventType {
  push = 'push',
  pull_request = 'pull_request',
}
export const EVENT_TYPES: string[] = [EventType.push, EventType.pull_request];

export function isEvent(ev: string): ev is EventType {
  return EVENT_TYPES.includes(ev);
}

export interface Config {
  dryRun?: boolean;
  pull_request?: EventConfig;
  push?: EventConfig;
  version: number;
}

export type WorkflowData = {
  branch: string;
  event: string;
  run_id: number;
  run_number: number;
  workflow_id: number;
};
