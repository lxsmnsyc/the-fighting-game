import { DamageType, EventType, type Game } from '../game';
import { lerp } from '../lerp';
import { log } from '../log';
import { BuffPriority, DamagePriority, DebuffPriority } from '../priorities';

const MIN_EVASION_CHANCE = 0;
const MAX_EVASION_CHANCE = 100;
const MAX_EVASION_STACKS = 750;
const CONSUMABLE_EVASION_STACKS = 0.5;

function getEvasionChance(stack: number): number {
  return lerp(
    MIN_EVASION_CHANCE,
    MAX_EVASION_CHANCE,
    Math.min(stack / MAX_EVASION_STACKS, 1),
  );
}

export function setupEvasionMechanics(game: Game): void {
  log('Setting up Evasion mechanics.');
  game.on(EventType.Damage, DamagePriority.Evasion, event => {
    if (event.flags.missed) {
      return;
    }
    // Check if player can evade it
    if (event.type === DamageType.Attack && event.target.evasionStacks !== 0) {
      // If there's an evasion stack
      if (event.target.evasionStacks > 0) {
        // Calculat evasion chance
        const currentEvasion = getEvasionChance(event.target.evasionStacks);
        // Push your luck
        const random = Math.random() * 100;
        if (random <= currentEvasion) {
          log(`${event.target.name} dodged ${event.amount} of damage.`);
          event.flags.missed = true;

          const consumable =
            (event.target.evasionStacks * CONSUMABLE_EVASION_STACKS) | 0;
          game.triggerDebuff(
            EventType.RemoveEvasion,
            event.source,
            event.target,
            consumable,
          );
        }
      } else {
        const consumable =
          (event.target.evasionStacks * CONSUMABLE_EVASION_STACKS) | 0;
        game.triggerBuff(EventType.AddEvasion, event.source, -consumable);
      }
    }
  });

  game.on(EventType.AddEvasion, BuffPriority.Exact, event => {
    event.source.evasionStacks += event.amount;
  });

  game.on(EventType.RemoveEvasion, DebuffPriority.Exact, event => {
    event.target.evasionStacks -= event.amount;
  });
}
