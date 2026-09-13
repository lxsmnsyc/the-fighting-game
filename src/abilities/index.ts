import type { Ability } from '../game/ability';
import ant from './ant';
import armadillo from './armadillo';
import badger from './badger';
import bat from './bat';
import bear from './bear';
import beetle from './beetle';
import chameleon from './chameleon';
import cheetah from './cheetah';
import cobra from './cobra';
import crab from './crab';
import eel from './eel';
import elephant from './elephant';
import falcon from './falcon';
import fox from './fox';
import gazelle from './gazelle';
import hare from './hare';
import hawk from './hawk';
import hummingbird from './hummingbird';
import hyena from './hyena';
import type AbilityId from './ids';
import jellyfish from './jellyfish';
import mantis from './mantis';
import moth from './moth';
import newt from './newt';
import octopus from './octopus';
import otter from './otter';
import owl from './owl';
import pangolin from './pangolin';
import porcupine from './porcupine';
import raven from './raven';
import rhino from './rhino';
import scorpion from './scorpion';
import sloth from './sloth';
import snail from './snail';
import spider from './spider';
import squid from './squid';
import stonefish from './stonefish';
import termite from './termite';
import tiger from './tiger';
import toad from './toad';
import turtle from './turtle';
import viper from './viper';
import vulture from './vulture';
import wasp from './wasp';
import wolf from './wolf';

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
  cobra,
  wasp,
  newt,
  stonefish,
  eel,
  raven,
  squid,
  moth,
  armadillo,
  crab,
  pangolin,
  porcupine,
  hyena,
  ant,
  otter,
  falcon,
  gazelle,
  tiger,
  fox,
  wolf,
  sloth,
  bear,
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
