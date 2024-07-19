export type EventEmitterListener<T> = (event: T) => void;

export class EventEmitter<T> {
  listeners = new Set<EventEmitterListener<T>>();

  on(listener: EventEmitterListener<T>): void {
    this.listeners.add(listener);
  }

  emit(event: T): void {
    for (const listener of [...this.listeners]) {
      listener(event);
    }
  }
}
