import { createCard } from '../../card';
import type { StartRoundGameEvent } from '../../game';
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

export default createCard({
  name: 'Aspect of Poison',
  image: '',
  rarity: Rarity.Starter,
  aspect: [Aspect.Poison],
  load(context) {
    // Trigger card
    context.game.on(GameEvents.TriggerCard, EventPriority.Exact, event => {
      if (event.card === context.card) {
        const { round, source } = event.data as { round: Round; source: Unit };
        round.addEnergy(
          Energy.Poison,
          round.getEnemyUnit(source),
          context.card.getValue(DEFAULT_AMOUNT),
          true,
        );
      }
    });
    // Trigger condition
    context.game.on(
      GameEvents.StartRound,
      EventPriority.Post,
      ({ round }: StartRoundGameEvent) => {
        round.on(RoundEvents.SetupUnit, EventPriority.Post, ({ source }) => {
          if (source.owner === context.card.owner && context.card.enabled) {
            context.game.triggerCard(context.card, { round, source });
          }
        });
      },
    );
  },
});
