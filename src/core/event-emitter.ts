export interface BaseEvent {
  id: string;
  disabled: boolean;
}

export type EventEmitterListener<T> = (event: T) => void;

export class EventEmitter<T extends BaseEvent, P extends number> {
  queue: Set<EventEmitterListener<T>>[] = [];

  on(priority: P, listener: EventEmitterListener<T>): () => void {
    if (!(priority in this.queue)) {
      this.queue[priority] = new Set();
    }
    this.queue[priority].add(listener);
    return this.off.bind(this, priority, listener);
  }

  off(priority: P, listener: EventEmitterListener<T>): void {
    if (priority in this.queue) {
      this.queue[priority].delete(listener);
    }
  }

  emit(event: T): void {
    if (event.disabled) {
      return;
    }
    const queue = [...this.queue];
    for (let i = 0, len = queue.length; i < len; i++) {
      const listeners = queue[i];
      if (event.disabled) {
        return;
      }
      if (listeners) {
        for (const listener of [...listeners]) {
        if (event.disabled) {
          return;
        }
          listener(event);
        }
      }
    }
  }
}
