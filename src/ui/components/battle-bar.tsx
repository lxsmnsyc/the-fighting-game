import { For, type JSX, Show } from 'solid-js';
import type Battle from '../../battle/core';
import { ENERGIES, Stat } from '../../battle/types';
import type Unit from '../../battle/unit';
import type { AbilityInstance } from '../../game/ability';
import { type BattleView, Side } from '../state';
import { AbilityBadge } from './ability-view';
import EnergyIcon from './energy-icon';

interface SideStatusProps {
  view: BattleView;
  side: Side;
  setHealthBar: (side: Side, element: HTMLDivElement) => void;
}

function SideStatus(props: SideStatusProps): JSX.Element {
  const isPlayer = (): boolean => props.side === Side.Player;
  const unit = (): Unit | undefined => props.view.units[props.side].at(0);

  const health = (): { current: number; max: number } => {
    props.view.version();
    let current = 0;
    let max = 0;
    for (const member of props.view.units[props.side]) {
      current += member.stats[Stat.Health];
      max += member.stats[Stat.MaxHealth];
    }
    return { current, max };
  };

  const width = (): string => {
    const { current, max } = health();
    return `${max > 0 ? (current / max) * 100 : 0}%`;
  };

  // Health drains toward the middle of the strip
  const fill = (): JSX.CSSProperties =>
    isPlayer() ? { left: '0', width: width() } : { right: '0', width: width() };

  const energies = (): number[] => {
    props.view.version();
    const current = unit();
    return current ? ENERGIES.filter((energy) => current.getTotalEnergy(energy) > 0) : [];
  };

  const abilities = (): AbilityInstance[] => [...(unit()?.abilities.keys() ?? [])];

  const getCharge = (current: Unit, ability: AbilityInstance): number => {
    props.view.version();
    const cooldown = current.checkAbilityCooldown(ability);
    return cooldown > 0 ? (current.abilities.get(ability) ?? 0) / cooldown : 0;
  };

  return (
    <div class={`flex flex-1 gap-2 ${isPlayer() ? 'flex-col' : 'flex-col-reverse'}`}>
      <div class={`flex text-xs font-semibold text-zinc-400 ${isPlayer() ? '' : 'justify-end'}`}>
        {unit()?.team.player.name ?? ''}
      </div>
      <div
        ref={(element) => {
          props.setHealthBar(props.side, element);
        }}
        class="relative h-7 overflow-hidden rounded-md bg-zinc-800 ring-1 ring-zinc-600"
      >
        <div
          class="absolute inset-y-0 bg-zinc-100/60 transition-[width] delay-300 duration-700 ease-out"
          style={fill()}
        />
        <div
          class={`absolute inset-y-0 transition-[width] duration-150 ${isPlayer() ? 'bg-emerald-500' : 'bg-rose-500'}`}
          style={fill()}
        />
        <span class="absolute inset-0 grid place-items-center text-xs font-bold tabular-nums drop-shadow">
          {Math.ceil(health().current)} / {health().max}
        </span>
      </div>
      <div class={`flex min-h-9 flex-wrap gap-3 ${isPlayer() ? '' : 'justify-end'}`}>
        <Show when={unit()}>
          {(current) => (
            <For each={abilities()}>
              {(ability) => (
                <AbilityBadge
                  ability={ability.source}
                  opens={isPlayer() ? 'down' : 'up'}
                  charge={() => getCharge(current(), ability)}
                  onTrigger={(play) => {
                    props.view.onTrigger(ability, play);
                  }}
                />
              )}
            </For>
          )}
        </Show>
        <Show when={unit()}>
          {(current) => (
            <For each={energies()}>
              {(energy) => (
                <EnergyIcon
                  unit={current()}
                  energy={energy}
                  version={props.view.version}
                  opens={isPlayer() ? 'down' : 'up'}
                />
              )}
            </For>
          )}
        </Show>
      </div>
    </div>
  );
}

// Both the countdown and the time limit are read off the battle clock
function BattleTimer(props: { battle: Battle; view: BattleView }): JSX.Element {
  const counting = (): boolean => {
    props.view.version();
    return !props.battle.fighting;
  };

  const label = (): string => {
    if (counting()) {
      return String(Math.max(1, Math.ceil(props.battle.countdown / 1000)));
    }
    if (props.battle.timeLimit <= 0) {
      return '∞';
    }
    return String(Math.max(0, Math.ceil((props.battle.timeLimit - props.battle.elapsed) / 1000)));
  };

  return (
    <div
      data-testid="battle-timer"
      class={`grid w-24 place-items-center text-4xl font-black tabular-nums ${counting() ? 'animate-pulse text-amber-300' : ''}`}
    >
      {label()}
    </div>
  );
}

interface BattleBarProps {
  battle: Battle;
  view: BattleView;
  setHealthBar: (side: Side, element: HTMLDivElement) => void;
}

/**
 * The middle row in battle: a health strip split between the two
 * sides, with the timer at its center.
 */
export default function BattleBar(props: BattleBarProps): JSX.Element {
  return (
    <div class="flex items-center gap-6 px-8 py-4">
      <SideStatus view={props.view} side={Side.Player} setHealthBar={props.setHealthBar} />
      <BattleTimer battle={props.battle} view={props.view} />
      <SideStatus view={props.view} side={Side.Enemy} setHealthBar={props.setHealthBar} />
    </div>
  );
}
