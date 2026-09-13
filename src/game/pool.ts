import ABILITIES from '../abilities';
import CARDS from '../cards';
import type CardId from '../cards/ids';
import type AleaRNG from '../core/alea';
import type { Ability } from './ability';
import { type Card, CardInstance, getRandomPrint } from './card';
import { ABILITY_OFFER_SIZE, COPY_LIMITS, SHOP_SIZE } from './constants';
import type Game from './game';
import type { Player } from './player';
import { Print, RARITIES, Rarity } from './types';

/**
 * How likely each rarity is to be rolled in a phase. Later phases lean
 * toward rarer cards.
 */
export function getRarityWeights(phase: number): Record<Rarity, number> {
  const step = Math.max(0, phase - 1);
  return {
    [Rarity.Common]: 45,
    [Rarity.Uncommon]: 15 + 4 * step,
    [Rarity.Rare]: 3 + 2 * step,
    [Rarity.Secret]: 1 + step,
  };
}

/**
 * Picks one item by weight. Items without a positive weight are never
 * picked.
 */
function pickWeighted<T>(rng: AleaRNG, items: T[], getWeight: (item: T) => number): T | undefined {
  const weights = items.map((item) => Math.max(0, getWeight(item)));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if (total <= 0) {
    return undefined;
  }

  let roll = rng.random() * total;
  // The last weighted item catches any rounding left over
  let picked: T | undefined;
  for (let index = 0; index < items.length; index++) {
    if (weights[index] > 0) {
      picked = items[index];
      if (roll < weights[index]) {
        break;
      }
      roll -= weights[index];
    }
  }
  return picked;
}

/**
 * Rolls a rarity by weight, then a card of that rarity by `getWeight`.
 * Rarities with no card in `cards` are left out of the roll.
 */
export function rollCard(
  rng: AleaRNG,
  cards: Card[],
  phase: number,
  getWeight: (card: Card) => number = () => 1,
): Card | undefined {
  const weights = getRarityWeights(phase);
  const groups = RARITIES.map((rarity) => ({
    rarity,
    cards: cards.filter((card) => card.rarity === rarity && getWeight(card) > 0),
  })).filter((group) => group.cards.length > 0);

  const group = pickWeighted(rng, groups, (current) => weights[current.rarity]);
  return group && pickWeighted(rng, group.cards, getWeight);
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
 * How many copies of each card count toward its copy limit. Negative
 * copies do not.
 */
export function countLimitedCopies(player: Player): Map<CardId, number> {
  const copies = new Map<CardId, number>();
  for (const card of player.deck) {
    if ((card.print & Print.Negative) === 0) {
      copies.set(card.source.id, (copies.get(card.source.id) ?? 0) + 1);
    }
  }
  return copies;
}

/**
 * Whether one more copy of `card` with `print` fits under its copy
 * limit. A Negative copy always fits.
 */
export function isUnderCopyLimit(card: Card, print: number, copies: Map<CardId, number>): boolean {
  return (print & Print.Negative) !== 0 || (copies.get(card.id) ?? 0) < COPY_LIMITS[card.rarity];
}

/**
 * A fresh set of shop offers, each a copy with its print. A card is only
 * offered while its copies, owned and already offered, stay under its
 * rarity's limit, unless the offer is Negative. Cards that share aspects
 * with the player's abilities are rolled more often.
 */
export function rollShopOffers(game: Game): (CardInstance | undefined)[] {
  const { player } = game;
  const rng = game.rng.shop;
  const copies = countLimitedCopies(player);
  const offers: (CardInstance | undefined)[] = [];

  for (let slot = 0; slot < SHOP_SIZE; slot++) {
    // The print comes first, since a Negative copy may go past the limit
    const print = getRandomPrint(rng, player.printSpawnChance);
    const available = CARDS.filter(
      (card) => isCardUnlocked(game, card) && isUnderCopyLimit(card, print, copies),
    );
    const card = rollCard(rng, available, game.getPhase(), (current) =>
      game.checkCardWeight(current),
    );
    if (!card) {
      offers.push(undefined);
      continue;
    }
    if ((print & Print.Negative) === 0) {
      copies.set(card.id, (copies.get(card.id) ?? 0) + 1);
    }
    offers.push(new CardInstance(player, card, print));
  }

  return offers;
}

/**
 * Up to `count` different abilities from `abilities`, each equally
 * likely.
 */
export function rollAbilities(rng: AleaRNG, abilities: Ability[], count: number): Ability[] {
  const remaining = [...abilities];
  const rolled: Ability[] = [];
  while (rolled.length < count && remaining.length > 0) {
    const [ability] = remaining.splice(Math.floor(rng.random() * remaining.length), 1);
    rolled.push(ability);
  }
  return rolled;
}

/**
 * Abilities the player does not own yet.
 */
export function getAvailableAbilities(player: Player): Ability[] {
  const owned = new Set(player.abilities.map((ability) => ability.source.id));
  return ABILITIES.filter((ability) => !owned.has(ability.id));
}

export function rollAbilityOffers(game: Game): Ability[] {
  return rollAbilities(game.rng.draft, getAvailableAbilities(game.player), ABILITY_OFFER_SIZE);
}

/**
 * Whether the player is due an ability they have not picked yet. Checked
 * from what they own, so a resumed or replayed round offers it again
 * only if it was never picked.
 */
export function isAbilityOwed(game: Game): boolean {
  return (
    game.player.abilities.length < game.getAbilityCount() &&
    getAvailableAbilities(game.player).length > 0
  );
}
