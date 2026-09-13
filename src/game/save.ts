import { getAbility } from '../abilities';
import type AbilityId from '../abilities/ids';
import { getCard } from '../cards';
import type CardId from '../cards/ids';
import { AbilityInstance } from './ability';
import { CardInstance } from './card';
import type Game from './game';
import type { GameOptions } from './game';
import createGame from './setup';
import { type Edition, PlayerStat } from './types';

export interface CardSave {
  id: CardId;
  edition: Edition;
  print: number;
  disabled: boolean;
}

/**
 * What it takes to resume a run at the start of a round. The shop, the
 * ability offers and the opponent are derived again from the seed and
 * the round number.
 */
export interface GameSave {
  seed: string;
  round: number;
  lives: number;
  gold: number;
  cards: CardSave[];
  abilities: AbilityId[];
}

/**
 * Take it when a round starts: a save from later in the round resumes
 * at its start, with whatever was bought or picked since.
 */
export function saveGame(game: Game): GameSave {
  return {
    seed: game.seed,
    round: game.round,
    lives: game.player.stats[PlayerStat.Life],
    gold: game.player.stats[PlayerStat.Gold],
    cards: game.player.deck.map((card) => ({
      id: card.source.id,
      edition: card.edition,
      print: card.print,
      disabled: card.disabled,
    })),
    abilities: game.player.abilities.map((ability) => ability.source.id),
  };
}

/**
 * A run restored from a save. Call `start` to open the saved round, with
 * an ability draft first if one was never picked.
 */
export function resumeGame(save: GameSave, options?: GameOptions): Game {
  const game = createGame(save.seed, options);
  game.round = save.round;
  game.setStat(PlayerStat.Life, save.lives);
  game.setStat(PlayerStat.Gold, save.gold);

  for (const state of save.cards) {
    const card = new CardInstance(game.player, getCard(state.id), state.print, state.edition);
    card.disabled = state.disabled;
    game.player.deck.push(card);
  }

  for (const id of save.abilities) {
    game.player.abilities.push(new AbilityInstance(game.player, getAbility(id)));
  }

  return game;
}
