import type Battle from '../../battle/core';
import { BattleEvents } from '../../battle/events';
import { EventPriority } from '../../core/event-emitter';
import { BATTLE_TIME_LIMIT } from '../constants';
import { GameEvents } from '../events';
import type Game from '../game';
import createOpponent from '../opponent';
import createRound from '../round';
import { BattleResult, GameStage, PlayerStat, RunResult } from '../types';

function getBattleResult(game: Game, battle: Battle): BattleResult {
  if (battle.winner == null) {
    return BattleResult.Draw;
  }
  const won = [...battle.winner.teams].some((team) => team.player === game.player);
  return won ? BattleResult.Won : BattleResult.Lost;
}

/**
 * The battle stage: fighting the round's opponent, and what the result
 * does to the run.
 */
export default function setupBattleMechanics(game: Game): void {
  game.on(GameEvents.StartBattle, EventPriority.Pre, (event) => {
    if (game.stage !== GameStage.Shop) {
      event.disabled = true;
    }
  });

  game.on(GameEvents.StartBattle, EventPriority.Exact, () => {
    const rng = game.rng.battle;
    const opponent = createOpponent(game, rng);
    const battle = createRound(rng.int32().toString(), game.player, [opponent], {
      timeLimit: BATTLE_TIME_LIMIT,
      ...game.options.battle,
    });
    game.battle = battle;
    game.stage = GameStage.Battle;

    battle.on(BattleEvents.End, EventPriority.Post, () => {
      game.endBattle(battle, getBattleResult(game, battle));
    });
  });

  game.on(GameEvents.StartBattle, EventPriority.Post, () => {
    game.battle?.start();
  });

  game.on(GameEvents.EndBattle, EventPriority.Pre, (event) => {
    if (game.stage !== GameStage.Battle || event.battle !== game.battle) {
      event.disabled = true;
    }
  });

  // Income is paid here rather than when a round starts, so a run
  // resumed at the start of a round is not paid twice
  game.on(GameEvents.EndBattle, EventPriority.Exact, (event) => {
    game.stage = GameStage.Idle;
    game.addStat(PlayerStat.Gold, game.checkRoundIncome());
    if (event.result === BattleResult.Lost) {
      game.removeStat(PlayerStat.Life, 1);
    }
  });

  // A win or a draw moves on. A loss replays the round, unless it cost
  // the last life.
  game.on(GameEvents.EndBattle, EventPriority.Post, (event) => {
    if (event.result !== BattleResult.Lost) {
      game.nextRound();
    } else if (game.player.stats[PlayerStat.Life] <= 0) {
      game.end(RunResult.Lost);
    } else {
      game.startRound();
    }
  });
}
