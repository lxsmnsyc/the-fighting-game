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
      const currentArmor = event.target.armorStacks;
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
    event.source.armorStacks += event.amount;
  });

  game.on(EventType.RemoveArmor, DebuffPriority.Exact, event => {
    event.target.armorStacks -= event.amount;
  });
}
