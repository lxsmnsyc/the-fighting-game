import { createCard } from '../../card';
import type { StartRoundGameEvent } from '../../game';
import { createTimer } from '../../mechanics/tick';
import type { Round, Unit } from '../../round';
import {
  Aspect,
  Energy,
  EventPriority,
  GameEvents,
  Rarity,
  RoundEvents,
} from '../../types';

const DEFAULT_AMOUNT = 5;
const DEFAULT_PERIOD = 1.0 * 1000;

export default createCard({
  name: 'Aspect of Attack',
  image: '',
  rarity: Rarity.Starter,
  aspect: [Aspect.Attack],
  load(context) {
    // Trigger card
    context.game.on(GameEvents.TriggerCard, EventPriority.Exact, event => {
      if (event.card === context.card) {
        const { round, source } = event.data as { round: Round; source: Unit };
        round.addEnergy(
          Energy.Attack,
          source,
          context.card.getValue(DEFAULT_AMOUNT),
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
