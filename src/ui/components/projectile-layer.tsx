import { For, type JSX, onMount } from 'solid-js';
import lerp from '../../core/lerp';
import type { BattleView, Projectile } from '../state';
import { DAMAGE_COLORS, ENERGY_COLORS } from '../theme';

const FLIGHT_DURATION = 450;

// How far the arc bends away from the straight line, as a share of the
// distance flown, and at most in pixels
const MIN_BEND = 0.1;
const MAX_BEND = 0.3;
const MAX_BEND_DISTANCE = 160;

const ARC_STEPS = 24;

type Anchor = (projectile: Projectile) => HTMLElement | undefined;

interface Point {
  x: number;
  y: number;
}

/**
 * A gentle arc from `from` to `to`, bending to a random side by a random
 * amount. It is a quadratic Bézier curve sampled into keyframes, with
 * its control point pushed sideways from the middle of the line.
 */
function createArcKeyframes(from: Point, to: Point): Keyframe[] {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy) || 1;
  const side = Math.random() < 0.5 ? -1 : 1;
  const bend = Math.min(distance * lerp(MIN_BEND, MAX_BEND, Math.random()), MAX_BEND_DISTANCE);
  // Twice the bend, since the curve only reaches halfway to its control point
  const control: Point = {
    x: (from.x + to.x) / 2 + (-dy / distance) * bend * 2 * side,
    y: (from.y + to.y) / 2 + (dx / distance) * bend * 2 * side,
  };

  const keyframes: Keyframe[] = [];
  for (let step = 0; step <= ARC_STEPS; step++) {
    const t = step / ARC_STEPS;
    const rest = 1 - t;
    const x = rest * rest * from.x + 2 * rest * t * control.x + t * t * to.x;
    const y = rest * rest * from.y + 2 * rest * t * control.y + t * t * to.y;
    keyframes.push({ transform: `translate(${x}px, ${y}px) scale(${lerp(0.6, 1.2, t)})` });
  }
  return keyframes;
}

interface ProjectileDotProps {
  projectile: Projectile;
  getSource: Anchor;
  getTarget: Anchor;
  onDone: () => void;
}

function getColor(projectile: Projectile): string {
  return projectile.kind === 'damage'
    ? DAMAGE_COLORS[projectile.type]
    : ENERGY_COLORS[projectile.energy];
}

function ProjectileDot(props: ProjectileDotProps): JSX.Element {
  let dot: HTMLDivElement | undefined;
  const color = getColor(props.projectile);

  onMount(() => {
    const source = props.getSource(props.projectile)?.getBoundingClientRect();
    const target = props.getTarget(props.projectile)?.getBoundingClientRect();
    if (!dot || !source || !target) {
      props.onDone();
      return;
    }

    // From the middle of the source to somewhere along the target
    const from: Point = {
      x: source.left + source.width / 2,
      y: source.top + source.height / 2,
    };
    const to: Point = {
      x: target.left + target.width * (0.25 + Math.random() * 0.5),
      y: target.top + target.height / 2,
    };

    const flight = dot.animate(createArcKeyframes(from, to), {
      duration: FLIGHT_DURATION,
      easing: 'cubic-bezier(0.5, 0, 0.75, 0)',
      fill: 'forwards',
    });
    flight.addEventListener('finish', () => {
      props.onDone();
    });
  });

  return (
    <div
      ref={(element) => {
        dot = element;
      }}
      data-testid="projectile"
      data-kind={props.projectile.kind}
      class="absolute left-0 top-0 -ml-2 -mt-2 size-4 rounded-full"
      style={{ 'background-color': color, 'box-shadow': `0 0 14px 4px ${color}` }}
    />
  );
}

interface ProjectileLayerProps {
  view: BattleView;
  getSource: Anchor;
  getTarget: Anchor;
}

/**
 * Damage flying from the side that dealt it to the health of the side
 * that took it, colored by damage type. Energy a card hands out flies
 * from the card to the receiver, colored by energy.
 */
export default function ProjectileLayer(props: ProjectileLayerProps): JSX.Element {
  return (
    <div class="pointer-events-none fixed inset-0 z-30">
      <For each={props.view.projectiles()}>
        {(projectile) => (
          <ProjectileDot
            projectile={projectile}
            getSource={props.getSource}
            getTarget={props.getTarget}
            onDone={() => {
              props.view.removeProjectile(projectile.id);
            }}
          />
        )}
      </For>
    </div>
  );
}
