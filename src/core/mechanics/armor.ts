import { DamageFlags } from '../damage-flags';
import { EventType, type Game, Stack } from '../game';
import { log } from '../log';
import { DamagePriority, StackPriority } from '../priorities';

const CONSUMABLE_ARMOR_STACKS = 0.5;

export function setupArmorMechanics(game: Game): void {
  log('Setting up Armor mechanics.');
  // Trigger Armor consumption when about to take damage.
  game.on(EventType.Damage, DamagePriority.Armor, event => {
    if (!(event.flag & (DamageFlags.Missed | DamageFlags.Reduced))) {
      // Get 50% of the armor
      const currentArmor = event.target.stacks[Stack.Armor];
      if (currentArmor > 0) {
        const consumable = currentArmor * CONSUMABLE_ARMOR_STACKS;
        event.amount -= consumable;
        event.flag |= DamageFlags.Reduced;
        game.removeStack(Stack.Armor, event.target, consumable);
      }
    }
  });

  game.on(EventType.SetStack, StackPriority.Exact, event => {
    if (event.type === Stack.Armor) {
      log(`${event.source.name}'s Armor stacks changed to ${event.amount}`);
      event.source.stacks[Stack.Armor] = event.amount;
    }
  });

  game.on(EventType.AddStack, StackPriority.Exact, event => {
    if (event.type === Stack.Armor) {
      log(`${event.source.name} gained ${event.amount} stacks of Armor`);
      game.setStack(
        Stack.Armor,
        event.source,
        event.source.stacks[Stack.Armor] + event.amount,
      );
    }
  });

  game.on(EventType.RemoveStack, StackPriority.Exact, event => {
    if (event.type === Stack.Armor) {
      log(`${event.source.name} lost ${event.amount} stacks of Armor`);
      game.setStack(
        Stack.Armor,
        event.source,
        event.source.stacks[Stack.Armor] - event.amount,
      );
    }
  });
}
