import type CardId from '../cards/ids';
import AleaRNG from '../core/alea';
import { EventEngine } from '../core/event-engine';
import type Alliance from './alliance';
import { type BattleEventMap, BattleEvents } from './events';
import type Team from './team';
import type Unit from './unit';

/**
 * One fight. Alliances hold teams, teams hold units, and every
 * mechanic and card is a listener on this bus.
 */
export default class Battle extends EventEngine<BattleEventMap> {
  readonly rng: AleaRNG;

  constructor(readonly seed: string) {
    super();
    this.rng = new AleaRNG(seed);
  }

  /**
   * Whether the battle has ended. The outcome mechanics set it.
   */
  settled = false;

  /**
   * The alliance left standing once the battle settles. Null when
   * nobody is left.
   */
  winner: Alliance | null = null;

  /**
   * Whether `start` has run and the clock is running.
   */
  started = false;

  /**
   * Battle time left before the fight begins, in milliseconds.
   */
  countdown = 0;

  /**
   * Whether the countdown is over and the units have entered.
   */
  fighting = false;

  /**
   * Battle time since the fight began, in milliseconds.
   */
  elapsed = 0;

  /**
   * How long the battle may run before it ends in a draw, in
   * milliseconds. Zero means no limit.
   */
  timeLimit = 0;

  readonly alliances = new Set<Alliance>();

  /**
   * Cards whose trigger is still resolving. None of them can trigger
   * again until it finishes, however many events lie in between.
   */
  readonly triggeringCards = new Set<CardId>();

  start(): void {
    this.emit(BattleEvents.Start, {
      id: 'Start',
      disabled: false,
    });
  }

  fight(): void {
    this.emit(BattleEvents.Fight, {
      id: 'Fight',
      disabled: false,
    });
  }

  end(): void {
    this.emit(BattleEvents.End, {
      id: 'End',
      disabled: false,
    });
  }

  tick(duration: number): void {
    this.emit(BattleEvents.Tick, {
      id: 'Tick',
      disabled: false,
      duration,
    });
  }

  addAlliance(alliance: Alliance): void {
    this.emit(BattleEvents.AddAlliance, {
      id: 'AddAlliance',
      disabled: false,
      alliance,
    });
  }

  removeAlliance(alliance: Alliance): void {
    this.emit(BattleEvents.RemoveAlliance, {
      id: 'RemoveAlliance',
      disabled: false,
      alliance,
    });
  }

  /**
   * Every team, optionally leaving out one alliance (such as a unit's
   * own, to reach only enemies).
   */
  *teams(exclude?: Alliance): Generator<Team, void, undefined> {
    for (const alliance of this.alliances) {
      if (alliance !== exclude) {
        yield* alliance.teams;
      }
    }
  }

  /**
   * Every unit, optionally leaving out one alliance.
   */
  *units(exclude?: Alliance): Generator<Unit, void, undefined> {
    for (const team of this.teams(exclude)) {
      yield* team.units;
    }
  }
}
