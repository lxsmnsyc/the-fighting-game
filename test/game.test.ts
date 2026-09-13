import { describe, expect, it } from 'vitest';
import { Stat } from '../src/battle/types';
import CARDS from '../src/cards';
import CardId from '../src/cards/ids';
import { MergedLifecycle } from '../src/core/lifecycle';
import { CardInstance, createCard } from '../src/game/card';
import {
  ABILITY_BIAS,
  ABILITY_OFFER_SIZE,
  ABILITY_PHASE_INTERVAL,
  CARD_PRICES,
  COPY_LIMITS,
  DEFAULT_GOLD,
  DEFAULT_LIFE,
  ROUNDS_PER_PHASE,
  SHOP_SIZE,
} from '../src/game/constants';
import type Game from '../src/game/game';
import { createRoundRNG } from '../src/game/game';
import { getRoundBudget } from '../src/game/economy';
import createOpponent from '../src/game/opponent';
import { countOwnedCards, isCardUnlocked } from '../src/game/pool';
import { resumeGame, saveGame } from '../src/game/save';
import createGame from '../src/game/setup';
import { Aspect, BattleResult, GameStage, PlayerStat, Rarity, RunResult } from '../src/game/types';

// Starts a run and picks the first ability, which opens the first shop
function startGame(): Game {
  const game = createGame('run');
  game.start();
  game.pickAbility(0);
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
  it('opens with an ability draft, then the first shop with full lives', () => {
    const game = createGame('run');
    game.start();

    expect(game.stage).toBe(GameStage.Draft);
    expect(game.draft.offers).toHaveLength(ABILITY_OFFER_SIZE);
    expect(new Set(game.draft.offers).size).toBe(ABILITY_OFFER_SIZE);

    const [ability] = game.draft.offers;
    expect(game.pickAbility(0)).toBe(true);
    expect(game.player.abilities.map((instance) => instance.source)).toEqual([ability]);
    expect(game.pickAbility(0)).toBe(false);

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
    expect(game.player.abilities).toHaveLength(1);
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

  it('never ends by winning, and offers another ability every few phases', () => {
    const game = startGame();
    game.round = ABILITY_PHASE_INTERVAL * ROUNDS_PER_PHASE;

    finishBattle(game, BattleResult.Won);

    expect(game.result).toBe(RunResult.Ongoing);
    expect(game.getPhase()).toBe(ABILITY_PHASE_INTERVAL + 1);
    expect(game.stage).toBe(GameStage.Draft);
    const [owned] = game.player.abilities;
    expect(game.draft.offers).toHaveLength(ABILITY_OFFER_SIZE);
    expect(game.draft.offers).not.toContain(owned.source);

    expect(game.pickAbility(ABILITY_OFFER_SIZE - 1)).toBe(true);
    expect(game.player.abilities).toHaveLength(2);
    expect(game.stage).toBe(GameStage.Shop);
  });

  it('rolls the same opponent for the same round, and more cards for a boss', () => {
    const game = startGame();
    const first = createOpponent(game, createRoundRNG(game.seed, game.round).battle);
    const again = createOpponent(game, createRoundRNG(game.seed, game.round).battle);

    expect(again.aspects).toEqual(first.aspects);
    expect(again.deck.map((card) => card.source.id)).toEqual(
      first.deck.map((card) => card.source.id),
    );
    expect(first.abilities).toHaveLength(0);

    game.round = ROUNDS_PER_PHASE;
    const boss = createOpponent(game, createRoundRNG(game.seed, game.round).battle);
    expect(boss.boss).toBe(true);
    expect(boss.deck.length).toBeGreaterThan(first.deck.length);
  });

  it('spends a budget that grows with the run on opponent cards', () => {
    const game = startGame();
    const getDeckValue = (round: number): number => {
      game.round = round;
      const opponent = createOpponent(game, createRoundRNG(game.seed, round).battle);
      return opponent.deck.reduce((sum, card) => sum + CARD_PRICES[card.source.rarity], 0);
    };

    expect(getRoundBudget(1)).toBe(DEFAULT_GOLD);
    expect(getRoundBudget(2)).toBe(DEFAULT_GOLD + game.checkRoundIncome());

    const early = getDeckValue(1);
    const middle = getDeckValue(10);
    const late = getDeckValue(22);
    expect(early).toBeLessThanOrEqual(getRoundBudget(1));
    expect(middle).toBeLessThanOrEqual(getRoundBudget(10));
    expect(late).toBeLessThanOrEqual(getRoundBudget(22));
    expect(middle).toBeGreaterThan(early);
    expect(late).toBeGreaterThan(middle);

    // Nothing affordable is left unspent
    const cheapest = Math.min(...Object.values(CARD_PRICES));
    expect(getRoundBudget(22) - late).toBeLessThan(cheapest);
  });

  it('gives bosses as many abilities as the player is due', () => {
    const game = startGame();

    game.round = ROUNDS_PER_PHASE;
    const boss = createOpponent(game, createRoundRNG(game.seed, game.round).battle);
    expect(boss.abilities).toHaveLength(1);
    expect(boss.aspects).toEqual(boss.abilities[0].source.aspects);

    game.round = (ABILITY_PHASE_INTERVAL + 1) * ROUNDS_PER_PHASE;
    const later = createOpponent(game, createRoundRNG(game.seed, game.round).battle);
    expect(later.abilities).toHaveLength(2);

    game.round = ROUNDS_PER_PHASE;
    game.startBattle();
    const units = [...(game.battle?.units() ?? [])];
    expect(
      units.some((unit) => unit.team.player !== game.player && unit.abilities.size === 1),
    ).toBe(true);
  });

  it('resumes a saved round with the same shop, opponent, cards and abilities', () => {
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
    expect(resumed.stage).toBe(GameStage.Shop);
    expect(resumed.player.stats).toEqual(game.player.stats);
    expect(saveGame(resumed)).toEqual(save);
    expect(resumed.shop.offers.map((card) => card?.id)).toEqual(offers);

    resumed.startBattle();
    expect(resumed.battle?.seed).toBe(game.battle?.seed);
    expect(getOpponentCards(resumed)).toEqual(getOpponentCards(game));
  });

  it('offers the same draft again when resumed before picking', () => {
    const game = createGame('run');
    game.start();
    const save = saveGame(game);

    const resumed = resumeGame(save);
    resumed.start();

    expect(resumed.stage).toBe(GameStage.Draft);
    expect(resumed.draft.offers).toEqual(game.draft.offers);
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

  it('favors cards that share aspects with owned abilities', () => {
    const game = startGame();
    const [ability] = game.player.abilities;
    const matching = CARDS.find((card) => card.aspect.includes(ability.source.aspects[0]));
    const unrelated = CARDS.find((card) =>
      card.aspect.every((aspect) => !ability.source.aspects.includes(aspect)),
    );
    if (!matching || !unrelated) {
      throw new Error('The card pool is missing a case');
    }

    expect(game.checkCardWeight(matching)).toBeGreaterThanOrEqual(1 + ABILITY_BIAS);
    expect(game.checkCardWeight(unrelated)).toBe(1);
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
