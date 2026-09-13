import { type JSX, Show, createSignal, onCleanup } from 'solid-js';
import { Portal } from 'solid-js/web';

/**
 * Which side of its anchor a tooltip prefers.
 */
export type TooltipPlacement = 'top' | 'bottom';

// Space between the tooltip and its anchor, and between it and the
// edges of the viewport, in pixels
const GAP = 12;
const MARGIN = 8;

interface Position {
  left: number;
  top: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

/**
 * Places the tooltip on its preferred side, flips it when only the
 * other side fits, then keeps it inside the viewport.
 */
function getPosition(
  anchor: DOMRect,
  width: number,
  height: number,
  placement: TooltipPlacement,
): Position {
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = document.documentElement.clientHeight;

  const above = anchor.top - GAP - height;
  const below = anchor.bottom + GAP;
  const fitsAbove = above >= MARGIN;
  const fitsBelow = below + height <= viewportHeight - MARGIN;

  let top = placement === 'top' ? above : below;
  if (placement === 'top' && !fitsAbove && fitsBelow) {
    top = below;
  } else if (placement === 'bottom' && !fitsBelow && fitsAbove) {
    top = above;
  }

  return {
    left: clamp(anchor.left + anchor.width / 2 - width / 2, MARGIN, viewportWidth - width - MARGIN),
    top: clamp(top, MARGIN, viewportHeight - height - MARGIN),
  };
}

interface TooltipPanelProps {
  anchor: HTMLElement;
  placement: TooltipPlacement;
  children: JSX.Element;
}

function TooltipPanel(props: TooltipPanelProps): JSX.Element {
  let panel: HTMLDivElement | undefined;
  // Off screen until it is measured
  const [position, setPosition] = createSignal<Position>({ left: -9999, top: -9999 });

  let frame = 0;

  // Followed every frame, since the anchor may still be moving, such as
  // a card rising on hover
  const follow = (): void => {
    if (panel) {
      const { width, height } = panel.getBoundingClientRect();
      setPosition(
        getPosition(props.anchor.getBoundingClientRect(), width, height, props.placement),
      );
    }
    frame = requestAnimationFrame(follow);
  };
  frame = requestAnimationFrame(follow);

  onCleanup(() => {
    cancelAnimationFrame(frame);
  });

  return (
    <div
      ref={(element) => {
        panel = element;
      }}
      role="tooltip"
      class="pointer-events-none fixed z-50 max-w-[calc(100vw-16px)]"
      style={{ left: `${position().left}px`, top: `${position().top}px` }}
    >
      {props.children}
    </div>
  );
}

interface TooltipProps {
  anchor: HTMLElement | undefined;
  open: boolean;
  placement: TooltipPlacement;
  children: JSX.Element;
}

/**
 * A tooltip rendered over the whole page, so no row or overflow clips
 * it, and kept inside the viewport.
 */
export default function Tooltip(props: TooltipProps): JSX.Element {
  return (
    <Show when={props.open ? props.anchor : undefined}>
      {(anchor) => (
        <Portal>
          <TooltipPanel anchor={anchor()} placement={props.placement}>
            {props.children}
          </TooltipPanel>
        </Portal>
      )}
    </Show>
  );
}
