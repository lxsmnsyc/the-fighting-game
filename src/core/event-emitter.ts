export type EventEmitterListener<T> = (event: T) => void;

export class EventEmitter<T> {
  queue: Set<EventEmitterListener<T>>[] = [];

  on(priority: number, listener: EventEmitterListener<T>): void {
    if (!(priority in this.queue)) {
      this.queue[priority] = new Set();
    }
    this.queue[priority].add(listener);
  }

  emit(event: T): void {
    const queue = [...this.queue];
    for (let i = 0, len = queue.length; i < len; i++) {
      const listeners = queue[i];
      if (listeners) {
        for (const listener of [...listeners]) {
          listener(event);
        }
      }
    }
  }
}
