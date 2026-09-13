/**
 * Every game mode's fixed id. Saves keep it, so an id never changes or
 * gets reused.
 */
const enum GameModeId {
  Standard = 1,
  Hardcore = 2,
  Chaos = 3,
  Beastmaster = 4,
  Gambler = 5,
}

export default GameModeId;
