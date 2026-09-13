import type { Card } from '../game/card';
import COMMON_CARDS from './common';
import STARTER_CARDS from './starter';

const CARDS: Card[] = [...STARTER_CARDS, ...COMMON_CARDS];

export default CARDS;
