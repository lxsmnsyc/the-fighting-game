import { EventPriority } from '../../core/event-emitter';
import type Alliance from '../alliance';
import type Battle from '../core';
import { BattleEvents } from '../events';
import { ENERGY_NAMES } from '../names';
import { DamagePriority, ValuePriority } from '../types';
import type Unit from '../unit';
import { isMissedDamage } from './damage';

function log(message: string): void {
  // oxlint-disable-next-line no-console
  console.log(message);
}

function describeUnit(unit: Unit): string {
  return unit.team.player.name ?? 'Unit';
}

function describeAlliance(alliance: Alliance): string {
  return [...alliance.teams].map((team) => team.player.name ?? 'Team').join(', ');
}

/**
 * Logs what happens in the battle to the console.
 */
export default function setupDebugMechanics(battle: Battle): void {
  battle.on(BattleEvents.UnitDamage, DamagePriority.Post, (event) => {
    const source = describeUnit(event.source);
    const target = describeUnit(event.target);
    if (isMissedDamage(event.flags)) {
      log(`${target} dodged ${event.value} damage from ${source}`);
    } else {
      log(`${source} dealt ${event.value} damage to ${target}`);
    }
  });

  battle.on(BattleEvents.UnitHeal, ValuePriority.Post, (event) => {
    log(`${describeUnit(event.target)} healed ${event.value} health`);
  });

  battle.on(BattleEvents.UnitAddEnergy, ValuePriority.Post, (event) => {
    log(`${describeUnit(event.source)} gained ${event.value} ${ENERGY_NAMES[event.energy]}`);
  });

  battle.on(BattleEvents.UnitRemoveEnergy, ValuePriority.Post, (event) => {
    log(`${describeUnit(event.source)} lost ${event.value} ${ENERGY_NAMES[event.energy]}`);
  });

  battle.on(BattleEvents.UnitTriggerCard, EventPriority.Post, (event) => {
    log(`${describeUnit(event.source)} triggered ${event.card.source.name}`);
  });

  battle.on(BattleEvents.UnitTriggerAbility, EventPriority.Post, (event) => {
    log(`${describeUnit(event.source)} used ${event.ability.source.name}`);
  });

  battle.on(BattleEvents.UnitFaints, EventPriority.Post, (event) => {
    log(`${describeUnit(event.source)} fainted`);
  });

  battle.on(BattleEvents.End, EventPriority.Post, () => {
    log(battle.winner ? `${describeAlliance(battle.winner)} won` : 'Nobody won');
  });
}
