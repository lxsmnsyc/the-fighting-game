import {
  type BaseEvent,
  EventEmitter,
  type EventEmitterListener,
} from './event-emitter';

type EventMap = {
  [event: number]: BaseEvent;
};

export class EventEngine<T extends EventMap> {
  private emitters: Partial<Record<keyof T, EventEmitter<any>>> = {};

  on<E extends keyof T>(
    type: E,
    priority: number,
    listener: EventEmitterListener<T[E]>,
  ): () => void {
    this.emitters[type] ||= new EventEmitter();
    return this.emitters[type].on(priority, listener);
  }

  off<E extends keyof T>(
    type: E,
    priority: number,
    listener: EventEmitterListener<T[E]>,
  ): void {
    this.emitters[type] ||= new EventEmitter();
    this.emitters[type].off(priority, listener);
  }

  emit<E extends keyof T>(type: E, event: T[E]): void {
    this.emitters[type] ||= new EventEmitter();
    this.emitters[type].emit(event);
  }
}
