import { describe, expect, it } from 'vitest';
import { DamageType, Stat } from '../src/battle/types';
import CARDS from '../src/cards';
import CardId from '../src/cards/ids';
import { MergedLifecycle } from '../src/core/lifecycle';
import { CardInstance, createCard } from '../src/game/card';
import {
  ABILITY_BIAS,
  ABILITY_OFFER_SIZE,
  ABILITY_PHASE_INTERVAL,
  BASE_CARD_SLOTS,
  CARD_PRICES,
  COPY_LIMITS,
  DEFAULT_GOLD,
  DEFAULT_LIFE,
  PHASE_CARD_SLOTS,
  RARITY_UNLOCK_COUNT,
  ROUNDS_PER_PHASE,
  SHOP_SIZE,
} from '../src/game/constants';
import type Game from '../src/game/game';
import { createRoundRNG } from '../src/game/game';
import { getCardSlots, getRoundBudget, getSellPrice } from '../src/game/economy';
import createOpponent from '../src/game/opponent';
import {
  countLimitedCopies,
  isCardUnlocked,
  isRarityUnlocked,
  isUnderCopyLimit,
} from '../src/game/pool';
import { resumeGame, saveGame } from '../src/game/save';
import createGame from '../src/game/setup';
import {
  Aspect,
  BattleResult,
  GameStage,
  PlayerStat,
  Print,
  Rarity,
  RunResult,
} from '../src/game/types';

// Starts a run and picks the first ability, which opens the first shop
function startGame(): Game {
  const game = createGame('run');
  game.start();
  game.pickAbility(0);
  return game;
}

