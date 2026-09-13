import type { Lifecycle } from './lifecycle';

export interface BaseEvent {
  id: string;
  /**
   * A listener sets this to stop the event. The listeners after it
   * are skipped.
   */
  disabled: boolean;
}

/**
 * The default priority scale. `Exact` is the mechanic's own answer.
 * `Pre` runs before it and `Post` reacts to or modifies it.
 */
export const enum EventPriority {
  Pre = 0,
  Exact = 1,
  Post = 2,
}

export interface EventEmitterListener<T> {
  (event: T): void;

  disabled?: boolean;
}

/**
 * Switches one listener on and off without removing it from its queue.
 */
export class EventListenerLifecycle<T> implements Lifecycle {
  constructor(private readonly listener: EventEmitterListener<T>) {
    // no-op
  }

  start(): void {
    this.listener.disabled = false;
  }

  stop(): void {
    this.listener.disabled = true;
  }
}

// Read through a call because listeners flip it mid-emit, and the
// checker would otherwise keep the narrowed value.
function isDisabled(event: BaseEvent): boolean {
  return event.disabled;
}

export class EventEmitter<T extends BaseEvent, P extends number> {
  // Sparse: indexed by priority
  private readonly queue: (Set<EventEmitterListener<T>> | undefined)[] = [];

  on(priority: P, listener: EventEmitterListener<T>): EventListenerLifecycle<T> {
    (this.queue[priority] ??= new Set()).add(listener);
    return new EventListenerLifecycle(listener);
  }

  off(priority: P, listener: EventEmitterListener<T>): void {
    this.queue[priority]?.delete(listener);
  }

  emit(event: T): void {
    // Copied so a listener added mid-emit waits for the next one
    for (const listeners of Array.from(this.queue)) {
      if (listeners) {
        for (const listener of Array.from(listeners)) {
          if (isDisabled(event)) {
            return;
          }
          if (!listener.disabled) {
            listener(event);
          }
        }
      }
    }
  }
}
