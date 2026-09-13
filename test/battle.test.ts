import { describe, expect, it } from 'vitest';
import { getAbility } from '../src/abilities';
import AbilityId from '../src/abilities/ids';
import Alliance from '../src/battle/alliance';
import type Battle from '../src/battle/core';
import { BattleEvents } from '../src/battle/events';
import { DamageFlags } from '../src/battle/flags';
import createBattle from '../src/battle/setup';
import { DamagePriority, DamageType, Energy, Stat, ValuePriority } from '../src/battle/types';
import type Unit from '../src/battle/unit';
import { getCard } from '../src/cards';
import CardId from '../src/cards/ids';
import { EventPriority } from '../src/core/event-emitter';
import { MergedLifecycle } from '../src/core/lifecycle';
import { AbilityInstance } from '../src/game/ability';
import { type Card, CardInstance, createCard } from '../src/game/card';
import { Player } from '../src/game/player';
import { fieldPlayer } from '../src/game/round';
import { Print, Rarity } from '../src/game/types';

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

// Leaves one mechanic to test on its own, without the energy every
// unit gains each second
function disableEnergyGain(battle: Battle): void {
  battle.on(BattleEvents.CheckUnitEnergyGain, ValuePriority.Post, (event) => {
    event.value = 0;
  });
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
    disableEnergyGain(battle);
    createSide(battle, [createPlayer()]);
    const [unit] = createSide(battle, [createPlayer()]).units;
    battle.start();

    unit.addEnergy(Energy.Poison, 100, false);
    run(battle, 1000 + FRAME);

    expect(unit.stats[Stat.Health]).toBe(900);
    expect(unit.getEnergy(Energy.Poison, false)).toBe(60);
  });

  it('gives every unit energy each second, and its enemy the unfriendly kinds', () => {
    const battle = createBattle('gain');
    const [unit] = createSide(battle, [createPlayer()]).units;
    const [enemy] = createSide(battle, [createPlayer()]).units;
    battle.on(BattleEvents.CheckUnitEnergyGain, ValuePriority.Additive, (event) => {
      if (event.source === unit && event.energy === Energy.Attack) {
        event.value += 5;
      }
    });
    battle.start();

    run(battle, 1000 - FRAME);
    expect(unit.getEnergy(Energy.Attack, false)).toBe(0);

    run(battle, FRAME * 2);
    expect(unit.getEnergy(Energy.Attack, false)).toBe(10);
    expect(enemy.getEnergy(Energy.Attack, false)).toBe(5);
    expect(enemy.getEnergy(Energy.Poison, false)).toBe(5);
    expect(unit.getEnergy(Energy.Poison, false)).toBe(5);
  });
});