// Starts the battle, knocks out the units that should fall, lets the
// battle settle, then continues past the summary
function finishBattle(game: Game, result: BattleResult, proceed = true): void {
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
  if (proceed) {
    game.continueRun();
  }
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
    const getDeck = (round: number): { value: number; size: number; slots: number } => {
      game.round = round;
      const opponent = createOpponent(game, createRoundRNG(game.seed, round).battle);
      return {
        value: opponent.deck.reduce((sum, card) => sum + CARD_PRICES[card.source.rarity], 0),
        size: opponent.deck.length,
        slots: getCardSlots(game.getPhase()),
      };
    };

    expect(getRoundBudget(1)).toBe(DEFAULT_GOLD);
    expect(getRoundBudget(2)).toBe(DEFAULT_GOLD + game.checkRoundIncome());

    const early = getDeck(1);
    const middle = getDeck(10);
    const late = getDeck(22);
    expect(early.value).toBeLessThanOrEqual(getRoundBudget(1));
    expect(middle.value).toBeLessThanOrEqual(getRoundBudget(10));
    expect(late.value).toBeLessThanOrEqual(getRoundBudget(22));
    expect(middle.value).toBeGreaterThan(early.value);
    expect(late.value).toBeGreaterThan(middle.value);

    // Within its slots, and filling them once it can afford to
    for (const deck of [early, middle, late]) {
      expect(deck.size).toBeLessThanOrEqual(deck.slots);
    }
    expect(late.size).toBe(late.slots);
  });

  it('holds as many cards as the phase allows, and sells to make room', () => {
    const game = startGame();
    expect(game.checkCardSlots()).toBe(BASE_CARD_SLOTS);

    game.round = ROUNDS_PER_PHASE * 2 + 1;
    expect(game.checkCardSlots()).toBe(BASE_CARD_SLOTS + PHASE_CARD_SLOTS * 2);

    game.round = 1;
    game.setStat(PlayerStat.Gold, 1_000_000);
    for (let i = 0; i < 20 && game.player.deck.length < BASE_CARD_SLOTS; i++) {
      for (let slot = 0; slot < SHOP_SIZE; slot++) {
        game.buyCard(slot);
      }
      game.rerollShop();
    }
    expect(game.player.deck).toHaveLength(BASE_CARD_SLOTS);

    const slot = game.shop.offers.findIndex((card) => card != null);
    expect(game.buyCard(slot)).toBe(false);

    const [sold] = game.player.deck;
    const gold = game.player.stats[PlayerStat.Gold];
    game.sellCard(sold);
    expect(game.player.deck).toHaveLength(BASE_CARD_SLOTS - 1);
    expect(game.player.stats[PlayerStat.Gold]).toBe(
      gold + getSellPrice(CARD_PRICES[sold.source.rarity]),
    );
    expect(game.buyCard(slot)).toBe(true);
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
    const offers = game.shop.offers.map((card) => card?.source.id);
    game.startBattle();

    const resumed = resumeGame(save);
    resumed.start();

    expect(resumed.round).toBe(2);
    expect(resumed.stage).toBe(GameStage.Shop);
    expect(resumed.player.stats).toEqual(game.player.stats);
    expect(saveGame(resumed)).toEqual(save);
    expect(resumed.shop.offers.map((card) => card?.source.id)).toEqual(offers);

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

  it('sums up the battle, then waits for the player to continue', () => {
    const game = startGame();
    const gold = game.player.stats[PlayerStat.Gold];
    const income = game.checkRoundIncome();

    game.startBattle();
    const { battle } = game;
    if (!battle) {
      throw new Error('No battle is running');
    }
    const units = [...battle.units()];
    const own = units.find((unit) => unit.team.player === game.player);
    const enemy = units.find((unit) => unit.team.player !== game.player);
    if (!own || !enemy) {
      throw new Error('A side is missing');
    }

    own.dealDamage(enemy, DamageType.Pure, 100, 0);
    enemy.dealDamage(own, DamageType.Pure, 60, 0);
    own.heal(own, 40, 0);
    // Only 20 Health is missing by now, so the rest is overhealing
    own.heal(own, 100, 0);
    enemy.removeStat(Stat.Health, enemy.stats[Stat.Health]);
    battle.tick(1000 / 60);

    expect(game.stage).toBe(GameStage.Summary);
    expect(game.round).toBe(1);
    expect(game.player.stats[PlayerStat.Gold]).toBe(gold + income);

    const { summary } = game;
    expect(summary?.result).toBe(BattleResult.Won);
    expect(summary?.gold).toBe(income);
    expect(summary?.livesLost).toBe(0);
    expect(summary?.player.damageDealt).toBe(100);
    expect(summary?.player.damageTaken).toBe(60);
    expect(summary?.player.healing).toBe(60);
    expect(summary?.enemy.damageTaken).toBe(100);
    expect(summary?.enemy.damageDealt).toBe(60);

    // No new battle starts from the summary
    game.startBattle();
    expect(game.stage).toBe(GameStage.Summary);
    expect(game.battle).toBe(battle);

    expect(game.continueRun()).toBe(true);
    expect(game.round).toBe(2);
    expect(game.stage).toBe(GameStage.Shop);
    expect(game.continueRun()).toBe(false);
  });

  it('rolls a new shop but meets the same opponent when a round is replayed', () => {
    const game = startGame();
    const getOffers = (current: Game): (CardId | undefined)[] =>
      current.shop.offers.map((card) => card?.source.id);
    const offers = getOffers(game);

    finishBattle(game, BattleResult.Lost);
    const seed = game.battle?.seed;
    const opponent = getOpponentCards(game);

    expect(game.round).toBe(1);
    expect(game.attempt).toBe(1);
    expect(getOffers(game)).not.toEqual(offers);

    // A save keeps the attempt, so a resumed replay rolls the same new shop
    const resumed = resumeGame(saveGame(game));
    resumed.start();
    expect(getOffers(resumed)).toEqual(getOffers(game));

    game.startBattle();
    expect(game.battle?.seed).toBe(seed);
    expect(getOpponentCards(game)).toEqual(opponent);

    finishBattle(game, BattleResult.Won);
    expect(game.round).toBe(2);
    expect(game.attempt).toBe(0);
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
    expect(game.player.stats[PlayerStat.Gold]).toBe(100 - CARD_PRICES[card.source.rarity]);
    expect(game.player.deck).toEqual([card]);
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

    const owned = countLimitedCopies(game.player);
    expect(owned.size).toBeGreaterThan(0);
    for (const card of CARDS) {
      expect(owned.get(card.id) ?? 0).toBeLessThanOrEqual(COPY_LIMITS[card.rarity]);
    }
  });

  it('lets Negative copies go past the copy limit', () => {
    const game = startGame();
    const rare = CARDS.find((card) => card.rarity === Rarity.Rare);
    if (!rare) {
      throw new Error('The card pool has no rare card');
    }

    game.player.deck.push(new CardInstance(game.player, rare));
    const copies = countLimitedCopies(game.player);
    expect(isUnderCopyLimit(rare, 0, copies)).toBe(false);
    expect(isUnderCopyLimit(rare, Print.Negative, copies)).toBe(true);

    // A Negative copy is not counted, so the next plain copy still does not fit
    game.player.deck.push(new CardInstance(game.player, rare, Print.Negative));
    expect(countLimitedCopies(game.player).get(rare.id)).toBe(1);

    // With Rare cards unlocked and every offer Negative, the shop offers
    // the rare again
    game.player.acquired[Rarity.Uncommon] = RARITY_UNLOCK_COUNT;
    game.player.printSpawnChance[Print.Negative] = 1;
    game.setStat(PlayerStat.Gold, 1_000_000);
    let offered = false;
    for (let i = 0; i < 300 && !offered; i++) {
      offered = game.shop.offers.some((offer) => offer?.source === rare);
      game.rerollShop();
    }
    expect(offered).toBe(true);
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

  it('unlocks each rarity after the one before it', () => {
    const game = createGame('run');
    game.start();
    expect(isRarityUnlocked(game, Rarity.Common)).toBe(false);

    game.pickAbility(0);
    expect(isRarityUnlocked(game, Rarity.Common)).toBe(true);
    expect(isRarityUnlocked(game, Rarity.Uncommon)).toBe(false);
    expect(isRarityUnlocked(game, Rarity.Rare)).toBe(false);
    expect(isRarityUnlocked(game, Rarity.Secret)).toBe(false);
    expect(game.shop.offers.every((offer) => offer?.source.rarity === Rarity.Common)).toBe(true);

    game.player.acquired[Rarity.Common] = RARITY_UNLOCK_COUNT - 1;
    expect(isRarityUnlocked(game, Rarity.Uncommon)).toBe(false);

    game.player.acquired[Rarity.Common] = RARITY_UNLOCK_COUNT;
    expect(isRarityUnlocked(game, Rarity.Uncommon)).toBe(true);
    expect(isRarityUnlocked(game, Rarity.Rare)).toBe(false);

    game.player.acquired[Rarity.Uncommon] = RARITY_UNLOCK_COUNT;
    expect(isRarityUnlocked(game, Rarity.Rare)).toBe(true);
    expect(isRarityUnlocked(game, Rarity.Secret)).toBe(true);
  });

  it('counts a card toward unlocks once acquired, even after selling it', () => {
    const game = startGame();
    game.setStat(PlayerStat.Gold, 100);
    const slot = game.shop.offers.findIndex((card) => card != null);
    const card = game.shop.offers[slot];
    if (!card) {
      throw new Error('The shop offered nothing');
    }

    game.buyCard(slot);
    game.sellCard(card);

    expect(game.player.deck).toHaveLength(0);
    expect(game.player.acquired[card.source.rarity]).toBe(1);
  });

  it('keeps a secret card locked when its aspect has no rare card', () => {
    const game = startGame();
    const hasRare = CARDS.some(
      (card) => card.rarity === Rarity.Rare && card.aspect.includes(Aspect.Universal),
    );
    expect(hasRare).toBe(false);

    const secret = createCard({
      id: CardId.Relentless,
      name: 'Secret',
      image: '',
      rarity: Rarity.Secret,
      aspect: [Aspect.Universal],
      description: () => [],
      setup: () => new MergedLifecycle([]),
    });

    expect(isCardUnlocked(game, secret)).toBe(false);
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
