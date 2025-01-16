import { createCard } from '../../card';
import type { StartRoundGameEvent } from '../../game';
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
  name: 'Aspect of Dodge',
  image: '',
  rarity: Rarity.Starter,
  aspect: [Aspect.Dodge],
  load(context) {
    // Trigger card
    context.game.on(GameEvents.TriggerCard, EventPriority.Exact, event => {
      if (event.card === context.card) {
        const { round, source } = event.data as { round: Round; source: Unit };
        round.addStack(
          Stack.Dodge,
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
          let elapsed = 0;
          let ready = true;

          round.on(RoundEvents.Tick, EventPriority.Exact, event => {
            if (!ready) {
              elapsed += event.delta;
              if (elapsed >= DEFAULT_PERIOD) {
                elapsed -= DEFAULT_PERIOD;
                ready = true;
              }
            }
            if (ready && context.card.enabled) {
              ready = false;
              context.game.triggerCard(context.card, { round, source });
            }
          });
        });
      },
    );
  },
});
