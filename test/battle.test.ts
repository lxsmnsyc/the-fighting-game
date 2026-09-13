import { describe, expect, it } from 'vitest';
import Alliance from '../src/battle/alliance';
import type Battle from '../src/battle/core';
import { BattleEvents } from '../src/battle/events';
import { DamageFlags } from '../src/battle/flags';
import createBattle from '../src/battle/setup';
import { DamageType, Energy, Stat, ValuePriority } from '../src/battle/types';
import type Unit from '../src/battle/unit';
import { getCard } from '../src/cards';
import CardId from '../src/cards/ids';
import { EventPriority } from '../src/core/event-emitter';
import { MergedLifecycle } from '../src/core/lifecycle';
import { type Card, CardInstance, createCard } from '../src/game/card';
import { Player } from '../src/game/player';
import { fieldPlayer } from '../src/game/round';
import { Rarity } from '../src/game/types';

const FRAME = 1000 / 60;

// Copies are made without a print, so card values are exact
function createPlayer(cards: Card[] = []): Player {
  const player = new Player();
  for (const card of cards) {
    player.deck.push(new CardInstance(player, card));
  }
  return player;
}

function createSide(battle: Battle, players: Player[]): { alliance: Alliance; units: Unit[] } {
  const alliance = new Alliance(battle);
  battle.addAlliance(alliance);
  const units = players.map((player) => fieldPlayer(battle, alliance, player));
  return { alliance, units };
}

function run(battle: Battle, duration: number): void {
  for (let time = 0; time < duration && !battle.settled; time += FRAME) {
    battle.tick(FRAME);
  }
}

describe('battle', () => {
  it('ends with the alliance that still has units standing', () => {
    const battle = createBattle('outcome');
    const left = createSide(battle, [createPlayer()]);
    const right = createSide(battle, [createPlayer()]);
    battle.start();

    left.units[0].addEnergy(Energy.Attack, 200, true);
    run(battle, 60_000);

    expect(battle.settled).toBe(true);
    expect(battle.winner).toBe(left.alliance);
    expect(right.units[0].alive).toBe(false);
  });

  it('only targets units of other alliances', () => {
    const battle = createBattle('targeting');
    const left = createSide(battle, [createPlayer(), createPlayer()]);
    const right = createSide(battle, [createPlayer(), createPlayer()]);
    battle.start();

    for (let i = 0; i < 20; i++) {
      const target = left.units[0].checkEnemy();
      expect(target && right.units.includes(target)).toBe(true);
    }
  });

  it('reduces damage with armor and consumes it', () => {
    const battle = createBattle('armor');
    const [attacker] = createSide(battle, [createPlayer()]).units;
    const [defender] = createSide(battle, [createPlayer()]).units;
    battle.start();

    defender.addEnergy(Energy.Armor, 30, false);
    attacker.dealDamage(defender, DamageType.Physical, 100, DamageFlags.Attack);

    expect(defender.stats[Stat.Health]).toBe(930);
    expect(defender.getEnergy(Energy.Armor, false)).toBe(18);
  });

  it('counters the paired energy before adding the rest', () => {
    const battle = createBattle('counters');
    const [unit] = createSide(battle, [createPlayer()]).units;
    battle.start();

    unit.addEnergy(Energy.Armor, 30, false);
    unit.addEnergy(Energy.Corrosion, 50, false);

    expect(unit.getEnergy(Energy.Armor, false)).toBe(0);
    expect(unit.getEnergy(Energy.Corrosion, false)).toBe(20);
  });

  it('hurts the unit carrying poison every second', () => {
    const battle = createBattle('poison');
    createSide(battle, [createPlayer()]);
    const [unit] = createSide(battle, [createPlayer()]).units;
    battle.start();

    unit.addEnergy(Energy.Poison, 100, false);
    run(battle, 1000 + FRAME);

    expect(unit.stats[Stat.Health]).toBe(900);
    expect(unit.getEnergy(Energy.Poison, false)).toBe(60);
  });
});

