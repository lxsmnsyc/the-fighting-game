import { type Accessor, For, type JSX } from 'solid-js';
import type { AbilityInstance } from '../../game/ability';
import { DEFAULT_LIFE } from '../../game/constants';
import type Game from '../../game/game';
import { PlayerStat } from '../../game/types';
import { AbilityBadge } from './ability-view';

interface RunStatusProps {
  game: Game;
  version: Accessor<number>;
}

/**
 * The phase, the round and the lives left.
 */
export default function RunStatus(props: RunStatusProps): JSX.Element {
  const read =
    <T,>(getter: () => T): (() => T) =>
    (): T => {
      props.version();
      return getter();
    };
  const lives = read(() => props.game.player.stats[PlayerStat.Life]);
  const phase = read(() => props.game.getPhase());
  const phaseRound = read(() => props.game.getPhaseRound());
  const boss = read(() => props.game.isBossRound());

  return (
    <div class="flex flex-col gap-1">
      <span class="text-xs uppercase tracking-wide text-zinc-400">Phase {phase()}</span>
      <span class="text-lg font-bold">{boss() ? 'Boss round' : `Round ${phaseRound()}`}</span>
      <div class="flex gap-1 text-lg leading-none">
        <For each={Array.from({ length: DEFAULT_LIFE }, (_, index) => index)}>
          {(index) => <span class={index < lives() ? 'text-rose-500' : 'text-zinc-700'}>♥</span>}
        </For>
      </div>
    </div>
  );
}

/**
 * The player's abilities, outside battle.
 */
export function OwnedAbilities(props: RunStatusProps): JSX.Element {
  const abilities = (): AbilityInstance[] => {
    props.version();
    return [...props.game.player.abilities];
  };

  return (
    <div class="flex flex-wrap justify-end gap-2">
      <For each={abilities()}>
        {(ability) => <AbilityBadge ability={ability.source} opens="up" />}
      </For>
    </div>
  );
}
