import { For, type JSX, Show, createSignal } from 'solid-js';
import type { Card, CardInstance } from '../../game/card';
import { PRINTS, PRINT_NAMES, RARITY_NAMES, describePrint, describeRarity } from '../../game/info';
import type { Print } from '../../game/types';
import options from '../options';
import createShakeKeyframes from '../spring';
import { RARITY_COLORS } from '../theme';
import DescriptionText from './description-text';
import Tooltip from './tooltip';

/**
 * Which row the card sits in. Hovered cards rise toward the middle row,
 * and their tooltip opens the same way.
 */
export type Placement = 'top' | 'bottom';

const SHAKE_KEYFRAMES = createShakeKeyframes();
const SHAKE_DURATION = 600;

interface CardViewProps {
  card: Card;
  instance?: CardInstance;
  placement: Placement;
  price?: number;
  /**
   * What the card sells for, when clicking it sells it.
   */
  sellPrice?: number;
  disabled?: boolean;
  onClick?: () => void;
  /**
   * Receives the function that plays the trigger animation.
   */
  onTrigger?: (play: () => void) => void;
  /**
   * Receives the card's face, such as to anchor projectiles on it.
   */
  setElement?: (element: HTMLDivElement) => void;
}

function getPrints(instance: CardInstance | undefined): Print[] {
  const print = instance?.print ?? 0;
  return PRINTS.filter((current) => (print & current) !== 0);
}

function CardTooltip(props: { card: Card; instance?: CardInstance }): JSX.Element {
  const color = (): string => RARITY_COLORS[props.card.rarity];

  return (
    <div class="w-64 rounded-lg bg-zinc-900/95 p-3 text-left text-sm shadow-xl ring-1 ring-zinc-700">
      <div class="flex items-baseline justify-between gap-2">
        <span class="font-bold">{props.card.name}</span>
        <span class="text-xs uppercase tracking-wide" style={{ color: color() }}>
          {RARITY_NAMES[props.card.rarity]}
        </span>
      </div>
      <p class="mt-2 leading-snug text-zinc-300">
        <DescriptionText description={props.card.description(props.instance?.print ?? 0)} />
      </p>
      <div class="mt-3 flex flex-col gap-1.5 border-t border-zinc-700 pt-2 text-xs text-zinc-400">
        <div>
          <span class="font-semibold" style={{ color: color() }}>
            {RARITY_NAMES[props.card.rarity]}
          </span>
          {': '}
          <DescriptionText description={describeRarity(props.card.rarity)} />
        </div>
        <For each={getPrints(props.instance)}>
          {(print) => (
            <div>
              <span class="font-semibold text-fuchsia-300">{PRINT_NAMES[print]}</span>
              {': '}
              <DescriptionText description={describePrint(print)} />
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

export default function CardView(props: CardViewProps): JSX.Element {
  let face: HTMLDivElement | undefined;
  const [hovered, setHovered] = createSignal(false);

  props.onTrigger?.(() => {
    if (options.shake) {
      face?.animate(SHAKE_KEYFRAMES, { duration: SHAKE_DURATION });
    }
  });

  const liftClass = (): string =>
    props.placement === 'bottom' ? 'hover:-translate-y-6' : 'hover:translate-y-6';
  const cursorClass = (): string => {
    if (props.disabled === true) {
      return 'cursor-not-allowed opacity-50';
    }
    return props.onClick ? 'cursor-pointer' : '';
  };

  return (
    <div
      data-testid="card"
      class={`relative transition-transform duration-200 ease-out hover:z-10 ${liftClass()}`}
      onPointerEnter={() => {
        setHovered(true);
      }}
      onPointerLeave={() => {
        setHovered(false);
      }}
    >
      <div
        ref={(element) => {
          face = element;
          props.setElement?.(element);
        }}
        class={`flex h-44 w-32 flex-col rounded-xl border-2 bg-zinc-900 p-2 shadow-lg shadow-black/50 ${cursorClass()}`}
        style={{ 'border-color': RARITY_COLORS[props.card.rarity] }}
        onClick={() => {
          if (props.disabled !== true) {
            props.onClick?.();
          }
        }}
      >
        <span class="truncate text-sm font-bold">{props.card.name}</span>
        <div class="relative my-2 flex-1 rounded-md bg-linear-to-br from-zinc-700 to-zinc-800">
          <div class="absolute right-1 top-1 flex gap-0.5">
            <For each={getPrints(props.instance)}>
              {(print) => (
                <span class="rounded bg-fuchsia-500/80 px-1 text-[9px] font-bold uppercase">
                  {PRINT_NAMES[print][0]}
                </span>
              )}
            </For>
          </div>
        </div>
        <div class="flex items-center justify-between text-[10px] uppercase tracking-wide">
          <span style={{ color: RARITY_COLORS[props.card.rarity] }}>
            {RARITY_NAMES[props.card.rarity]}
          </span>
          <Show when={props.price}>
            {(price) => <span class="font-bold normal-case text-amber-300">{price()}g</span>}
          </Show>
          <Show when={props.sellPrice}>
            {(price) => <span class="font-bold normal-case text-emerald-300">Sell {price()}g</span>}
          </Show>
        </div>
      </div>
      <Tooltip
        anchor={face}
        open={hovered()}
        placement={props.placement === 'bottom' ? 'top' : 'bottom'}
      >
        <CardTooltip card={props.card} instance={props.instance} />
      </Tooltip>
    </div>
  );
}
