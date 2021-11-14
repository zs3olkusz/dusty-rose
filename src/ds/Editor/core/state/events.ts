import EventEmitter from 'events';

const emitter = new EventEmitter();

const VALID_EVENTS = [
  // Primary events
  'ds:state-changed',
  'ds:state-editors-changed',
  'ds:state-tabManager-changed',
  'ds:state-tabs-changed',
  'ds:state-workspace-changed',

  // Tab manager events
  'ds:tabManager-add',
  'ds:tabManager-tab-add',
  'ds:tabManager-tab-active',
  'ds:tabManager-tab-update',
  'ds:tabManager-tab-open',
  'ds:tabManager-tab-close',

  // Tab events
  'ds:tab-add',
  'ds:tab-changed',
  'ds:tab-remove',

  // Editor events
  'ds:editor-add',
  'ds:editor-changed',
  'ds:editor-remove',

  // Workspace events
  'ds:workspace-add',
  'ds:workspace-changed',
  'ds:workspace-remove',
];

export function listen(event: string, callback: (...args: any[]) => void) {
  if (VALID_EVENTS.indexOf(event) === -1) {
    throw new Error(`Invalid event: ${event}`);
  }

  emitter.on(event, callback);
}

export function emit(event: string, ...args: any[]) {
  if (VALID_EVENTS.indexOf(event) === -1) {
    throw new Error(`Invalid event: ${event}`);
  }

  emitter.emit(event, ...args);
}