describe('cards', () => {
  it('run while enabled and skip while disabled', () => {
    const battle = createBattle('cards');
    const enabled = createPlayer([getCard(CardId.Ambush)]);
    const disabled = createPlayer([getCard(CardId.Ambush)]);
    disabled.deck[0].disabled = true;

    const [left] = createSide(battle, [enabled]).units;
    const [right] = createSide(battle, [disabled]).units;
    battle.start();

    expect(left.getEnergy(Energy.Attack, false)).toBe(20);
    expect(right.getEnergy(Energy.Attack, false)).toBe(0);
  });

  it('repeat a natural attack once with Ambidextrous', () => {
    const battle = createBattle('ambidextrous');
    const [attacker] = createSide(battle, [createPlayer([getCard(CardId.Ambidextrous)])]).units;
    const [defender] = createSide(battle, [createPlayer()]).units;

    let attacks = 0;
    battle.on(BattleEvents.UnitAttack, ValuePriority.Post, () => {
      attacks++;
    });

    battle.start();
    attacker.addEnergy(Energy.Attack, 100, true);
    // One natural attack at zero Speed and Slow
    run(battle, 2700);

    expect(attacks).toBe(2);
    // Only the first attack is halved
    expect(defender.stats[Stat.Health]).toBe(900);
  });

  it('never trigger again from a chain their own trigger started', () => {
    // Poison when healed, and a heal when poisoned, would loop forever
    const poisonWhenHealed = createCard({
      id: CardId.Blight,
      name: 'Blight',
      image: '',
      rarity: Rarity.Common,
      aspect: [],
      description: () => [],
      setup: ({ battle, unit, card }) =>
        new MergedLifecycle([
          battle.on(BattleEvents.UnitHeal, ValuePriority.Post, (event) => {
            if (event.target === unit) {
              unit.triggerCard(card, unit, 10);
            }
          }),
          battle.on(BattleEvents.UnitTriggerCard, EventPriority.Exact, (event) => {
            if (event.card === card) {
              unit.addEnergy(Energy.Poison, event.value, false);
            }
          }),
        ]),
    });
    const healWhenPoisoned = createCard({
      id: CardId.Mend,
      name: 'Mend',
      image: '',
      rarity: Rarity.Common,
      aspect: [],
      description: () => [],
      setup: ({ battle, unit, card }) =>
        new MergedLifecycle([
          battle.on(BattleEvents.UnitAddEnergy, ValuePriority.Post, (event) => {
            if (event.source === unit && event.energy === Energy.Poison) {
              unit.triggerCard(card, unit, 10);
            }
          }),
          battle.on(BattleEvents.UnitTriggerCard, EventPriority.Exact, (event) => {
            if (event.card === card) {
              unit.heal(unit, event.value, 0);
            }
          }),
        ]),
    });

    const battle = createBattle('chain');
    const [unit] = createSide(battle, [createPlayer([poisonWhenHealed, healWhenPoisoned])]).units;

    const triggers: CardId[] = [];
    battle.on(BattleEvents.UnitTriggerCard, EventPriority.Post, (event) => {
      triggers.push(event.card.source.id);
    });

    battle.start();
    unit.removeStat(Stat.Health, 100);
    unit.heal(unit, 10, 0);

    // The inner trigger finishes first
    expect(triggers).toEqual([CardId.Mend, CardId.Blight]);
    expect(unit.stats[Stat.Health]).toBe(920);
  });

  it('give friendly energy to the attacker and unfriendly energy to the target on a critical hit', () => {
    const battle = createBattle('critical');
    const [attacker] = createSide(battle, [
      createPlayer([getCard(CardId.Deadly), getCard(CardId.Stagger)]),
    ]).units;
    const [defender] = createSide(battle, [createPlayer()]).units;
    battle.start();

    // Enough Critical energy that every attack is critical
    attacker.addEnergy(Energy.Critical, 1000, true);
    attacker.attack(defender, 10, 0);

    expect(attacker.getEnergy(Energy.Critical, false)).toBe(30);
    expect(defender.getEnergy(Energy.Slow, false)).toBe(30);
  });
});
