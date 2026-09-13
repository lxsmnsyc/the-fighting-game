import type { Player } from '../game/player';
import type Alliance from './alliance';
import type Battle from './core';
import { BattleEvents } from './events';
import type Unit from './unit';

/**
 * The units one player brings into a battle.
 */
export default class Team {
  readonly units = new Set<Unit>();

  constructor(
    readonly battle: Battle,
    readonly alliance: Alliance,
    readonly player: Player,
  ) {
    // no-op
  }

  addUnit(unit: Unit): void {
    this.battle.emit(BattleEvents.TeamAddUnit, {
      id: 'TeamAddUnit',
      disabled: false,
      team: this,
      unit,
    });
  }

  removeUnit(unit: Unit): void {
    this.battle.emit(BattleEvents.TeamRemoveUnit, {
      id: 'TeamRemoveUnit',
      disabled: false,
      team: this,
      unit,
    });
  }
}
