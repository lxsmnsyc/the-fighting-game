/**
 * Something that can be switched on and off as a whole.
 */
export interface Lifecycle {
  start(): void;
  stop(): void;
}

/**
 * Starts and stops a group of lifecycles together, such as every
 * listener one card registers.
 */
export class MergedLifecycle implements Lifecycle {
  constructor(public readonly lifecycles: Lifecycle[]) {
    // no-op
  }

  start(): void {
    for (const lifecycle of this.lifecycles) {
      lifecycle.start();
    }
  }

  stop(): void {
    for (const lifecycle of this.lifecycles) {
      lifecycle.stop();
    }
  }
}
