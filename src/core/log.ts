const LOG = true;

export function log(...args: any): void {
  if (LOG) {
    console.log(...args);
  }
}
