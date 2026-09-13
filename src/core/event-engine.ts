import {
  type BaseEvent,
  EventEmitter,
  type EventEmitterListener,
  type EventListenerLifecycle,
} from './event-emitter';

export type EventDefinition = [event: BaseEvent, priority: number];

export type EventMap = Record<number | string, EventDefinition>;

type EmitterMap<T extends EventMap> = {
  [K in keyof T]?: EventEmitter<T[K][0], T[K][1]>;
};

/**
 * One bus for many event types. Each type has its own emitter and
 * priority scale, as declared by the event map.
 */
export class EventEngine<T extends EventMap> {
  private readonly emitters: EmitterMap<T> = {};

  private getEmitter<K extends keyof T>(type: K): EventEmitter<T[K][0], T[K][1]> {
    const current = this.emitters[type];
    if (current) {
      return current;
    }
    const emitter = new EventEmitter<T[K][0], T[K][1]>();
    this.emitters[type] = emitter;
    return emitter;
  }

  on<K extends keyof T>(
    type: K,
    priority: T[K][1],
    listener: EventEmitterListener<T[K][0]>,
  ): EventListenerLifecycle<T[K][0]> {
    return this.getEmitter(type).on(priority, listener);
  }

  off<K extends keyof T>(
    type: K,
    priority: T[K][1],
    listener: EventEmitterListener<T[K][0]>,
  ): void {
    this.getEmitter(type).off(priority, listener);
  }

  emit<K extends keyof T>(type: K, event: T[K][0]): void {
    this.getEmitter(type).emit(event);
  }
}
