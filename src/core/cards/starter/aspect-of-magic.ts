import { createCard } from '../../card';
import type { StartRoundGameEvent } from '../../game';
import { lerp } from '../../lerp';
import type { Round, Unit } from '../../round';
import {
  Aspect,
  EventPriority,
  GameEvents,
  Rarity,
  RoundEvents,
  Stack,
} from '../../types';

const DEFAULT_AMOUNT = 5;
const MIN_PERIOD = 0.25;
const MAX_PERIOD = 2.5;
const MAX_SPEED = 750;

function getPeriod(speed: number): number {
  return lerp(
    MIN_PERIOD * 1000,
    MAX_PERIOD * 1000,
    Math.min(speed / MAX_SPEED, 1),
  );
}

export default createCard({
  name: 'Aspect of Magic',
  image: '',
  rarity: Rarity.Starter,
  aspect: [Aspect.Magic],
  load(context) {
    // Trigger card
    context.game.on(GameEvents.TriggerCard, EventPriority.Exact, event => {
      if (event.card === context.card) {
        const { round, source } = event.data as { round: Round; source: Unit };
        round.addStack(Stack.Magic, source, DEFAULT_AMOUNT);
        round.consumeStack(Stack.Magic, source);
      }
    });
    // Trigger condition
    context.game.on(
      GameEvents.StartRound,
      EventPriority.Post,
      ({ round }: StartRoundGameEvent) => {
        const source =
          round.unitA.owner === context.card.owner ? round.unitA : round.unitB;

        let elapsed = 0;
        let period = getPeriod(source.stacks[Stack.Speed]);
        let ready = true;

        round.on(RoundEvents.Tick, EventPriority.Exact, event => {
          if (!ready) {
            elapsed += event.delta;
            if (elapsed >= period) {
              elapsed -= period;
              period = getPeriod(source.stacks[Stack.Speed]);
              ready = true;
            }
          }
          if (ready && !context.card.enabled) {
            ready = false;
            context.game.triggerCard(context.card, { round, source });
          }
        });
      },
    );
  },
});