describe('countdown', () => {
  it('holds the fight until the countdown is spent', () => {
    const battle = createBattle('countdown', { countdown: 1000 });
    const [unit] = createSide(battle, [createPlayer()]).units;
    createSide(battle, [createPlayer()]);

    battle.start();
    expect(battle.fighting).toBe(false);
    expect(unit.alive).toBe(false);

    run(battle, 1000 + FRAME);
    expect(battle.fighting).toBe(true);
    expect(unit.alive).toBe(true);
    expect(battle.elapsed).toBeLessThan(FRAME * 2);
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
    disableEnergyGain(battle);
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
      id: CardId.Refresh,
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
    expect(triggers).toEqual([CardId.Refresh, CardId.Blight]);
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

  it('never provide permanent energy', () => {
    // Asks for permanent Armor when the battle starts
    const permanentArmor = createCard({
      id: CardId.Harden,
      name: 'Harden',
      image: '',
      rarity: Rarity.Common,
      aspect: [],
      description: () => [],
      setup: ({ battle, unit, card }) =>
        new MergedLifecycle([
          battle.on(BattleEvents.UnitEntersBattle, EventPriority.Post, (event) => {
            if (event.source === unit) {
              unit.triggerCard(card, unit, 30);
            }
          }),
          battle.on(BattleEvents.UnitTriggerCard, EventPriority.Exact, (event) => {
            if (event.card === card) {
              unit.addEnergy(Energy.Armor, event.value, true);
            }
          }),
        ]),
    });

    const battle = createBattle('permanent');
    const [unit] = createSide(battle, [createPlayer([permanentArmor])]).units;
    battle.start();

    expect(unit.getEnergy(Energy.Armor, true)).toBe(0);
    expect(unit.getEnergy(Energy.Armor, false)).toBe(30);

    // Outside a card trigger, permanent energy still works
    unit.addEnergy(Energy.Armor, 10, true);
    expect(unit.getEnergy(Energy.Armor, true)).toBe(10);
  });

  it('return dodged damage as the same type with Riposte', () => {
    const battle = createBattle('riposte');
    const [attacker] = createSide(battle, [createPlayer()]).units;
    const [defender] = createSide(battle, [createPlayer([getCard(CardId.Riposte)])]).units;
    battle.start();

    const returned: DamageType[] = [];
    battle.on(BattleEvents.UnitDamage, DamagePriority.Post, (event) => {
      if (event.source === defender) {
        returned.push(event.type);
      }
    });

    // Every attack is dodged
    defender.addEnergy(Energy.Dodge, 1000, true);
    const attacks = 20;
    for (let i = 0; i < attacks; i++) {
      attacker.dealDamage(defender, DamageType.Magical, 10, DamageFlags.Attack);
    }

    expect(defender.stats[Stat.Health]).toBe(1000);
    // About half come back, each as the full dodged damage
    expect(returned.length).toBeGreaterThan(0);
    expect(returned.length).toBeLessThan(attacks);
    expect(returned.every((type) => type === DamageType.Magical)).toBe(true);
    expect(attacker.stats[Stat.Health]).toBe(1000 - 10 * returned.length);
  });

  it('repeat once with the secret of their energy', () => {
    const battle = createBattle('secret');
    const [unit] = createSide(battle, [
      createPlayer([getCard(CardId.Ambush), getCard(CardId.Savage)]),
    ]).units;
    const [other] = createSide(battle, [
      createPlayer([getCard(CardId.Ambush), getCard(CardId.Fortified)]),
    ]).units;

    const triggers: CardId[] = [];
    battle.on(BattleEvents.UnitTriggerCard, EventPriority.Post, (event) => {
      if (event.source === unit) {
        triggers.push(event.card.source.id);
      }
    });

    battle.start();

    // Ambush runs twice with Savage, and once with an Armor secret
    expect(unit.getEnergy(Energy.Attack, false)).toBe(40);
    expect(other.getEnergy(Energy.Attack, false)).toBe(20);
    expect(triggers).toEqual([CardId.Ambush, CardId.Savage, CardId.Ambush]);
  });

  it('repeat once however many copies of the secret there are', () => {
    const battle = createBattle('secret-copies');
    const player = createPlayer([getCard(CardId.Ambush), getCard(CardId.Savage)]);
    player.deck.push(new CardInstance(player, getCard(CardId.Savage), Print.Negative));
    const [unit] = createSide(battle, [player]).units;
    battle.start();

    expect(unit.getEnergy(Energy.Attack, false)).toBe(40);
  });

  it('apply inline effects once per repeat', () => {
    const battle = createBattle('secret-inline');
    const [unit] = createSide(battle, [
      createPlayer([getCard(CardId.Ferocious), getCard(CardId.Savage)]),
    ]).units;
    battle.start();

    // 10 gained, plus Ferocious's 20 bonus twice
    unit.addEnergy(Energy.Attack, 10, false);
    expect(unit.getEnergy(Energy.Attack, false)).toBe(50);
  });

  it('hand out energy from the trigger families', () => {
    const battle = createBattle('families');
    disableEnergyGain(battle);
    const player = createPlayer([
      getCard(CardId.Darting),
      getCard(CardId.Inspired),
      getCard(CardId.Resolute),
    ]);
    player.abilities.push(new AbilityInstance(player, getAbility(AbilityId.Turtle)));
    const [unit] = createSide(battle, [player]).units;
    const [enemy] = createSide(battle, [createPlayer([getCard(CardId.Siphon)])]).units;
    battle.start();

    // Darting: a dodged attack gives Speed
    unit.addEnergy(Energy.Dodge, 1000, true);
    enemy.dealDamage(unit, DamageType.Physical, 10, DamageFlags.Attack);
    expect(unit.getEnergy(Energy.Speed, false)).toBe(20);

    // Inspired: an ability trigger gives Attack
    unit.triggerAbility([...unit.abilities.keys()][0]);
    expect(unit.getEnergy(Energy.Attack, false)).toBe(30);

    // Resolute: only the first drop below half Health gives Healing
    unit.removeStat(Stat.Health, 600);
    unit.removeStat(Stat.Health, 100);
    expect(unit.getEnergy(Energy.Healing, false)).toBe(100);

    // Siphon: the enemy gains Magic when the unit takes Poison damage
    unit.addEnergy(Energy.Poison, 50, false);
    run(battle, 1000 + FRAME);
    expect(enemy.getEnergy(Energy.Magic, false)).toBe(10);
  });

  it('expose the trigger that is still resolving', () => {
    const battle = createBattle('resolving');
    const [unit] = createSide(battle, [createPlayer([getCard(CardId.Ambush)])]).units;

    const sources: (CardId | undefined)[] = [];
    battle.on(BattleEvents.UnitAddEnergy, ValuePriority.Post, () => {
      sources.push(battle.cardTriggers.at(-1)?.card.source.id);
    });

    battle.start();
    unit.addEnergy(Energy.Armor, 10, false);

    expect(sources).toEqual([CardId.Ambush, undefined]);
    expect(battle.cardTriggers).toHaveLength(0);
  });
});
