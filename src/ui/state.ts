import { type Accessor, createSignal, onCleanup } from 'solid-js';
import type Battle from '../battle/core';
import { BattleEvents } from '../battle/events';
import { isMissedDamage } from '../battle/mechanics/damage';
import { DamagePriority, type DamageType, type Energy, ValuePriority } from '../battle/types';
import type Unit from '../battle/unit';
import { EventPriority } from '../core/event-emitter';
import { MergedLifecycle } from '../core/lifecycle';
import type { AbilityInstance } from '../game/ability';
import type { CardInstance } from '../game/card';
import { GameEvents } from '../game/events';
import type Game from '../game/game';

/**
 * A signal that changes whenever the run changes. Read it inside a
 * computation to re-read the mutable game state.
 */
export function createGameVersion(game: Game): Accessor<number> {
  const [version, setVersion] = createSignal(0);
  const bump = (): void => {
    setVersion((value) => value + 1);
  };

  const lifecycle = new MergedLifecycle([
    game.on(GameEvents.End, EventPriority.Post, bump),
    game.on(GameEvents.StartRound, EventPriority.Post, bump),
    game.on(GameEvents.SetStat, ValuePriority.Post, bump),
    game.on(GameEvents.OpenShop, EventPriority.Post, bump),
    game.on(GameEvents.RerollShop, EventPriority.Post, bump),
    game.on(GameEvents.BuyCard, EventPriority.Post, bump),
    game.on(GameEvents.AcquireCard, EventPriority.Post, bump),
    game.on(GameEvents.SellCard, EventPriority.Post, bump),
    game.on(GameEvents.EnableCard, EventPriority.Post, bump),
    game.on(GameEvents.DisableCard, EventPriority.Post, bump),
    game.on(GameEvents.StartBattle, EventPriority.Post, bump),
    game.on(GameEvents.EndBattle, EventPriority.Post, bump),
    game.on(GameEvents.OfferAbilities, EventPriority.Post, bump),
    game.on(GameEvents.PickAbility, EventPriority.Post, bump),
    game.on(GameEvents.AcquireAbility, EventPriority.Post, bump),
  ]);
  onCleanup(() => {
    lifecycle.stop();
  });

  return version;
}

export const enum Side {
  Player = 0,
  Enemy = 1,
}

/**
 * Damage, flying from the dealer's side to the target's health.
 */
export interface DamageProjectile {
  kind: 'damage';
  id: number;
  from: Side;
  to: Side;
  type: DamageType;
}

/**
 * Energy handed out by a card, flying from the card to the receiver.
 */
export interface EnergyProjectile {
  kind: 'energy';
  id: number;
  card: CardInstance;
  to: Side;
  energy: Energy;
}

export type Projectile = DamageProjectile | EnergyProjectile;

export interface BattleView {
  readonly battle: Battle;
  readonly units: Record<Side, Unit[]>;
  /**
   * Changes on every tick. Read it to re-read unit state.
   */
  readonly version: Accessor<number>;
  readonly projectiles: Accessor<Projectile[]>;
  removeProjectile(id: number): void;
  /**
   * Calls `play` whenever the card or ability triggers, until the
   * calling component is cleaned up.
   */
  onTrigger(source: TriggerSource, play: () => void): void;
}

export type TriggerSource = CardInstance | AbilityInstance;

export function createBattleView(game: Game, battle: Battle): BattleView {
  const [version, setVersion] = createSignal(0);
  const [projectiles, setProjectiles] = createSignal<Projectile[]>([]);
  const triggers = new Map<TriggerSource, Set<() => void>>();
  const play = (source: TriggerSource): void => {
    for (const current of triggers.get(source) ?? []) {
      current();
    }
  };
  let nextProjectile = 0;

  const bump = (): void => {
    setVersion((value) => value + 1);
  };
  const addProjectile = (projectile: Projectile): void => {
    setProjectiles((current) => [...current, projectile]);
  };
  const getSide = (unit: Unit): Side =>
    unit.team.player === game.player ? Side.Player : Side.Enemy;

  const units: Record<Side, Unit[]> = { [Side.Player]: [], [Side.Enemy]: [] };
  for (const unit of battle.units()) {
    units[getSide(unit)].push(unit);
  }

  const lifecycle = new MergedLifecycle([
    battle.on(BattleEvents.Start, EventPriority.Post, bump),
    battle.on(BattleEvents.Fight, EventPriority.Post, bump),
    battle.on(BattleEvents.Tick, EventPriority.Post, bump),
    battle.on(BattleEvents.End, EventPriority.Post, bump),
    battle.on(BattleEvents.UnitTriggerCard, EventPriority.Post, (event) => {
      play(event.card);
    }),
    battle.on(BattleEvents.UnitTriggerAbility, EventPriority.Post, (event) => {
      play(event.ability);
    }),
    battle.on(BattleEvents.UnitDamage, DamagePriority.Post, (event) => {
      if (isMissedDamage(event.flags) || event.value <= 0) {
        return;
      }
      addProjectile({
        kind: 'damage',
        id: nextProjectile++,
        from: getSide(event.source),
        to: getSide(event.target),
        type: event.type,
      });
    }),
    // Energy gained while a card trigger resolves came from that card
    battle.on(BattleEvents.UnitAddEnergy, ValuePriority.Post, (event) => {
      const trigger = battle.cardTriggers.at(-1);
      if (!trigger || event.value <= 0) {
        return;
      }
      addProjectile({
        kind: 'energy',
        id: nextProjectile++,
        card: trigger.card,
        to: getSide(event.source),
        energy: event.energy,
      });
    }),
  ]);
  onCleanup(() => {
    lifecycle.stop();
  });

  return {
    battle,
    units,
    version,
    projectiles,
    removeProjectile(id: number): void {
      setProjectiles((current) => current.filter((projectile) => projectile.id !== id));
    },
    onTrigger(source: TriggerSource, callback: () => void): void {
      const set = triggers.get(source) ?? new Set();
      set.add(callback);
      triggers.set(source, set);
      onCleanup(() => {
        set.delete(callback);
      });
    },
  };
}
