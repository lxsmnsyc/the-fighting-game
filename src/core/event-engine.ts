import { EventEmitter, type EventEmitterListener } from './event-emitter';

export interface BaseEvent {
  id: string;
}

export class EventEngine<T extends Record<number, BaseEvent>> {
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
