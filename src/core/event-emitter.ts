export interface BaseEvent {
  id: string;
  disabled: boolean;
}

export type EventEmitterListener<T> = (event: T) => void;

export class EventEmitter<T extends BaseEvent> {
  queue: Set<EventEmitterListener<T>>[] = [];

  on(priority: number, listener: EventEmitterListener<T>): () => void {
    if (!(priority in this.queue)) {
      this.queue[priority] = new Set();
    }
    this.queue[priority].add(listener);
    return this.off.bind(this, priority, listener);
  }

  off(priority: number, listener: EventEmitterListener<T>): void {
    if (priority in this.queue) {
      this.queue[priority].delete(listener);
    }
  }

  emit(event: T): void {
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
