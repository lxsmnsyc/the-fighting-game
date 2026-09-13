import { describe, expect, it } from 'vitest';
import CARDS, { getCard } from '../src/cards';
import ADD_STACK_ON_HEALTH_LOST_CARDS from '../src/cards/health/pending-001';
import CardId from '../src/cards/ids';
import { TokenType, formatDescription } from '../src/game/description';
import { Print } from '../src/game/types';

const ALL_CARDS = [...CARDS, ...ADD_STACK_ON_HEALTH_LOST_CARDS];

describe('card registry', () => {
  it('gives every card a unique id', () => {
    const ids = ALL_CARDS.map((card) => card.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every card a unique one-word name', () => {
    const names = ALL_CARDS.map((card) => card.name);
    expect(new Set(names).size).toBe(names.length);
    for (const name of names) {
      expect(name).toMatch(/^[A-Z][a-z]+$/);
    }
  });

  it('describes every card with highlighted parts', () => {
    for (const card of ALL_CARDS) {
      const description = card.description(0);
      expect(formatDescription(description)).toMatch(/^[A-Z].*\.$/);
      expect(description.some((part) => part.type !== TokenType.Text)).toBe(true);
    }
  });
});

describe('card descriptions', () => {
  it('show the values a print changes', () => {
    const card = getCard(CardId.Guarded);

    expect(formatDescription(card.description(0))).toContain('20 Armor');
    expect(formatDescription(card.description(Print.Monotone))).toContain('40 Armor');
    expect(formatDescription(card.description(Print.Error))).toContain('15–25 Armor');
    expect(formatDescription(card.description(Print.Error | Print.Monotone))).toContain(
      '30–50 Armor',
    );
  });

  it('leave values the print does not change alone', () => {
    const card = getCard(CardId.Guarded);

    // The trigger chance is not a card value
    expect(formatDescription(card.description(Print.Monotone))).toContain('25% chance');
  });
});
