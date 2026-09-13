import { describe, expect, it } from 'vitest';
import Alliance from '../src/battle/alliance';
import type Battle from '../src/battle/core';
import { BattleEvents } from '../src/battle/events';
import { AttackFlags, DamageFlags } from '../src/battle/flags';
import createBattle from '../src/battle/setup';
import { DamageType, Energy, Stat, ValuePriority } from '../src/battle/types';
import type Unit from '../src/battle/unit';
import dualWield from '../src/cards/attack/dual-wield';
import ADD_STACK_ON_START_CARDS from '../src/cards/common/add-stack-on-start';
import { CardInstance } from '../src/game/card';
import { Player } from '../src/game/player';
import { fieldPlayer } from '../src/game/round';
import { Print } from '../src/game/types';

const FRAME = 1000 / 60;

let seed = 0;

// Prints are turned off so card values are exact
function createPlayer(): Player {
  const player = new Player(seed++);
  player.printSpawnChance[Print.Error] = 0;
  player.printSpawnChance[Print.Monotone] = 0;
  player.printSpawnChance[Print.Negative] = 0;
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
    const left = createSide(battle, [createPlayer()]);
    const right = createSide(battle, [createPlayer()]);
    battle.start();

    const [attacker] = left.units;
    const [defender] = right.units;
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

  it('runs enabled cards and skips disabled ones', () => {
    const [attackOnStart] = ADD_STACK_ON_START_CARDS;
    const battle = createBattle('cards');
    const enabled = createPlayer();
    const disabled = createPlayer();
    enabled.deck.push(new CardInstance(enabled, attackOnStart));
    const card = new CardInstance(disabled, attackOnStart);
    card.disabled = true;
    disabled.deck.push(card);

    const left = createSide(battle, [enabled]);
    const right = createSide(battle, [disabled]);
    battle.start();

    expect(left.units[0].getEnergy(Energy.Attack, false)).toBe(20);
    expect(right.units[0].getEnergy(Energy.Attack, false)).toBe(0);
  });

  it('repeats a natural attack once with dual wield', () => {
    const battle = createBattle('dual-wield');
    const player = createPlayer();
    player.deck.push(new CardInstance(player, dualWield));
    const [attacker] = createSide(battle, [player]).units;
    const [defender] = createSide(battle, [createPlayer()]).units;

    const attacks: number[] = [];
    battle.on(BattleEvents.UnitAttack, ValuePriority.Post, (event) => {
      attacks.push(event.flags);
    });

    battle.start();
    attacker.addEnergy(Energy.Attack, 100, true);
    // One natural attack at zero Speed and Slow
    run(battle, 2700);

    expect(attacks).toHaveLength(2);
    // The echo resolves inside the first attack, so order is not checked
    expect(attacks.filter((flags) => flags & AttackFlags.Echo)).toHaveLength(1);
    expect(defender.stats[Stat.Health]).toBe(900);
  });
});
