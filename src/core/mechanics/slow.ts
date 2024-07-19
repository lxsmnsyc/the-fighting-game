import { EventType, type Game } from '../game';
import { BuffPriority, DebuffPriority } from '../priorities';

export function setupSlowMechanics(game: Game): void {
  // Speed/Slow interaction
  game.on(EventType.AddSlow, DebuffPriority.Exact, event => {
    // Get the remaining amount of stacks that can be applied to speed
    const overflow = event.amount - event.target.slowStacks;
    // The rest we can deduct to the slowStacks
    const deduction = Math.min(event.target.slowStacks, event.amount);
    // For the final amount, add it to current stacks
    if (overflow > 0) {
      event.target.slowStacks += overflow;
    }
    game.triggerBuff(EventType.RemoveSlow, event.source, deduction);
  });

  // Re-adjust speed stacks when consumed.
  game.on(EventType.RemoveSlow, BuffPriority.Exact, event => {
    event.amount = Math.min(event.amount, event.source.slowStacks);
    event.source.slowStacks -= event.amount;
  });
}
