import { EventPriority } from '../../core/event-emitter';
import type Battle from '../core';
import { BattleEvents } from '../events';

export default function setupFieldMechanics(battle: Battle): void {
  battle.on(BattleEvents.Start, EventPriority.Pre, (event) => {
    if (battle.started) {
      event.disabled = true;
    }
  });
  battle.on(BattleEvents.Start, EventPriority.Exact, () => {
    battle.started = true;
  });
  // Without a countdown the fight begins with the clock
  battle.on(BattleEvents.Start, EventPriority.Post, () => {
    if (battle.countdown <= 0) {
      battle.fight();
    }
  });
  battle.on(BattleEvents.Fight, EventPriority.Pre, (event) => {
    if (!battle.started || battle.fighting) {
      event.disabled = true;
    }
  });
  battle.on(BattleEvents.Fight, EventPriority.Exact, () => {
    battle.fighting = true;
  });
  // Before every other tick listener, so they all see the same clock.
  // The countdown is spent first, then the fight's own time.
  battle.on(BattleEvents.Tick, EventPriority.Pre, (event) => {
    if (!battle.started || battle.settled) {
      return;
    }
    if (battle.fighting) {
      battle.elapsed += event.duration;
      return;
    }
    battle.countdown = Math.max(0, battle.countdown - event.duration);
    if (battle.countdown === 0) {
      battle.fight();
    }
  });
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
