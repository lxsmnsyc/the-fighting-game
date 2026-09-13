import { DAMAGE_TYPE_NAMES, ENERGY_NAMES, STAT_NAMES } from '../battle/names';
import type { DamageType, Energy, Stat } from '../battle/types';

export const enum TokenType {
  Text = 0,
  Value = 1,
  Energy = 2,
  Damage = 3,
  Stat = 4,
}

export const enum ValueUnit {
  None = 0,
  Percent = 1,
  Seconds = 2,
  Multiplier = 3,
}

export interface TextToken {
  type: TokenType.Text;
  text: string;
}

/**
 * A raw number from the card's effect, such as a chance or a duration.
 */
export interface ValueToken {
  type: TokenType.Value;
  value: number;
  unit: ValueUnit;
}

export interface EnergyToken {
  type: TokenType.Energy;
  energy: Energy;
  value?: number;
}

/**
 * Carries the damage type so a UI can color it.
 */
export interface DamageToken {
  type: TokenType.Damage;
  damage: DamageType;
  value?: number;
}

export interface StatToken {
  type: TokenType.Stat;
  stat: Stat;
  value?: number;
}

export type DescriptionToken = TextToken | ValueToken | EnergyToken | DamageToken | StatToken;

/**
 * A card's text as a sequence of tokens. Everything but text tokens is
 * meant to be highlighted.
 */
export type Description = DescriptionToken[];

function text(content: string): TextToken {
  return { type: TokenType.Text, text: content };
}

function value(amount: number, unit = ValueUnit.None): ValueToken {
  return { type: TokenType.Value, value: amount, unit };
}

// Takes a ratio, so 0.25 reads as 25%
function percent(ratio: number): ValueToken {
  return value(Math.round(ratio * 10000) / 100, ValueUnit.Percent);
}

// Takes milliseconds, like the rest of the engine
function seconds(duration: number): ValueToken {
  return value(duration / 1000, ValueUnit.Seconds);
}

function multiplier(amount: number): ValueToken {
  return value(amount, ValueUnit.Multiplier);
}

function energy(type: Energy, amount?: number): EnergyToken {
  return { type: TokenType.Energy, energy: type, value: amount };
}

function damage(type: DamageType, amount?: number): DamageToken {
  return { type: TokenType.Damage, damage: type, value: amount };
}

function stat(type: Stat, amount?: number): StatToken {
  return { type: TokenType.Stat, stat: type, value: amount };
}

export const token = {
  text,
  value,
  percent,
  seconds,
  multiplier,
  energy,
  damage,
  stat,
};

type DescriptionPart = DescriptionToken | Description | string;

/**
 * Builds a description from a template literal. The literal text and
 * any interpolated strings become text tokens. Interpolated tokens and
 * descriptions are kept as they are.
 */
export function describe(strings: TemplateStringsArray, ...parts: DescriptionPart[]): Description {
  const tokens: Description = [];

  const push = (current: DescriptionToken): void => {
    if (current.type !== TokenType.Text) {
      tokens.push(current);
      return;
    }
    if (current.text === '') {
      return;
    }
    const last = tokens.at(-1);
    // Neighbouring text is merged into one token
    if (last?.type === TokenType.Text) {
      tokens[tokens.length - 1] = text(last.text + current.text);
    } else {
      tokens.push(text(current.text));
    }
  };

  for (let i = 0; i < strings.length; i++) {
    push(text(strings[i]));
    if (i < parts.length) {
      const part = parts[i];
      if (typeof part === 'string') {
        push(text(part));
      } else if ('type' in part) {
        push(part);
      } else {
        for (const current of part) {
          push(current);
        }
      }
    }
  }

  return tokens;
}

function formatNumber(amount: number): string {
  return String(Math.round(amount * 100) / 100);
}

function withAmount(name: string, amount: number | undefined): string {
  return amount == null ? name : `${formatNumber(amount)} ${name}`;
}

const UNIT_SUFFIXES: Record<ValueUnit, string> = {
  [ValueUnit.None]: '',
  [ValueUnit.Percent]: '%',
  [ValueUnit.Seconds]: 's',
  [ValueUnit.Multiplier]: '×',
};

function formatValue(current: ValueToken): string {
  return `${formatNumber(current.value)}${UNIT_SUFFIXES[current.unit]}`;
}

function formatToken(current: DescriptionToken): string {
  if (current.type === TokenType.Text) {
    return current.text;
  }
  if (current.type === TokenType.Value) {
    return formatValue(current);
  }
  if (current.type === TokenType.Energy) {
    return withAmount(ENERGY_NAMES[current.energy], current.value);
  }
  if (current.type === TokenType.Damage) {
    return withAmount(`${DAMAGE_TYPE_NAMES[current.damage]} damage`, current.value);
  }
  return withAmount(STAT_NAMES[current.stat], current.value);
}

/**
 * The description as plain text, for logs and tests.
 */
export function formatDescription(description: Description): string {
  return description.map((current) => formatToken(current)).join('');
}
