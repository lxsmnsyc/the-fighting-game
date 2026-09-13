import { For, type JSX } from 'solid-js';
import {
  type Description,
  type DescriptionToken,
  TokenType,
  formatToken,
} from '../../game/description';
import { DAMAGE_COLORS, ENERGY_COLORS, STAT_COLOR } from '../theme';

function getTokenColor(token: DescriptionToken): string | undefined {
  if (token.type === TokenType.Energy) {
    return ENERGY_COLORS[token.energy];
  }
  if (token.type === TokenType.Damage) {
    return DAMAGE_COLORS[token.damage];
  }
  if (token.type === TokenType.Stat) {
    return STAT_COLOR;
  }
  return undefined;
}

/**
 * Renders a description, highlighting everything that is not plain text.
 */
export default function DescriptionText(props: { description: Description }): JSX.Element {
  return (
    <For each={props.description}>
      {(token) =>
        token.type === TokenType.Text ? (
          token.text
        ) : (
          <span class="font-semibold text-white" style={{ color: getTokenColor(token) }}>
            {formatToken(token)}
          </span>
        )
      }
    </For>
  );
}
