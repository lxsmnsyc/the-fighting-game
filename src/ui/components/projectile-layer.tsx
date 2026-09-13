import { For, type JSX, onMount } from 'solid-js';
import type { BattleView, Projectile, Side } from '../state';
import { DAMAGE_COLORS } from '../theme';

const FLIGHT_DURATION = 450;

type Anchor = (side: Side) => HTMLElement | undefined;

interface ProjectileDotProps {
  projectile: Projectile;
  getSource: Anchor;
  getTarget: Anchor;
  onDone: () => void;
}

function ProjectileDot(props: ProjectileDotProps): JSX.Element {
  let dot: HTMLDivElement | undefined;
  const color = DAMAGE_COLORS[props.projectile.type];

  onMount(() => {
    const source = props.getSource(props.projectile.from)?.getBoundingClientRect();
    const target = props.getTarget(props.projectile.to)?.getBoundingClientRect();
    if (!dot || !source || !target) {
      props.onDone();
      return;
    }

    // From the middle of the side's card row to somewhere on the target's health
    const fromX = source.left + source.width / 2;
    const fromY = source.top + source.height / 2;
    const toX = target.left + target.width * (0.25 + Math.random() * 0.5);
    const toY = target.top + target.height / 2;

    const flight = dot.animate(
      [
        { transform: `translate(${fromX}px, ${fromY}px) scale(0.6)` },
        { transform: `translate(${toX}px, ${toY}px) scale(1.2)` },
      ],
      { duration: FLIGHT_DURATION, easing: 'cubic-bezier(0.5, 0, 0.75, 0)', fill: 'forwards' },
    );
    flight.addEventListener('finish', () => {
      props.onDone();
    });
  });

  return (
    <div
      ref={(element) => {
        dot = element;
      }}
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
 * that took it, colored by damage type.
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
