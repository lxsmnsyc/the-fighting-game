import { EventType, type Game } from '../game';
import { log } from '../log';
import { BuffPriority, DamagePriority, DebuffPriority } from '../priorities';

const CONSUMABLE_ARMOR_STACKS = 0.5;

export function setupArmorMechanics(game: Game): void {
  log('Setting up Armor mechanics.');
  // Trigger Armor consumption when about to take damage.
  game.on(EventType.Damage, DamagePriority.Armor, event => {
    if (!event.flags.missed) {
      // Get 50% of the armor
      const currentArmor = event.target.stacks.armor;
      if (currentArmor > 0) {
        const consumable = (currentArmor * CONSUMABLE_ARMOR_STACKS) | 0;
        event.amount -= consumable;
        game.triggerDebuff(
          EventType.RemoveArmor,
          event.source,
          event.target,
          consumable,
        );
      }
    }
  });

  game.on(EventType.AddArmor, BuffPriority.Exact, event => {
    log(`${event.source.name} gained ${event.amount} stacks of Armor`);
    event.source.stacks.armor += event.amount;
  });

  game.on(EventType.RemoveArmor, DebuffPriority.Exact, event => {
    log(`${event.target.name} lost ${event.amount} stacks of Armor`);
    event.target.stacks.armor -= event.amount;
  });
}
