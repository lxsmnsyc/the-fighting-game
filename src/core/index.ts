import { Game } from './game';
import { log } from './log';
import { setupArmorMechanics } from './mechanics/armor';
import { setupAttackMechanics } from './mechanics/attack';
import { setupCriticalMechanics } from './mechanics/critical';
import { setupCureMechanics } from './mechanics/cure';
import { setupDamageMechanics } from './mechanics/damage';
import { setupEvasionMechanics } from './mechanics/evasion';
import { setupHealthMechanics } from './mechanics/health';
import { setupLuckMechanics } from './mechanics/luck';
import { setupMagicMechanics } from './mechanics/magic';
import { setupSpeedMechanics } from './mechanics/speed';
import { setupTickMechanics } from './mechanics/tick';
import { EventPriority } from './priorities';
import { GameEventType } from './types';

export function setupGame(game: Game): void {
  game.on(GameEventType.Setup, EventPriority.Exact, () => {
    console.log('Setup');

    game.start();
  });

  game.on(GameEventType.Start, EventPriority.Exact, () => {
    game.openShop();
  });

  game.on(GameEventType.OpenShop, EventPriority.Exact, () => {

  });

  game.on(GameEventType.NextRound, EventPriority.Exact, () => {

  });

  game.on(GameEventType.End, EventPriority.Exact, () => {

  });
}
