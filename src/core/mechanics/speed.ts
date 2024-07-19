import { EventType, type Game } from '../game';
import { log } from '../log';
import { BuffPriority, DebuffPriority } from '../priorities';

export function setupSpeedMechanics(game: Game): void {
  log('Setting up Speed mechanics.');
  // Speed/Slow interaction
  game.on(EventType.AddSpeed, BuffPriority.Exact, event => {
    // Get the remaining amount of stacks that can be applied to speed
    const overflow = event.amount - event.source.slowStacks;
    // The rest we can deduct to the slowStacks
    const deduction = Math.min(event.source.speedStacks, event.amount);
    // For the final amount, add it to current stacks
    if (overflow > 0) {
      event.source.speedStacks += overflow;
    }
    game.triggerBuff(EventType.RemoveSlow, event.source, deduction);
  });

  // Re-adjust speed stacks when consumed.
  game.on(EventType.RemoveSpeed, DebuffPriority.Exact, event => {
    event.amount = Math.min(event.amount, event.target.speedStacks);
    event.target.speedStacks -= event.amount;
  });
}
