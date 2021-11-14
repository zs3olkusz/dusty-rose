export * from './files';

export function genId() {
  return Math.random().toString(36).substr(2, 9);
}
