import { EventPriority } from '../../core/event-emitter';
import type Battle from '../core';
import { BattleEvents } from '../events';

export default function setupFieldMechanics(battle: Battle): void {
  battle.on(BattleEvents.AddAlliance, EventPriority.Exact, (event) => {
    battle.alliances.add(event.alliance);
  });
  battle.on(BattleEvents.RemoveAlliance, EventPriority.Exact, (event) => {
    battle.alliances.delete(event.alliance);
  });
  battle.on(BattleEvents.AllianceAddTeam, EventPriority.Exact, (event) => {
    event.alliance.teams.add(event.team);
  });
  battle.on(BattleEvents.AllianceRemoveTeam, EventPriority.Exact, (event) => {
    event.alliance.teams.delete(event.team);
  });
  battle.on(BattleEvents.TeamAddUnit, EventPriority.Exact, (event) => {
    event.team.units.add(event.unit);
  });
  battle.on(BattleEvents.TeamRemoveUnit, EventPriority.Exact, (event) => {
    event.team.units.delete(event.unit);
  });
}
