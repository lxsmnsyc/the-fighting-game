import { describe, expect, it } from 'vitest';
import { Stat } from '../src/battle/types';
import {
  ABILITY_PHASE_INTERVAL,
  CARD_PRICES,
  DEFAULT_LIFE,
  ROUNDS_PER_PHASE,
} from '../src/game/constants';
import type Game from '../src/game/game';
import GAME_MODES, { getGameMode } from '../src/game/modes';
import GameModeId from '../src/game/modes/ids';
import { Player } from '../src/game/player';
import { resumeGame, saveGame } from '../src/game/save';
import createGame from '../src/game/setup';
import { GameStage, PlayerStat, Print, RunResult } from '../src/game/types';

// Starts a run in `mode` and picks the first ability, which opens the
// first shop
function startGame(mode: GameModeId): Game {
  const game = createGame('modes', { mode });
  game.start();
  game.pickAbility(0);
  return game;
}

// Starts the battle, knocks out the losing side, lets it settle, then
// continues past the summary
function finishBattle(game: Game, won: boolean): void {
  game.startBattle();
  const { battle } = game;
  if (!battle) {
    throw new Error('No battle is running');
  }
  for (const unit of battle.units()) {
    if ((unit.team.player === game.player) !== won) {
      unit.removeStat(Stat.Health, unit.stats[Stat.Health]);
    }
  }
  battle.tick(1000 / 60);
  game.continueRun();
}

const PRINTS = [Print.Error, Print.Monotone, Print.Negative] as const;

describe('game mode registry', () => {
  it('gives every mode a unique id, a unique name and its rules', () => {
    const ids = GAME_MODES.map((mode) => mode.id);
    const names = GAME_MODES.map((mode) => mode.name);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(names).size).toBe(names.length);
    for (const mode of GAME_MODES) {
      expect(getGameMode(mode.id)).toBe(mode);
      expect(mode.rules.length).toBeGreaterThan(0);
    }
  });
});

describe('game modes', () => {
  it('play Standard when no mode is given', () => {
    const game = createGame('modes');

    expect(game.mode).toBe(GameModeId.Standard);
    expect(game.player.stats[PlayerStat.Life]).toBe(DEFAULT_LIFE);
    expect(game.checkAbilityInterval()).toBe(ABILITY_PHASE_INTERVAL);
  });

  it('Hardcore ends the run on the first loss', () => {
    const game = startGame(GameModeId.Hardcore);
    expect(game.checkMaxLife()).toBe(1);
    expect(game.player.stats[PlayerStat.Life]).toBe(1);

    finishBattle(game, false);

    expect(game.result).toBe(RunResult.Lost);
  });

  it('Chaos makes prints 3 times as likely, for opponents too', () => {
    const standard = createGame('modes');
    const chaos = createGame('modes', { mode: GameModeId.Chaos });
    const opponent = new Player();

    for (const print of PRINTS) {
      const base = standard.checkPrintChance(standard.player, print);
      expect(chaos.checkPrintChance(chaos.player, print)).toBeCloseTo(base * 3);
      expect(chaos.checkPrintChances(opponent)[print]).toBeCloseTo(
        opponent.printSpawnChance[print] * 3,
      );
    }
  });

  it('Beastmaster offers an ability every 2 phases', () => {
    const standard = startGame(GameModeId.Standard);
    const beastmaster = startGame(GameModeId.Beastmaster);

    for (const game of [standard, beastmaster]) {
      game.round = 2 * ROUNDS_PER_PHASE;
      finishBattle(game, true);
      expect(game.getPhase()).toBe(3);
    }

    expect(standard.stage).toBe(GameStage.Shop);
    expect(beastmaster.stage).toBe(GameStage.Draft);
    expect(beastmaster.getAbilityCount()).toBe(2);
  });

  it('Gambler rerolls for free, but cards cost more', () => {
    const game = startGame(GameModeId.Gambler);
    const offer = game.shop.offers.find((card) => card != null);
    if (!offer) {
      throw new Error('The shop has no offer');
    }

    expect(game.checkCardPrice(offer.source)).toBe(CARD_PRICES[offer.source.rarity] + 2);

    game.setStat(PlayerStat.Gold, 0);
    expect(game.rerollShop()).toBe(true);
    expect(game.rerollShop()).toBe(true);
    expect(game.checkRerollCost()).toBe(0);
  });

  it('are kept by saves', () => {
    const game = startGame(GameModeId.Hardcore);
    const save = saveGame(game);
    expect(save.mode).toBe(GameModeId.Hardcore);

    const resumed = resumeGame(save);
    expect(resumed.mode).toBe(GameModeId.Hardcore);
    expect(resumed.checkMaxLife()).toBe(1);
    expect(resumed.player.stats[PlayerStat.Life]).toBe(1);
  });
});
