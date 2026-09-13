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
 * A value that may vary, such as a card value under an Error print.
 */
export interface ValueRange {
  min: number;
  max: number;
}

/**
 * A single value, or a range of them.
 */
export type Amount = number | ValueRange;

/**
 * A raw number from the card's effect, such as a chance or a duration.
 * `max` is set when the number is a range, with `value` as its low end.
 */
export interface ValueToken {
  type: TokenType.Value;
  value: number;
  max?: number;
  unit: ValueUnit;
}

export interface EnergyToken {
  type: TokenType.Energy;
  energy: Energy;
  value?: number;
  max?: number;
}

/**
 * Carries the damage type so a UI can color it.
 */
export interface DamageToken {
  type: TokenType.Damage;
  damage: DamageType;
  value?: number;
  max?: number;
}

export interface StatToken {
  type: TokenType.Stat;
  stat: Stat;
  value?: number;
  max?: number;
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

// A range whose ends match is a single value
function splitAmount(amount: Amount | undefined): { value?: number; max?: number } {
  if (amount == null || typeof amount === 'number') {
    return { value: amount };
  }
  return amount.min === amount.max ? { value: amount.min } : { value: amount.min, max: amount.max };
}

function mapAmount(amount: Amount, map: (current: number) => number): Amount {
  return typeof amount === 'number' ? map(amount) : { min: map(amount.min), max: map(amount.max) };
}

function value(amount: Amount, unit = ValueUnit.None): ValueToken {
  const { value: low = 0, max } = splitAmount(amount);
  return { type: TokenType.Value, value: low, max, unit };
}

// Takes a ratio, so 0.25 reads as 25%
function percent(ratio: Amount): ValueToken {
  return value(
    mapAmount(ratio, (current) => Math.round(current * 10000) / 100),
    ValueUnit.Percent,
  );
}

// Takes milliseconds, like the rest of the engine
function seconds(duration: Amount): ValueToken {
  return value(
    mapAmount(duration, (current) => current / 1000),
    ValueUnit.Seconds,
  );
}

function multiplier(amount: Amount): ValueToken {
  return value(amount, ValueUnit.Multiplier);
}

function energy(type: Energy, amount?: Amount): EnergyToken {
  return { type: TokenType.Energy, energy: type, ...splitAmount(amount) };
}

function damage(type: DamageType, amount?: Amount): DamageToken {
  return { type: TokenType.Damage, damage: type, ...splitAmount(amount) };
}

function stat(type: Stat, amount?: Amount): StatToken {
  return { type: TokenType.Stat, stat: type, ...splitAmount(amount) };
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

// "15" or "15–25"
function formatAmount(low: number, max: number | undefined): string {
  return max == null ? formatNumber(low) : `${formatNumber(low)}–${formatNumber(max)}`;
}

function withAmount(name: string, low: number | undefined, max: number | undefined): string {
  return low == null ? name : `${formatAmount(low, max)} ${name}`;
}

const UNIT_SUFFIXES: Record<ValueUnit, string> = {
  [ValueUnit.None]: '',
  [ValueUnit.Percent]: '%',
  [ValueUnit.Seconds]: 's',
  [ValueUnit.Multiplier]: '×',
};

function formatValue(current: ValueToken): string {
  return `${formatAmount(current.value, current.max)}${UNIT_SUFFIXES[current.unit]}`;
}

export function formatToken(current: DescriptionToken): string {
  if (current.type === TokenType.Text) {
    return current.text;
  }
  if (current.type === TokenType.Value) {
    return formatValue(current);
  }
  if (current.type === TokenType.Energy) {
    return withAmount(ENERGY_NAMES[current.energy], current.value, current.max);
  }
  if (current.type === TokenType.Damage) {
    return withAmount(`${DAMAGE_TYPE_NAMES[current.damage]} damage`, current.value, current.max);
  }
  return withAmount(STAT_NAMES[current.stat], current.value, current.max);
}

/**
 * The description as plain text, for logs and tests.
 */
export function formatDescription(description: Description): string {
  return description.map((current) => formatToken(current)).join('');
}
