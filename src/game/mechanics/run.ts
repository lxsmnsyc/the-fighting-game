import { ValuePriority } from '../../battle/types';
import { EventPriority } from '../../core/event-emitter';
import { BASE_ROUND_INCOME, PHASES, PHASE_INCOME, ROUNDS_PER_PHASE } from '../constants';
import { GameEvents } from '../events';
import type Game from '../game';
import { createRoundRNG } from '../game';
import { GameStage, RunResult } from '../types';

/**
 * Moves the run through its rounds, and ends it.
 */
export default function setupRunMechanics(game: Game): void {
  game.on(GameEvents.Start, EventPriority.Pre, (event) => {
    if (game.started) {
      event.disabled = true;
    }
  });

  game.on(GameEvents.Start, EventPriority.Exact, () => {
    game.started = true;
  });

  game.on(GameEvents.Start, EventPriority.Post, () => {
    game.startRound();
  });

  game.on(GameEvents.StartRound, EventPriority.Pre, (event) => {
    if (game.stage === GameStage.Ended) {
      event.disabled = true;
    }
  });

  game.on(GameEvents.StartRound, EventPriority.Exact, () => {
    game.rng = createRoundRNG(game.seed, game.round);
  });

  game.on(GameEvents.StartRound, EventPriority.Post, () => {
    game.openShop();
  });

  game.on(GameEvents.CheckRoundIncome, ValuePriority.Initial, (event) => {
    event.value = BASE_ROUND_INCOME + PHASE_INCOME * (game.getPhase() - 1);
  });

  game.on(GameEvents.NextRound, EventPriority.Pre, (event) => {
    if (game.stage === GameStage.Ended) {
      event.disabled = true;
      return;
    }
    // Clearing the last round of the last phase wins the run
    if (game.round >= PHASES * ROUNDS_PER_PHASE) {
      event.disabled = true;
      game.end(RunResult.Won);
    }
  });

  game.on(GameEvents.NextRound, EventPriority.Exact, () => {
    game.round++;
  });

  game.on(GameEvents.NextRound, EventPriority.Post, () => {
    game.startRound();
  });

  game.on(GameEvents.End, EventPriority.Pre, (event) => {
    if (game.stage === GameStage.Ended) {
      event.disabled = true;
    }
  });

  game.on(GameEvents.End, EventPriority.Exact, (event) => {
    game.stage = GameStage.Ended;
    game.result = event.result;
  });
}
