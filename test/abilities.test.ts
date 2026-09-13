import { describe, expect, it } from 'vitest';
import ABILITIES, { getAbility } from '../src/abilities';
import AbilityId from '../src/abilities/ids';
import Alliance from '../src/battle/alliance';
import type Battle from '../src/battle/core';
import { BattleEvents } from '../src/battle/events';
import { AttackFlags } from '../src/battle/flags';
import createBattle from '../src/battle/setup';
import { Energy, Stat, ValuePriority } from '../src/battle/types';
import type Unit from '../src/battle/unit';
import { EventPriority } from '../src/core/event-emitter';
import { MergedLifecycle } from '../src/core/lifecycle';
import { type Ability, AbilityInstance, createAbility } from '../src/game/ability';
import { TokenType, formatDescription } from '../src/game/description';
import { Player } from '../src/game/player';
import { fieldPlayer } from '../src/game/round';
import { Aspect } from '../src/game/types';

const FRAME = 1000 / 60;

function createPlayer(abilities: Ability[] = []): Player {
  const player = new Player();
  for (const ability of abilities) {
    player.abilities.push(new AbilityInstance(player, ability));
  }
  return player;
}

function createUnit(battle: Battle, abilities: Ability[] = []): Unit {
  const alliance = new Alliance(battle);
  battle.addAlliance(alliance);
  return fieldPlayer(battle, alliance, createPlayer(abilities));
}

function run(battle: Battle, duration: number): void {
  for (let time = 0; time < duration && !battle.settled; time += FRAME) {
    battle.tick(FRAME);
  }
}

function getInstance(unit: Unit, id: AbilityId): AbilityInstance {
  const instance = [...unit.abilities.keys()].find((ability) => ability.source.id === id);
  if (!instance) {
    throw new Error(`The unit has no ability ${id}`);
  }
  return instance;
}

// Does nothing, so only the cooldown is under test
const IDLE = createAbility({
  id: AbilityId.Viper,
  name: 'Idle',
  image: '',
  aspects: [Aspect.Speed, Aspect.Slow],
  cooldown: 1000,
  description: () => [],
  setup: () => new MergedLifecycle([]),
});

describe('ability registry', () => {
  it('gives every ability a unique id', () => {
    const ids = ABILITIES.map((ability) => ability.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const ability of ABILITIES) {
      expect(getAbility(ability.id)).toBe(ability);
    }
  });

  it('gives every ability a unique one-word name', () => {
    const names = ABILITIES.map((ability) => ability.name);
    expect(new Set(names).size).toBe(names.length);
    for (const name of names) {
      expect(name).toMatch(/^[A-Z][a-z]+$/);
    }
  });

  it('combines two different aspects on a cooldown', () => {
    for (const ability of ABILITIES) {
      const [first, second] = ability.aspects;
      expect(first).not.toBe(second);
      expect(ability.cooldown).toBeGreaterThan(0);
    }
  });

  it('gives every ability a unique ordered pair of aspects', () => {
    const pairs = ABILITIES.map(({ aspects: [first, second] }) => `${first}:${second}`);
    expect(new Set(pairs).size).toBe(pairs.length);
  });

  it('describes every ability with highlighted parts', () => {
    for (const ability of ABILITIES) {
      const description = ability.description();
      expect(formatDescription(description)).toMatch(/^[A-Z].*\.$/);
      expect(description.some((part) => part.type !== TokenType.Text)).toBe(true);
    }
  });
});

describe('ability cooldowns', () => {
  it('trigger once every cooldown while the unit stands', () => {
    const battle = createBattle('cooldown');
    const unit = createUnit(battle, [IDLE]);
    createUnit(battle);

    let triggers = 0;
    battle.on(BattleEvents.UnitTriggerAbility, EventPriority.Post, () => {
      triggers++;
    });

    battle.start();
    run(battle, 2500);
    expect(triggers).toBe(2);

    unit.removeStat(Stat.Health, unit.stats[Stat.Health]);
    run(battle, 2000);
    expect(triggers).toBe(2);
  });

  it('shorten with Speed and lengthen with Slow', () => {
    const battle = createBattle('haste');
    const fast = createUnit(battle, [IDLE]);
    const slow = createUnit(battle, [IDLE]);
    battle.start();

    fast.addEnergy(Energy.Speed, 1000, true);
    slow.addEnergy(Energy.Slow, 1000, true);

    expect(fast.checkAbilityCooldown(getInstance(fast, AbilityId.Viper))).toBe(500);
    expect(slow.checkAbilityCooldown(getInstance(slow, AbilityId.Viper))).toBe(1500);
  });
});

