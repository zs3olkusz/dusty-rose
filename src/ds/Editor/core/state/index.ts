import { initialState } from './initial';

export function initState() {
  window.state = initialState;
}

export * from './reducers';
export * from './events';
