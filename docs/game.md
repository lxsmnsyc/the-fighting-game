# Game flow

A run is one game, from a random seed until it is won or lost. It lives in
[src/game/game.ts](../src/game/game.ts) and, like a battle, every rule is a
listener on its event bus.

```ts
const game = createGame(); // or createGame(seed)
game.start(); // opens the first shop

game.rerollShop();
game.buyCard(0);
game.startBattle();
```

## Structure

- A run has `PHASES` (8) phases.
- A phase has `ROUNDS_PER_PHASE` (3) rounds. The last round of each phase is a
  boss fight.
- A round has two stages: the shop, then the battle.
- `game.round` counts rounds across the whole run. `getPhase()` and
  `getPhaseRound()` place it within a phase.
- The player starts with 3 lives and 5 gold.

## Rounds

1. The shop opens with 5 offers.
2. The player buys cards, rerolls, or starts the battle.
3. The battle ends and the player earns gold. Income rises with the phase.
4. The result decides what comes next:
   - A win or a draw moves to the next round.
   - A loss costs a life and replays the same round.
   - Losing the last life ends the run.
   - Clearing the boss round of the last phase wins the run.

A battle that runs past `BATTLE_TIME_LIMIT` (60 seconds) is a draw.

## Shop

- Rerolling costs 1 gold, and 1 more for each reroll in the same visit.
- A card costs gold by rarity. Selling it refunds half.
- Offers are rolled by rarity weight. Later phases lean toward rarer cards.
- The player can own a limited number of copies of each card: 1 per starter, 5
  per common, 3 per uncommon, and 1 per rare or secret.
- A secret card stays locked until the player owns every rare card of its first
  aspect.

## Opponents

Each round's opponent is rolled from that round's battle RNG, so a replayed or
resumed round meets the same opponent.

- It picks a pair of aspects and draws cards from them.
- Its card count grows with the phase and the round.
- A boss gets 2 more cards.

## Saving

`saveGame(game)` keeps what a round cannot roll again: the seed, the round,
lives, gold and the cards. `resumeGame(save)` restores the run at the start of
that round. Take the save when a round starts. See [rng.md](rng.md) for why
that is enough.
