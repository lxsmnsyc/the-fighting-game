import { log } from '../log';
import { EventPriority, StatPriority } from '../priorities';
import type { Round } from '../round';
import { RoundEventType, Stat } from '../types';

export function setupAbilityMechanics(round: Round): void {
  log('Setting up Ability mechanics.');

  round.on(RoundEventType.SetStat, StatPriority.Post, event => {
    if (
      event.type === Stat.Mana &&
      event.source.stats[Stat.Mana] >= event.source.stats[Stat.MaxMana]
    ) {
      round.castAbility(event.source);
    }
  });

  round.on(RoundEventType.CastAbility, EventPriority.Exact, event => {
    round.setStat(Stat.Mana, event.source, 0);
  });
}
