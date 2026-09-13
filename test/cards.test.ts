import { describe, expect, it } from 'vitest';
import CARDS from '../src/cards';
import ADD_STACK_ON_HEALTH_LOST_CARDS from '../src/cards/health/pending-001';
import { TokenType, formatDescription } from '../src/game/description';

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
      const description = card.description();
      expect(formatDescription(description)).toMatch(/^[A-Z].*\.$/);
      expect(description.some((part) => part.type !== TokenType.Text)).toBe(true);
    }
  });
});
