import type { Accessor, JSX } from 'solid-js';
import { ENERGY_NAMES } from '../../battle/names';
import type { Energy } from '../../battle/types';
import type Unit from '../../battle/unit';
import { ENERGY_CONSUMPTION, ENERGY_DESCRIPTIONS } from '../../game/info';
import { ENERGY_COLORS, ENERGY_LABELS } from '../theme';
import DescriptionText from './description-text';

interface EnergyIconProps {
  unit: Unit;
  energy: Energy;
  version: Accessor<number>;
  opens: 'up' | 'down';
}

export default function EnergyIcon(props: EnergyIconProps): JSX.Element {
  const consumable = (): number => {
    props.version();
    return props.unit.getEnergy(props.energy, false);
  };
  const permanent = (): number => {
    props.version();
    return props.unit.getEnergy(props.energy, true);
  };
  const color = (): string => ENERGY_COLORS[props.energy];

  return (
    <div class="group relative">
      <div
        class="grid size-9 place-items-center rounded-full text-[11px] font-black text-zinc-950 ring-2 ring-black/40"
        style={{ 'background-color': color() }}
      >
        {ENERGY_LABELS[props.energy]}
      </div>
      <span class="absolute -bottom-1 -right-2 rounded bg-zinc-950 px-1 text-[10px] font-bold tabular-nums">
        {consumable() + permanent()}
      </span>
      <div
        class={`pointer-events-none absolute left-1/2 z-20 hidden w-60 -translate-x-1/2 rounded-lg bg-zinc-900/95 p-3 text-sm shadow-xl ring-1 ring-zinc-700 group-hover:block ${props.opens === 'down' ? 'top-full mt-2' : 'bottom-full mb-2'}`}
      >
        <div class="font-bold" style={{ color: color() }}>
          {ENERGY_NAMES[props.energy]}
        </div>
        <p class="mt-1 leading-snug text-zinc-300">
          <DescriptionText description={ENERGY_DESCRIPTIONS[props.energy]} />
        </p>
        <p class="mt-2 text-xs text-zinc-400">
          <DescriptionText description={ENERGY_CONSUMPTION} />
        </p>
        <div class="mt-2 flex justify-between border-t border-zinc-700 pt-2 text-xs tabular-nums">
          <span>Consumable {consumable()}</span>
          <span>Permanent {permanent()}</span>
        </div>
      </div>
    </div>
  );
}
