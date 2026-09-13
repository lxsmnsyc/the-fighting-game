import { describe, expect, it } from 'vitest';
import { Stat } from '../src/battle/types';
import CARDS from '../src/cards';
import CardId from '../src/cards/ids';
import { MergedLifecycle } from '../src/core/lifecycle';
import { CardInstance, createCard } from '../src/game/card';
import {
  CARD_PRICES,
  COPY_LIMITS,
  DEFAULT_GOLD,
  DEFAULT_LIFE,
  PHASES,
  ROUNDS_PER_PHASE,
  SHOP_SIZE,
} from '../src/game/constants';
import type Game from '../src/game/game';
import { createRoundRNG } from '../src/game/game';
import createOpponent from '../src/game/opponent';
import { countOwnedCards, isCardUnlocked } from '../src/game/pool';
import { resumeGame, saveGame } from '../src/game/save';
import createGame from '../src/game/setup';
import { Aspect, BattleResult, GameStage, PlayerStat, Rarity, RunResult } from '../src/game/types';

function startGame(): Game {
  const game = createGame('run');
  game.start();
  return game;
}

// Starts the battle, knocks out the units that should fall, then lets
// the battle settle
function finishBattle(game: Game, result: BattleResult): void {
  game.startBattle();
  const { battle } = game;
  if (!battle) {
    throw new Error('No battle is running');
  }
  for (const unit of battle.units()) {
    const own = unit.team.player === game.player;
    const falls = result === BattleResult.Draw || (result === BattleResult.Won) !== own;
    if (falls) {
      unit.removeStat(Stat.Health, unit.stats[Stat.Health]);
    }
  }
  battle.tick(1000 / 60);
}

function getOpponentCards(game: Game): CardId[] {
  const cards: CardId[] = [];
  for (const unit of game.battle?.units() ?? []) {
    if (unit.team.player !== game.player) {
      cards.push(...[...unit.cards.keys()].map((card) => card.source.id));
    }
  }
  return cards;
}

describe('run', () => {
  it('starts in the first shop with full lives', () => {
    const game = startGame();

    expect(game.player.stats[PlayerStat.Life]).toBe(DEFAULT_LIFE);
    expect(game.player.stats[PlayerStat.Gold]).toBe(DEFAULT_GOLD);
    expect(game.round).toBe(1);
    expect(game.getPhase()).toBe(1);
    expect(game.stage).toBe(GameStage.Shop);
    expect(game.shop.offers).toHaveLength(SHOP_SIZE);
  });

  it('moves to the next round after a win or a draw', () => {
    const game = startGame();

    finishBattle(game, BattleResult.Won);
    expect(game.round).toBe(2);
    expect(game.stage).toBe(GameStage.Shop);

    finishBattle(game, BattleResult.Draw);
    expect(game.round).toBe(3);
    expect(game.player.stats[PlayerStat.Life]).toBe(DEFAULT_LIFE);
  });

  it('replays the round and costs a life after a loss', () => {
    const game = startGame();
    const income = game.checkRoundIncome();

    finishBattle(game, BattleResult.Lost);

    expect(game.round).toBe(1);
    expect(game.stage).toBe(GameStage.Shop);
    expect(game.player.stats[PlayerStat.Life]).toBe(DEFAULT_LIFE - 1);
    expect(game.player.stats[PlayerStat.Gold]).toBe(DEFAULT_GOLD + income);
  });

  it('ends when the last life is lost', () => {
    const game = startGame();

    for (let i = 0; i < DEFAULT_LIFE; i++) {
      finishBattle(game, BattleResult.Lost);
    }

    expect(game.result).toBe(RunResult.Lost);
    expect(game.stage).toBe(GameStage.Ended);
    const { battle } = game;
    game.startBattle();
    expect(game.battle).toBe(battle);
  });

  it('moves to the next phase after the boss round', () => {
    const game = startGame();
    game.round = ROUNDS_PER_PHASE;
    expect(game.isBossRound()).toBe(true);

    finishBattle(game, BattleResult.Won);

    expect(game.getPhase()).toBe(2);
    expect(game.getPhaseRound()).toBe(1);
  });

  it('is won by clearing the last phase', () => {
    const game = startGame();
    game.round = PHASES * ROUNDS_PER_PHASE;

    finishBattle(game, BattleResult.Won);

    expect(game.result).toBe(RunResult.Won);
    expect(game.stage).toBe(GameStage.Ended);
  });

  it('rolls the same opponent for the same round, and more cards for a boss', () => {
    const game = startGame();
    const first = createOpponent(game, createRoundRNG(game.seed, game.round).battle);
    const again = createOpponent(game, createRoundRNG(game.seed, game.round).battle);

    expect(again.aspects).toEqual(first.aspects);
    expect(again.deck.map((card) => card.source.id)).toEqual(
      first.deck.map((card) => card.source.id),
    );

    game.round = ROUNDS_PER_PHASE;
    const boss = createOpponent(game, createRoundRNG(game.seed, game.round).battle);
    expect(boss.boss).toBe(true);
    expect(boss.deck.length).toBeGreaterThan(first.deck.length);
  });

  it('resumes a saved round with the same shop, opponent and cards', () => {
    const game = startGame();
    game.setStat(PlayerStat.Gold, 100);
    for (let slot = 0; slot < SHOP_SIZE; slot++) {
      game.buyCard(slot);
    }
    finishBattle(game, BattleResult.Won);

    const save = saveGame(game);
    const offers = game.shop.offers.map((card) => card?.id);
    game.startBattle();

    const resumed = resumeGame(save);
    resumed.start();

    expect(resumed.round).toBe(2);
    expect(resumed.player.stats).toEqual(game.player.stats);
    expect(saveGame(resumed)).toEqual(save);
    expect(resumed.shop.offers.map((card) => card?.id)).toEqual(offers);

    resumed.startBattle();
    expect(resumed.battle?.seed).toBe(game.battle?.seed);
    expect(getOpponentCards(resumed)).toEqual(getOpponentCards(game));
  });
});

