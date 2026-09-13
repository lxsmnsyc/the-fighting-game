import type { BaseEvent } from '../../core/event-emitter';
import type Alliance from '../alliance';
import type Team from '../team';
import type Unit from '../unit';

export interface TickEvent extends BaseEvent {
  duration: number;
}

export interface AllianceEvent extends BaseEvent {
  alliance: Alliance;
}

export interface AllianceTeamEvent extends AllianceEvent {
  team: Team;
}

export interface TeamUnitEvent extends BaseEvent {
  team: Team;
  unit: Unit;
}
