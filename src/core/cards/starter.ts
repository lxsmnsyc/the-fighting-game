import { type Card, createCard } from '../card';
import { SELF_STACK } from '../constants';
import type { StartRoundGameEvent } from '../game';
import { Timer } from '../mechanics/tick';
import type { Round, Unit } from '../round';
import {
  Aspect,
  Energy,
  EventPriority,
  GameEvents,
  Rarity,
  RoundEvents,
  ValuePriority,
} from '../types';

interface AspectOptions {
  name: string;
  image: string;
  amount: number;
  period: number;
  aspect: Aspect;
  energy: Energy;
}

function createAspect({
  name,
  image,
  aspect,
  amount,
  period,
  energy,
}: AspectOptions): Card {
  return createCard({
    name,
    image,
    rarity: Rarity.Starter,
    aspect: [aspect],
    load(context) {
      let timer: Timer | undefined;

      // Trigger card
      context.game.on(GameEvents.TriggerCard, EventPriority.Exact, event => {
        if (event.card === context.card) {
          const { round, target } = event.data as {
            round: Round;
            target: Unit;
          };
          round.addEnergy(
            Energy.Speed,
            target,
            context.card.getValue(amount),
            false,
          );
        }
      });
      context.game.on(GameEvents.EnableCard, EventPriority.Post, event => {
        if (event.card === context.card && timer) {
          timer.start();
        }
      });
      context.game.on(GameEvents.DisableCard, EventPriority.Post, event => {
        if (event.card === context.card && timer) {
          timer.stop();
        }
      });
      // Trigger condition
      context.game.on(
        GameEvents.StartRound,
        EventPriority.Post,
        ({ round }: StartRoundGameEvent) => {
          round.on(RoundEvents.SetupUnit, ValuePriority.Exact, ({ source }) => {
            if (source.owner !== context.card.owner) {
              return;
            }
            const target = SELF_STACK[energy]
              ? source
              : round.getEnemyUnit(source);
            timer = new Timer(round, period, () => {
              context.game.triggerCard(context.card, { round, target });
            });
          });
          round.on(RoundEvents.End, EventPriority.Post, () => {
            timer = undefined;
          });
        },
      );
    },
  });
}

export default [
  createAspect({
    name: 'Aspect of Armor',
    image: '',
    aspect: Aspect.Armor,
    energy: Energy.Armor,
    amount: 5,
    period: 1000,
  }),
  createAspect({
    name: 'Aspect of Attack',
    image: '',
    aspect: Aspect.Attack,
    energy: Energy.Attack,
    amount: 5,
    period: 1000,
  }),
  createAspect({
    name: 'Aspect of Corrosion',
    image: '',
    aspect: Aspect.Corrosion,
    energy: Energy.Corrosion,
    amount: 5,
    period: 1000,
  }),
  createAspect({
    name: 'Aspect of Critical',
    image: '',
    aspect: Aspect.Critical,
    energy: Energy.Critical,
    amount: 5,
    period: 1000,
  }),
  createAspect({
    name: 'Aspect of Dodge',
    image: '',
    aspect: Aspect.Dodge,
    energy: Energy.Dodge,
    amount: 5,
    period: 1000,
  }),
  createAspect({
    name: 'Aspect of Healing',
    image: '',
    aspect: Aspect.Healing,
    energy: Energy.Healing,
    amount: 5,
    period: 1000,
  }),
  createAspect({
    name: 'Aspect of Magic',
    image: '',
    aspect: Aspect.Magic,
    energy: Energy.Magic,
    amount: 5,
    period: 1000,
  }),
  createAspect({
    name: 'Aspect of Poison',
    image: '',
    aspect: Aspect.Poison,
    energy: Energy.Poison,
    amount: 5,
    period: 1000,
  }),
  createAspect({
    name: 'Aspect of Slow',
    image: '',
    aspect: Aspect.Slow,
    energy: Energy.Slow,
    amount: 5,
    period: 1000,
  }),
  createAspect({
    name: 'Aspect of Speed',
    image: '',
    aspect: Aspect.Speed,
    energy: Energy.Speed,
    amount: 5,
    period: 1000,
  }),
];
