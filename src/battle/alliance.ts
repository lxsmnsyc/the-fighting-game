import type Battle from './core';
import { BattleEvents } from './events';
import type Team from './team';

/**
 * A side of the battle. Teams in one alliance fight together, and the
 * battle ends once only one alliance has units standing.
 */
export default class Alliance {
  readonly teams = new Set<Team>();

  constructor(readonly battle: Battle) {
    // no-op
  }

  addTeam(team: Team): void {
    this.battle.emit(BattleEvents.AllianceAddTeam, {
      id: 'AllianceAddTeam',
      disabled: false,
      alliance: this,
      team,
    });
  }

  removeTeam(team: Team): void {
    this.battle.emit(BattleEvents.AllianceRemoveTeam, {
      id: 'AllianceRemoveTeam',
      disabled: false,
      alliance: this,
      team,
    });
  }
}
