import {
  type BaseEvent,
  EventEmitter,
  type EventEmitterListener,
} from './event-emitter';

export type EventDefinition = [event: BaseEvent, priority: number];

export type EventMap = Record<number | string, EventDefinition>;


export class EventEngine<T extends EventMap, K extends keyof T = keyof T> {
  private emitters: Partial<Record<K, EventEmitter<any, any>>> = {};

  on<E extends K, D extends EventDefinition = T[E]>(
    type: E,
    priority: D[1],
    listener: EventEmitterListener<D[0]>,
  ): () => void {
    this.emitters[type] ||= new EventEmitter();
    return this.emitters[type].on(priority, listener);
  }

  off<E extends K, D extends EventDefinition = T[E]>(
    type: E,
    priority: D[1],
    listener: EventEmitterListener<D[0]>,
  ): void {
    this.emitters[type] ||= new EventEmitter();
    this.emitters[type].off(priority, listener);
  }

  emit<E extends K, D extends EventDefinition = T[E]>(type: E, event: D[0]): void {
    this.emitters[type] ||= new EventEmitter();
    this.emitters[type].emit(event);
  }
}
