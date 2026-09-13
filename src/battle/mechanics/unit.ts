import { EventPriority } from '../../core/event-emitter';
import type Battle from '../core';
import { BattleEvents } from '../events';
import { Stat, ValuePriority } from '../types';

export default function setupUnitMechanics(battle: Battle): void {
  battle.on(BattleEvents.Fight, EventPriority.Exact, () => {
    for (const unit of battle.units()) {
      unit.enter();
    }
  });

  battle.on(BattleEvents.UnitEntersBattle, EventPriority.Exact, (event) => {
    event.source.alive = event.source.stats[Stat.Health] > 0;
  });

  battle.on(BattleEvents.UnitFaints, EventPriority.Pre, (event) => {
    if (!event.source.alive) {
      event.disabled = true;
    }
  });

  battle.on(BattleEvents.UnitFaints, EventPriority.Exact, (event) => {
    event.source.alive = false;
  });

  battle.on(BattleEvents.UnitSetStat, ValuePriority.Exact, (event) => {
    const { stats } = event.source;

    if (event.stat === Stat.Health) {
      stats[Stat.Health] = Math.min(Math.max(0, event.value), stats[Stat.MaxHealth]);
    }

    if (event.stat === Stat.MaxHealth) {
      // Health keeps its share of the maximum
      const share = stats[Stat.Health] / stats[Stat.MaxHealth];
      stats[Stat.MaxHealth] = Math.max(1, event.value);
      event.source.setStat(Stat.Health, share * stats[Stat.MaxHealth]);
    }
  });

  battle.on(BattleEvents.UnitAddStat, ValuePriority.Exact, (event) => {
    event.source.setStat(event.stat, event.source.stats[event.stat] + event.value);
  });

  battle.on(BattleEvents.UnitRemoveStat, ValuePriority.Exact, (event) => {
    event.source.setStat(event.stat, event.source.stats[event.stat] - event.value);
  });

  battle.on(BattleEvents.UnitSetStat, ValuePriority.Post, (event) => {
    if (event.stat === Stat.Health && event.source.stats[Stat.Health] === 0) {
      event.source.faint();
    }
  });
}
