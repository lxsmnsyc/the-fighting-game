import { type Accessor, For, type JSX, Show } from 'solid-js';
import type { Ability } from '../../game/ability';
import { ASPECT_NAMES } from '../../game/info';
import createShakeKeyframes from '../spring';
import { ASPECT_COLORS } from '../theme';
import DescriptionText from './description-text';

const SHAKE_KEYFRAMES = createShakeKeyframes();
const SHAKE_DURATION = 600;

export type TooltipDirection = 'up' | 'down';

// Stand-in art until ability images exist: the two aspects' colors
function getGradient(ability: Ability): string {
  const [first, second] = ability.aspects;
  return `linear-gradient(135deg, ${ASPECT_COLORS[first]}, ${ASPECT_COLORS[second]})`;
}

function getInitials(ability: Ability): string {
  return ability.name.slice(0, 2);
}

function tooltipClass(direction: TooltipDirection): string {
  return direction === 'down' ? 'top-full mt-3' : 'bottom-full mb-3';
}

function AbilityTooltip(props: { ability: Ability }): JSX.Element {
  return (
    <div class="w-64 rounded-lg bg-zinc-900/95 p-3 text-left text-sm shadow-xl ring-1 ring-zinc-700">
      <div class="flex items-baseline justify-between gap-2">
        <span class="font-bold">{props.ability.name}</span>
        <span class="text-xs tabular-nums text-zinc-400">
          {props.ability.cooldown / 1000}s cooldown
        </span>
      </div>
      <p class="mt-2 leading-snug text-zinc-300">
        <DescriptionText description={props.ability.description()} />
      </p>
      <div class="mt-3 border-t border-zinc-700 pt-2 text-xs text-zinc-400">
        The shop favors{' '}
        <For each={props.ability.aspects}>
          {(aspect, index) => (
            <>
              <Show when={index() > 0}> and </Show>
              <span class="font-semibold" style={{ color: ASPECT_COLORS[aspect] }}>
                {ASPECT_NAMES[aspect]}
              </span>
            </>
          )}
        </For>{' '}
        cards.
      </div>
    </div>
  );
}

interface AbilityOfferProps {
  ability: Ability;
  onClick: () => void;
}

/**
 * An ability offered in the draft. It rises and explains itself on
 * hover, like a card.
 */
export function AbilityOffer(props: AbilityOfferProps): JSX.Element {
  return (
    <div
      data-testid="ability-offer"
      class="group relative shrink-0 transition-transform duration-200 ease-out hover:z-10 hover:translate-y-6"
    >
      <button
        type="button"
        class="flex h-48 w-36 cursor-pointer flex-col items-center gap-2 rounded-2xl bg-zinc-900 p-3 shadow-lg shadow-black/50 ring-2 ring-zinc-700 transition hover:ring-zinc-300"
        onClick={() => {
          props.onClick();
        }}
      >
        <div
          class="mt-2 grid size-20 place-items-center rounded-full text-2xl font-black text-zinc-950 ring-4 ring-black/40"
          style={{ background: getGradient(props.ability) }}
        >
          {getInitials(props.ability)}
        </div>
        <span class="text-base font-bold">{props.ability.name}</span>
        <div class="flex gap-1 text-[10px] uppercase tracking-wide">
          <For each={props.ability.aspects}>
            {(aspect) => (
              <span style={{ color: ASPECT_COLORS[aspect] }}>{ASPECT_NAMES[aspect]}</span>
            )}
          </For>
        </div>
        <span class="mt-auto text-xs tabular-nums text-zinc-400">
          {props.ability.cooldown / 1000}s
        </span>
      </button>
      <div
        role="tooltip"
        class={`pointer-events-none absolute left-1/2 z-20 hidden -translate-x-1/2 group-hover:block ${tooltipClass('down')}`}
      >
        <AbilityTooltip ability={props.ability} />
      </div>
    </div>
  );
}

interface AbilityBadgeProps {
  ability: Ability;
  opens: TooltipDirection;
  /**
   * How far the cooldown has charged, from 0 to 1. Leave it out outside
   * battle.
   */
  charge?: Accessor<number>;
  /**
   * Receives the function that plays the trigger animation.
   */
  onTrigger?: (play: () => void) => void;
}

/**
 * A small owned ability. In battle, a ring around it fills as its
 * cooldown charges, and it shakes when it triggers.
 */
export function AbilityBadge(props: AbilityBadgeProps): JSX.Element {
  let face: HTMLDivElement | undefined;

  props.onTrigger?.(() => {
    face?.animate(SHAKE_KEYFRAMES, { duration: SHAKE_DURATION });
  });

  const ring = (): string => {
    const charge = props.charge?.() ?? 1;
    const degrees = Math.max(0, Math.min(charge, 1)) * 360;
    return `conic-gradient(#fafafa ${degrees}deg, #3f3f46 ${degrees}deg)`;
  };

  return (
    <div data-testid="ability-badge" class="group relative">
      <div class="relative size-10 rounded-full" style={{ background: ring() }}>
        <div
          ref={(element) => {
            face = element;
          }}
          class="absolute inset-[3px] grid place-items-center rounded-full text-xs font-black text-zinc-950"
          style={{ background: getGradient(props.ability) }}
        >
          {getInitials(props.ability)}
        </div>
      </div>
      <div
        role="tooltip"
        class={`pointer-events-none absolute left-1/2 z-20 hidden -translate-x-1/2 group-hover:block ${tooltipClass(props.opens)}`}
      >
        <AbilityTooltip ability={props.ability} />
      </div>
    </div>
  );
}
