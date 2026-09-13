/**
 * Every ability's fixed id. An id never changes or gets reused, even
 * when an ability is renamed, so anything saved keeps pointing at the
 * same ability.
 */
const enum AbilityId {
  Viper = 1,
  Scorpion = 2,
  Toad = 3,
  Spider = 4,
  Jellyfish = 5,
  Owl = 6,
  Octopus = 7,
  Chameleon = 8,
  Turtle = 9,
  Rhino = 10,
  Beetle = 11,
  Snail = 12,
  Vulture = 13,
  Termite = 14,
  Hummingbird = 15,
  Cheetah = 16,
  Hare = 17,
  Hawk = 18,
  Mantis = 19,
  Badger = 20,
  Elephant = 21,
  Bat = 22,
  // The same aspects as the abilities above, in reverse order
  Cobra = 23,
  Wasp = 24,
  Newt = 25,
  Stonefish = 26,
  Eel = 27,
  Raven = 28,
  Squid = 29,
  Moth = 30,
  Armadillo = 31,
  Crab = 32,
  Pangolin = 33,
  Porcupine = 34,
  Hyena = 35,
  Ant = 36,
  Otter = 37,
  Falcon = 38,
  Gazelle = 39,
  Tiger = 40,
  Fox = 41,
  Wolf = 42,
  Sloth = 43,
  Bear = 44,
}

export default AbilityId;
