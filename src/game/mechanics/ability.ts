import { ValuePriority } from '../../battle/types';
import { EventPriority } from '../../core/event-emitter';
import { AbilityInstance, getAbilityBias } from '../ability';
import { ABILITY_PHASE_INTERVAL } from '../constants';
import { GameEvents } from '../events';
import type Game from '../game';
import { isAbilityOwed, rollAbilityOffers } from '../pool';
import { GameStage } from '../types';

/**
 * Opens the round's next stage: a draft while the player is due an
 * ability, and the shop after.
 */
export function openRoundStage(game: Game): void {
  if (isAbilityOwed(game)) {
    game.offerAbilities();
  } else {
    game.openShop();
  }
}

/**
 * The ability draft, and the shop bias abilities give their aspects.
 */
export default function setupAbilityMechanics(game: Game): void {
  game.on(GameEvents.OfferAbilities, EventPriority.Pre, (event) => {
    if (game.stage === GameStage.Ended) {
      event.disabled = true;
    }
  });

  game.on(GameEvents.OfferAbilities, EventPriority.Exact, () => {
    game.stage = GameStage.Draft;
    game.draft.offers = rollAbilityOffers(game);
  });

  game.on(GameEvents.PickAbility, EventPriority.Pre, (event) => {
    if (game.stage !== GameStage.Draft || game.draft.offers[event.slot] !== event.ability) {
      event.disabled = true;
    }
  });

  game.on(GameEvents.PickAbility, EventPriority.Exact, (event) => {
    game.draft.offers = [];
    game.acquireAbility(new AbilityInstance(game.player, event.ability));
  });

  game.on(GameEvents.PickAbility, EventPriority.Post, () => {
    openRoundStage(game);
  });

  game.on(GameEvents.AcquireAbility, EventPriority.Exact, ({ ability }) => {
    game.player.abilities.push(ability);
  });

  game.on(GameEvents.CheckAbilityInterval, ValuePriority.Initial, (event) => {
    event.value = ABILITY_PHASE_INTERVAL;
  });

  game.on(GameEvents.CheckCardWeight, ValuePriority.Initial, (event) => {
    event.value = 1;
  });

  game.on(GameEvents.CheckCardWeight, ValuePriority.Additive, (event) => {
    const abilities = game.player.abilities.map((ability) => ability.source);
    event.value += getAbilityBias(abilities, event.card);
  });
}
