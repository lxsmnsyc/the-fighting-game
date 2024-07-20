import { EventType, type Game, Stack } from '../game';
import { log } from '../log';
import { BuffPriority, DamagePriority, DebuffPriority } from '../priorities';

const CONSUMABLE_ARMOR_STACKS = 0.5;

export function setupArmorMechanics(game: Game): void {
  log('Setting up Armor mechanics.');
  // Trigger Armor consumption when about to take damage.
  game.on(EventType.Damage, DamagePriority.Armor, event => {
    if (!event.flags.missed) {
      // Get 50% of the armor
      const currentArmor = event.target.stacks[Stack.Armor];
      if (currentArmor > 0) {
        const consumable = (currentArmor * CONSUMABLE_ARMOR_STACKS) | 0;
        event.amount -= consumable;
        game.removeStack(Stack.Armor, event.source, event.target, consumable);
      }
    }
  });

  game.on(EventType.AddStack, BuffPriority.Exact, event => {
    if (event.type === Stack.Armor) {
      log(`${event.source.name} gained ${event.amount} stacks of Armor`);
      event.source.stacks[Stack.Armor] += event.amount;
    }
  });

  game.on(EventType.RemoveStack, DebuffPriority.Exact, event => {
    if (event.type === Stack.Armor) {
      log(`${event.target.name} lost ${event.amount} stacks of Armor`);
      event.source.stacks[Stack.Armor] -= event.amount;
    }
  });
}
