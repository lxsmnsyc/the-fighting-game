import Alliance from '../battle/alliance';
import type Battle from '../battle/core';
import createBattle, { type BattleOptions } from '../battle/setup';
import Team from '../battle/team';
import Unit from '../battle/unit';
import type { Player } from './player';

/**
 * Puts a player's team on an alliance, with one unit holding the
 * player's deck and abilities.
 */
export function fieldPlayer(battle: Battle, alliance: Alliance, player: Player): Unit {
  const team = new Team(battle, alliance, player);
  alliance.addTeam(team);

  const unit = new Unit(battle, team);
  team.addUnit(unit);

  for (const card of player.deck) {
    unit.addCard(card);
    if (card.disabled) {
      unit.disableCard(card);
    }
  }

  for (const ability of player.abilities) {
    unit.addAbility(ability);
  }

  return unit;
}

/**
 * A battle of the player's alliance against an alliance of enemies.
 * Each enemy fields their own team.
 */
export default function createRound(
  seed: string,
  player: Player,
  enemies: Player[],
  options?: BattleOptions,
): Battle {
  const battle = createBattle(seed, options);

  const allies = new Alliance(battle);
  battle.addAlliance(allies);
  fieldPlayer(battle, allies, player);

  const opponents = new Alliance(battle);
  battle.addAlliance(opponents);
  for (const enemy of enemies) {
    fieldPlayer(battle, opponents, enemy);
  }

  return battle;
}