describe('shop', () => {
  it('rerolls for a cost that rises each time', () => {
    const game = startGame();
    game.setStat(PlayerStat.Gold, 3);

    expect(game.checkRerollCost()).toBe(1);
    expect(game.rerollShop()).toBe(true);
    expect(game.player.stats[PlayerStat.Gold]).toBe(2);

    expect(game.checkRerollCost()).toBe(2);
    expect(game.rerollShop()).toBe(true);
    expect(game.player.stats[PlayerStat.Gold]).toBe(0);

    expect(game.rerollShop()).toBe(false);
  });

  it('buys an offered card for its price', () => {
    const game = startGame();
    game.setStat(PlayerStat.Gold, 100);
    const slot = game.shop.offers.findIndex((card) => card != null);
    const card = game.shop.offers[slot];
    if (!card) {
      throw new Error('The shop offered nothing');
    }

    expect(game.buyCard(slot)).toBe(true);
    expect(game.player.stats[PlayerStat.Gold]).toBe(100 - CARD_PRICES[card.rarity]);
    expect(game.player.deck.map((instance) => instance.source)).toEqual([card]);
    expect(game.shop.offers[slot]).toBeUndefined();
    expect(game.buyCard(slot)).toBe(false);
  });

  it('refuses a card the player cannot afford', () => {
    const game = startGame();
    game.setStat(PlayerStat.Gold, 0);

    expect(game.buyCard(0)).toBe(false);
    expect(game.player.deck).toHaveLength(0);
  });

  it('never lets the player own more copies than the rarity allows', () => {
    const game = startGame();
    game.setStat(PlayerStat.Gold, 1_000_000);

    for (let i = 0; i < 40; i++) {
      for (let slot = 0; slot < SHOP_SIZE; slot++) {
        game.buyCard(slot);
      }
      game.rerollShop();
    }

    const owned = countOwnedCards(game.player);
    expect(owned.size).toBeGreaterThan(0);
    for (const card of CARDS) {
      expect(owned.get(card.id) ?? 0).toBeLessThanOrEqual(COPY_LIMITS[card.rarity]);
    }
  });

  it('keeps a secret card locked until every rare of its aspect is owned', () => {
    const game = startGame();
    const secret = createCard({
      id: CardId.Relentless,
      name: 'Secret',
      image: '',
      rarity: Rarity.Secret,
      aspect: [Aspect.Attack],
      description: () => [],
      setup: () => new MergedLifecycle([]),
    });

    expect(isCardUnlocked(game, secret)).toBe(false);

    for (const card of CARDS) {
      if (card.rarity === Rarity.Rare && card.aspect.includes(Aspect.Attack)) {
        game.player.deck.push(new CardInstance(game.player, card));
      }
    }

    expect(isCardUnlocked(game, secret)).toBe(true);
  });
});
