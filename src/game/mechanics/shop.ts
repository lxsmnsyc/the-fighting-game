import { ValuePriority } from '../../battle/types';
import { EventPriority } from '../../core/event-emitter';
import { rollCardInstance } from '../card';
import { BASE_REROLL_COST, CARD_PRICES, REROLL_COST_STEP, SELL_RATIO } from '../constants';
import { GameEvents } from '../events';
import type Game from '../game';
import { rollShopOffers } from '../pool';
import { GameStage, PlayerStat } from '../types';

/**
 * The shop stage and the player's deck: offers, rerolls, buying and
 * selling.
 */
export default function setupShopMechanics(game: Game): void {
  game.on(GameEvents.OpenShop, EventPriority.Pre, (event) => {
    if (game.stage === GameStage.Ended) {
      event.disabled = true;
    }
  });

  game.on(GameEvents.OpenShop, EventPriority.Exact, () => {
    game.stage = GameStage.Shop;
    game.shop.rerolls = 0;
    game.shop.offers = rollShopOffers(game);
  });

  // Each reroll in one visit costs more than the last
  game.on(GameEvents.CheckRerollCost, ValuePriority.Initial, (event) => {
    event.value = BASE_REROLL_COST + REROLL_COST_STEP * game.shop.rerolls;
  });

  game.on(GameEvents.RerollShop, EventPriority.Pre, (event) => {
    if (game.stage !== GameStage.Shop || game.player.stats[PlayerStat.Gold] < event.value) {
      event.disabled = true;
    }
  });

  game.on(GameEvents.RerollShop, EventPriority.Exact, (event) => {
    game.removeStat(PlayerStat.Gold, event.value);
    game.shop.rerolls++;
    game.shop.offers = rollShopOffers(game);
  });

  game.on(GameEvents.CheckCardPrice, ValuePriority.Initial, (event) => {
    event.value = CARD_PRICES[event.card.rarity];
  });

  game.on(GameEvents.BuyCard, EventPriority.Pre, (event) => {
    if (
      game.stage !== GameStage.Shop ||
      game.shop.offers[event.slot] !== event.card ||
      game.player.stats[PlayerStat.Gold] < event.value
    ) {
      event.disabled = true;
    }
  });

  game.on(GameEvents.BuyCard, EventPriority.Exact, (event) => {
    game.removeStat(PlayerStat.Gold, event.value);
    game.shop.offers[event.slot] = undefined;
    game.acquireCard(rollCardInstance(game.player, event.card, game.rng.shop));
  });

  game.on(GameEvents.AcquireCard, EventPriority.Exact, ({ card }) => {
    game.player.deck.push(card);
  });

  game.on(GameEvents.SellCard, EventPriority.Pre, (event) => {
    if (game.stage === GameStage.Battle || !game.player.deck.includes(event.card)) {
      event.disabled = true;
    }
  });

  game.on(GameEvents.SellCard, EventPriority.Exact, ({ card }) => {
    game.player.deck.splice(game.player.deck.indexOf(card), 1);
    game.addStat(PlayerStat.Gold, Math.floor(game.checkCardPrice(card.source) * SELL_RATIO));
  });

  game.on(GameEvents.EnableCard, EventPriority.Exact, ({ card }) => {
    card.disabled = false;
  });

  game.on(GameEvents.DisableCard, EventPriority.Exact, ({ card }) => {
    card.disabled = true;
  });
}
