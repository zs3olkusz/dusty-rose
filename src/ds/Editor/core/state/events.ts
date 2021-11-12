import EventEmitter from 'events';

const emitter = new EventEmitter();

const VALID_EVENTS = [
  'ds:state-changed',
  'ds:state-editors-changed',
  'ds:state-tabManager-changed',
  'ds:state-tabs-changed',
  'ds:state-workspace-changed',
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