describe('abilities', () => {
  it('Turtle gains Armor, then heals by it', () => {
    const battle = createBattle('turtle');
    const unit = createUnit(battle, [getAbility(AbilityId.Turtle)]);
    createUnit(battle);
    battle.start();

    unit.removeStat(Stat.Health, 100);
    unit.triggerAbility(getInstance(unit, AbilityId.Turtle));

    expect(unit.getEnergy(Energy.Armor, false)).toBe(40);
    expect(unit.stats[Stat.Health]).toBe(940);
  });

  it("Beetle takes the enemy's Armor and corrodes it", () => {
    const battle = createBattle('beetle');
    const unit = createUnit(battle, [getAbility(AbilityId.Beetle)]);
    const enemy = createUnit(battle);
    battle.start();

    enemy.addEnergy(Energy.Armor, 50, false);
    unit.triggerAbility(getInstance(unit, AbilityId.Beetle));

    expect(unit.getEnergy(Energy.Armor, false)).toBe(50);
    expect(enemy.getEnergy(Energy.Armor, false)).toBe(0);
    expect(enemy.getEnergy(Energy.Corrosion, false)).toBe(20);
  });

  it('Toad passes its Poison to the enemy and heals from it', () => {
    const battle = createBattle('toad');
    const unit = createUnit(battle, [getAbility(AbilityId.Toad)]);
    const enemy = createUnit(battle);
    battle.start();

    unit.addEnergy(Energy.Poison, 30, false);
    unit.triggerAbility(getInstance(unit, AbilityId.Toad));

    expect(unit.getEnergy(Energy.Poison, false)).toBe(0);
    expect(enemy.getEnergy(Energy.Poison, false)).toBe(30);
    expect(unit.getEnergy(Energy.Healing, false)).toBe(50);
  });

  it('Hawk always lands a critical hit', () => {
    const battle = createBattle('hawk');
    const unit = createUnit(battle, [getAbility(AbilityId.Hawk)]);
    const enemy = createUnit(battle);
    battle.start();

    unit.triggerAbility(getInstance(unit, AbilityId.Hawk));

    // 20 bonus damage, doubled
    expect(enemy.stats[Stat.Health]).toBe(960);
  });

  it('Hare charges the other abilities', () => {
    const battle = createBattle('hare');
    const unit = createUnit(battle, [getAbility(AbilityId.Hare), getAbility(AbilityId.Elephant)]);
    createUnit(battle);
    battle.start();

    unit.triggerAbility(getInstance(unit, AbilityId.Hare));

    expect(unit.abilities.get(getInstance(unit, AbilityId.Elephant))).toBe(1000);
    expect(unit.abilities.get(getInstance(unit, AbilityId.Hare))).toBe(0);
  });

  it('Cheetah grants Speed only for a while', () => {
    const battle = createBattle('cheetah');
    const unit = createUnit(battle, [getAbility(AbilityId.Cheetah)]);
    createUnit(battle);
    battle.start();

    unit.addEnergy(Energy.Critical, 100, true);
    unit.triggerAbility(getInstance(unit, AbilityId.Cheetah));
    expect(unit.getEnergy(Energy.Speed, true)).toBe(150);

    run(battle, 3000 + FRAME * 2);
    expect(unit.getEnergy(Energy.Speed, true)).toBe(0);
  });

  it('Mantis strikes back without two of them looping forever', () => {
    const battle = createBattle('mantis');
    const mantis = getAbility(AbilityId.Mantis);
    const left = createUnit(battle, [mantis]);
    const right = createUnit(battle, [mantis]);
    battle.start();

    let strikes = 0;
    battle.on(BattleEvents.UnitAttack, ValuePriority.Post, (event) => {
      if ((event.flags & AttackFlags.Natural) === 0) {
        strikes++;
      }
    });

    // Every attack is dodged, so every natural attack is struck back at
    for (const unit of [left, right]) {
      unit.addEnergy(Energy.Dodge, 1000, true);
      unit.addEnergy(Energy.Attack, 50, true);
      unit.triggerAbility(getInstance(unit, AbilityId.Mantis));
    }
    run(battle, 2900);

    expect(strikes).toBeGreaterThan(0);
    expect(left.stats[Stat.Health]).toBe(1000);
    expect(right.stats[Stat.Health]).toBe(1000);
  });

  it('Crab gains Armor from Attack, unlike Rhino', () => {
    const battle = createBattle('crab');
    const unit = createUnit(battle, [getAbility(AbilityId.Crab)]);
    const enemy = createUnit(battle);
    battle.start();

    unit.addEnergy(Energy.Attack, 10, true);
    unit.triggerAbility(getInstance(unit, AbilityId.Crab));

    expect(unit.getEnergy(Energy.Armor, false)).toBe(40);
    expect(enemy.stats[Stat.Health]).toBe(1000);
  });

  it('Hyena spends Health to corrode, but never below 1', () => {
    const battle = createBattle('hyena');
    const unit = createUnit(battle, [getAbility(AbilityId.Hyena)]);
    const enemy = createUnit(battle);
    battle.start();

    const hyena = getInstance(unit, AbilityId.Hyena);
    unit.triggerAbility(hyena);
    expect(unit.stats[Stat.Health]).toBe(950);
    expect(enemy.getEnergy(Energy.Corrosion, false)).toBe(110);

    unit.removeStat(Stat.Health, 949);
    unit.triggerAbility(hyena);
    expect(unit.stats[Stat.Health]).toBe(1);
    expect(enemy.getEnergy(Energy.Corrosion, false)).toBe(120);
  });

  it('Porcupine slows attackers its Armor blocks', () => {
    const battle = createBattle('porcupine');
    const unit = createUnit(battle, [getAbility(AbilityId.Porcupine)]);
    const enemy = createUnit(battle);
    battle.start();

    unit.triggerAbility(getInstance(unit, AbilityId.Porcupine));
    enemy.attack(unit, 20, 0);

    expect(enemy.getEnergy(Energy.Slow, false)).toBe(15);
  });

  it('Falcon grants Critical only for a while', () => {
    const battle = createBattle('falcon');
    const unit = createUnit(battle, [getAbility(AbilityId.Falcon)]);
    createUnit(battle);
    battle.start();

    unit.addEnergy(Energy.Speed, 100, true);
    unit.triggerAbility(getInstance(unit, AbilityId.Falcon));
    expect(unit.getEnergy(Energy.Critical, true)).toBe(200);

    run(battle, 3000 + FRAME * 2);
    expect(unit.getEnergy(Energy.Critical, true)).toBe(0);
  });

  it('Bear heals, then attacks by its Healing', () => {
    const battle = createBattle('bear');
    const unit = createUnit(battle, [getAbility(AbilityId.Bear)]);
    const enemy = createUnit(battle);
    battle.start();

    unit.addEnergy(Energy.Healing, 30, false);
    unit.removeStat(Stat.Health, 100);
    unit.triggerAbility(getInstance(unit, AbilityId.Bear));

    expect(unit.stats[Stat.Health]).toBe(930);
    expect(unit.getEnergy(Energy.Healing, false)).toBe(30);
    expect(enemy.stats[Stat.Health]).toBe(970);
  });

  it('all run through a battle against each other', () => {
    for (const ability of ABILITIES) {
      const battle = createBattle(`smoke:${ability.name}`, { timeLimit: 20_000 });
      const units = [createUnit(battle, ABILITIES), createUnit(battle, [ability])];
      battle.start();

      for (const unit of units) {
        unit.addEnergy(Energy.Attack, 20, true);
        unit.addEnergy(Energy.Magic, 20, true);
        unit.addEnergy(Energy.Critical, 200, true);
        unit.addEnergy(Energy.Dodge, 200, true);
      }
      run(battle, 20_000 + FRAME);

      expect(battle.settled).toBe(true);
    }
  });
});
