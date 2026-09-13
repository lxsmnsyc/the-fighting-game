import type Battle from '../battle/core';
import AleaRNG from '../core/alea';
import { EventEngine } from '../core/event-engine';
import type { CardInstance } from './card';
import { type GameEventMap, GameEvents } from './events';
import { Player } from './player';

/**
 * One run: the player, their deck, and the rounds between them.
 */
export default class Game extends EventEngine<GameEventMap> {
  readonly player: Player;

  readonly rng: {
    world: AleaRNG;
    boss: AleaRNG;
  };

  constructor(readonly seed: string) {
    super();

    const world = new AleaRNG(seed);
    this.rng = {
      world,
      boss: new AleaRNG(world.int32().toString()),
    };
    this.player = new Player(world.int32());
  }

  setup(): void {
    this.emit(GameEvents.Setup, { id: 'Setup', disabled: false });
  }

  start(): void {
    this.emit(GameEvents.Start, { id: 'Start', disabled: false });
  }

  nextRound(): void {
    this.emit(GameEvents.NextRound, { id: 'NextRound', disabled: false });
  }

  startRound(battle: Battle): void {
    this.emit(GameEvents.StartRound, {
      id: 'StartRound',
      disabled: false,
      battle,
    });
  }

  end(): void {
    this.emit(GameEvents.End, { id: 'End', disabled: false });
  }

  enableCard(card: CardInstance): void {
    this.emit(GameEvents.EnableCard, {
      id: 'EnableCard',
      disabled: false,
      card,
    });
  }

  disableCard(card: CardInstance): void {
    this.emit(GameEvents.DisableCard, {
      id: 'DisableCard',
      disabled: false,
      card,
    });
  }

  acquireCard(card: CardInstance): void {
    this.emit(GameEvents.AcquireCard, {
      id: 'AcquireCard',
      disabled: false,
      card,
    });
  }

  sellCard(card: CardInstance): void {
    this.emit(GameEvents.SellCard, {
      id: 'SellCard',
      disabled: false,
      card,
    });
  }
}
