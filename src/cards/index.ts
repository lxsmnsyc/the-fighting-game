import type { Card } from '../game/card';
import relentless from './attack/double-attack';
import ambidextrous from './attack/dual-wield';
import vampiric from './attack/life-steal';
import COMMON_CARDS from './common';
import merciless from './critical/coup-de-grace';
import endure from './health/endure';
import type CardId from './ids';
import REPEAT_TRIGGER_CARDS from './secret/repeat-trigger';

const RARE_CARDS: Card[] = [relentless, ambidextrous, vampiric, merciless, endure];

const CARDS: Card[] = [...COMMON_CARDS, ...RARE_CARDS, ...REPEAT_TRIGGER_CARDS];

const CARDS_BY_ID = new Map(CARDS.map((card) => [card.id, card]));

export function getCard(id: CardId): Card {
  const card = CARDS_BY_ID.get(id);
  if (!card) {
    throw new Error(`Unknown card: ${id}`);
  }
  return card;
}

export default CARDS;
