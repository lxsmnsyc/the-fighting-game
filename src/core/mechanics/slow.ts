import { EventType, type Game } from '../game';
import { BuffPriority, DebuffPriority } from '../priorities';

export function setupSlowMechanics(game: Game): void {
  // Speed/Slow interaction
  game.on(EventType.AddSlow, DebuffPriority.Exact, event => {
    // Get the remaining amount of stacks that can be applied to speed
    const overflow = event.amount - event.source.speedStacks;
    // The rest we can deduct to the speedStacks
    const deduction = Math.min(event.source.speedStacks, event.amount);
    // For the final amount, add it to current stacks
    if (overflow > 0) {
      event.source.slowStacks += overflow;
    }
    game.triggerDebuff(
      EventType.RemoveSpeed,
      event.source,
      event.target,
      deduction,
    );
  });

  // Re-adjust speed stacks when consumed.
  game.on(EventType.RemoveSlow, BuffPriority.Exact, event => {
    event.amount = Math.min(event.amount, event.source.slowStacks);
    event.source.slowStacks -= event.amount;
  });
}
