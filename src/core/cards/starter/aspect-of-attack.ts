import { createCard } from '../../card';
import type { NextRoundGameEvent } from '../../game';
import type { Round, Unit } from '../../round';
import {
  Aspect,
  CardEventType,
  EventPriority,
  GameEventType,
  Rarity,
  RoundEventType,
  Stack,
} from '../../types';

const DEFAULT_AMOUNT = 5;
const DEFAULT_PERIOD = 1000;

export default createCard({
  name: 'Dagger',
  rarity: Rarity.Common,
  aspect: [Aspect.Attack],
  load(context) {
    context.card.on(CardEventType.Trigger, EventPriority.Exact, event => {
      const { round, target } = event.data as { round: Round; target: Unit };
      round.addStack(Stack.Attack, target, DEFAULT_AMOUNT);
      round.consumeStack(Stack.Attack, target);
    });
    context.game.on(
      GameEventType.NextRound,
      EventPriority.Post,
      ({ round }: NextRoundGameEvent) => {
        let elapsed = 0;
        let ready = true;
        round.on(RoundEventType.Tick, EventPriority.Exact, event => {
          if (!ready) {
            elapsed += event.delta;
            if (elapsed >= DEFAULT_PERIOD) {
              elapsed -= DEFAULT_PERIOD;
              ready = true;
            }
          }
          if (ready && !context.card.enabled) {
            ready = false;
            const source =
              round.unitA.owner === context.card.owner
                ? round.unitA
                : round.unitB;
            const target = round.getEnemyUnit(source);
            context.card.trigger({ round, target });
          }
        });
      },
    );
  },
});
