import type { Ability } from '../game/ability';
import badger from './badger';
import bat from './bat';
import beetle from './beetle';
import chameleon from './chameleon';
import cheetah from './cheetah';
import elephant from './elephant';
import hare from './hare';
import hawk from './hawk';
import hummingbird from './hummingbird';
import type AbilityId from './ids';
import jellyfish from './jellyfish';
import mantis from './mantis';
import octopus from './octopus';
import owl from './owl';
import rhino from './rhino';
import scorpion from './scorpion';
import snail from './snail';
import spider from './spider';
import termite from './termite';
import toad from './toad';
import turtle from './turtle';
import viper from './viper';
import vulture from './vulture';

const ABILITIES: Ability[] = [
  viper,
  scorpion,
  toad,
  spider,
  jellyfish,
  owl,
  octopus,
  chameleon,
  turtle,
  rhino,
  beetle,
  snail,
  vulture,
  termite,
  hummingbird,
  cheetah,
  hare,
  hawk,
  mantis,
  badger,
  elephant,
  bat,
];

const ABILITIES_BY_ID = new Map(ABILITIES.map((ability) => [ability.id, ability]));

export function getAbility(id: AbilityId): Ability {
  const ability = ABILITIES_BY_ID.get(id);
  if (!ability) {
    throw new Error(`Unknown ability: ${id}`);
  }
  return ability;
}

export default ABILITIES;
