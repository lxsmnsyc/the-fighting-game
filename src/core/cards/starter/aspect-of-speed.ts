import { createCard } from '../../card';
import type { StartRoundGameEvent } from '../../game';
import { createTimer } from '../../mechanics/tick';
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
const DEFAULT_PERIOD = 1.0 * 1000;

export default createCard({
  name: 'Aspect of Speed',
  image: '',
  rarity: Rarity.Starter,
  aspect: [Aspect.Speed],
  load(context) {
    // Trigger card
    context.game.on(GameEvents.TriggerCard, EventPriority.Exact, event => {
      if (event.card === context.card) {
        const { round, source } = event.data as { round: Round; source: Unit };
        round.addStack(
          Stack.Speed,
          source,
          DEFAULT_AMOUNT * context.card.getMultiplier(),
          false,
        );
      }
    });
    // Trigger condition
    context.game.on(
      GameEvents.StartRound,
      EventPriority.Post,
      ({ round }: StartRoundGameEvent) => {
        round.on(RoundEvents.SetupUnit, EventPriority.Exact, ({ source }) => {
          if (source.owner !== context.card.owner) {
            return;
          }
          createTimer(round, DEFAULT_PERIOD, () => {
            if (context.card.enabled) {
              context.game.triggerCard(context.card, { round, source });
              return true;
            }
            return false;
          });
        });
      },
    );
  },
});
