import CARDS from '../cards';
import type CardId from '../cards/ids';
import type AleaRNG from '../core/alea';
import type { Card } from './card';
import { COPY_LIMITS, SHOP_SIZE } from './constants';
import type Game from './game';
import type { Player } from './player';
import { RARITIES, Rarity } from './types';

/**
 * How likely each rarity is to be rolled in a phase. Later phases lean
 * toward rarer cards.
 */
export function getRarityWeights(phase: number): Record<Rarity, number> {
  const step = Math.max(0, phase - 1);
  return {
    [Rarity.Starter]: Math.max(0, 40 - 10 * step),
    [Rarity.Common]: 45,
    [Rarity.Uncommon]: 15 + 4 * step,
    [Rarity.Rare]: 3 + 2 * step,
    [Rarity.Secret]: 1 + step,
  };
}

/**
 * Rolls a rarity by weight, then a card of that rarity. Rarities with
 * no card in `cards` are left out of the roll.
 */
export function rollCard(rng: AleaRNG, cards: Card[], phase: number): Card | undefined {
  const weights = getRarityWeights(phase);
  const groups: { cards: Card[]; weight: number }[] = [];
  let total = 0;

  for (const rarity of RARITIES) {
    const group = cards.filter((card) => card.rarity === rarity);
    if (group.length > 0 && weights[rarity] > 0) {
      groups.push({ cards: group, weight: weights[rarity] });
      total += weights[rarity];
    }
  }

  if (groups.length === 0) {
    return undefined;
  }

  let roll = rng.random() * total;
  // The last group catches any rounding left over
  let picked = groups[groups.length - 1];
  for (const group of groups) {
    if (roll < group.weight) {
      picked = group;
      break;
    }
    roll -= group.weight;
  }

  return picked.cards[Math.floor(rng.random() * picked.cards.length)];
}

/**
 * How many copies of each card the player owns. The deck is the only
 * record, so it is all a save needs to keep.
 */
export function countOwnedCards(player: Player): Map<CardId, number> {
  const owned = new Map<CardId, number>();
  for (const card of player.deck) {
    owned.set(card.source.id, (owned.get(card.source.id) ?? 0) + 1);
  }
  return owned;
}

/**
 * Secret cards unlock once the player owns every rare card of their
 * first aspect. Every other card is always unlocked.
 */
export function isCardUnlocked(game: Game, card: Card): boolean {
  if (card.rarity !== Rarity.Secret) {
    return true;
  }
  const [aspect] = card.aspect;
  const owned = countOwnedCards(game.player);
  return CARDS.every(
    (other) =>
      other.rarity !== Rarity.Rare || !other.aspect.includes(aspect) || owned.has(other.id),
  );
}

/**
 * A fresh set of shop offers. A card is only offered while its copies,
 * owned and already offered, stay under its rarity's limit.
 */
export function rollShopOffers(game: Game): (Card | undefined)[] {
  const copies = countOwnedCards(game.player);
  const offers: (Card | undefined)[] = [];

  for (let slot = 0; slot < SHOP_SIZE; slot++) {
    const available = CARDS.filter(
      (card) => isCardUnlocked(game, card) && (copies.get(card.id) ?? 0) < COPY_LIMITS[card.rarity],
    );
    const card = rollCard(game.rng.shop, available, game.getPhase());
    if (card) {
      copies.set(card.id, (copies.get(card.id) ?? 0) + 1);
    }
    offers.push(card);
  }

  return offers;
}
