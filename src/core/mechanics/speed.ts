import { EventType, type Game } from '../game';

export function setupSpeedMechanics(game: Game): void {
  // Speed/Slow interaction
  game.on(EventType.AddSpeed, event => {
    // Event priority 2 (exact)
    if (event.priority === 2) {
      // Get the remaining amount of stacks that can be applied to speed
      const overflow = event.amount - event.source.slowStacks;
      // The rest we can deduct to the slowStacks
      const deduction = Math.min(event.source.slowStacks, event.amount);
      // For the final amount, add it to current stacks
      if (overflow > 0) {
        event.source.speedStacks += overflow;
      }
      game.triggerBuff(EventType.RemoveSlow, event.source, deduction);
    }
  });

  // Re-adjust speed stacks when consumed.
  game.on(EventType.RemoveSpeed, event => {
    // Event priority 2 (exact)
    if (event.priority === 2) {
      event.amount = Math.min(event.amount, event.target.speedStacks);
      event.target.speedStacks -= event.amount;
    }
  });
}
