# Game flow

A run is one game, from a random seed until the player runs out of lives. It
lives in [src/game/game.ts](../src/game/game.ts) and, like a battle, every rule
is a listener on its event bus.

```ts
const game = createGame(); // or createGame(seed)
game.start(); // opens the first ability draft

game.pickAbility(0); // opens the shop
game.rerollShop();
game.buyCard(0);
game.startBattle();
game.continueRun(); // once the battle ends, leaves its summary
```

## Structure

- A run is endless. It only ends when the last life is lost.
- A phase has `ROUNDS_PER_PHASE` (3) rounds. The last round of each phase is a
  boss fight.
- A round has two stages: the shop, then the battle. Some rounds open with an
  ability draft first.
- `game.round` counts rounds across the whole run. `getPhase()` and
  `getPhaseRound()` place it within a phase.
- The player starts with 3 lives and 5 gold.

## Rounds

1. If the player is due an ability, the draft opens with 5 offers and the player
   picks one.
2. The shop opens with 5 offers.
3. The player buys cards, rerolls, or starts the battle.
4. The battle ends and the player earns gold. Income rises with the phase.
5. The battle summary opens. `game.summary` holds the result, the gold earned,
   the lives lost, how long the fight lasted and what each side did.
6. The player calls `game.continueRun()`. The result decides what comes next:
   - A win or a draw moves to the next round.
   - A loss costs a life and replays the same round. The replay rolls a new
     shop, but meets the same opponent.
   - Losing the last life ends the run.

A battle that runs past `BATTLE_TIME_LIMIT` (60 seconds) is a draw.

## Abilities

- The player is due one ability from the start, and one more every
  `ABILITY_PHASE_INTERVAL` (8) phases.
- What the player is due is checked against what they own. So a replayed or
  resumed round only opens a draft if its ability was never picked.

See [abilities.md](abilities.md) for how abilities work.

## Shop

- The player can hold `BASE_CARD_SLOTS` (5) cards, plus `PHASE_CARD_SLOTS` (2)
  for each phase beaten. `CheckCardSlots` answers it. The shop does not sell a
  card into a full deck, so the player sells a card to make room.
- Rerolling costs 1 gold, and 1 more for each reroll in the same visit.
- A card costs gold by rarity. Selling it refunds half.
- Offers roll a rarity by weight, then a card of that rarity by weight. Later
  phases lean toward rarer cards.
- Cards that share aspects with the player's abilities weigh more.
- The player can own a limited number of copies of each card: 5 per common, 3
  per uncommon, and 1 per rare or secret.
- Rarities unlock in order, and the shop only rolls unlocked cards. Picking an
  ability unlocks Common cards. Acquiring `RARITY_UNLOCK_COUNT` (10) cards of a
  rarity unlocks the next one, up to Rare. See [cards.md](cards.md#rarity).
- A secret card stays locked until the player owns every rare card of its first
  aspect.

## Opponents

Each round's opponent is rolled from that round's battle RNG, so a replayed or
resumed round meets the same opponent.

- It picks a pair of aspects.
- It buys cards like a player. Its budget is all the gold a player could have by
  that round: the starting gold plus every earlier round's income. So it keeps up
  with the run.
- It keeps to the same card slots and copy limits as the player.
- It fills its slots with cards it can afford, cards of its aspects first. Then
  it spends what is left swapping its cheapest card for a pricier one, until no
  swap fits the budget.
- A boss spends `BOSS_BUDGET_MULTIPLIER` (1.5) times the budget and gets as many
  abilities as the player is due. Its first ability decides its aspects, and all
  of them bias its cards.

## Modes

A mode changes the rules of a run. Each mode is a file in
[src/game/modes](../src/game/modes) that listens to game events, like cards do.
`createGame(seed, { mode })` picks the mode, and a save keeps it.

| Mode        | Rules                                            |
| ----------- | ------------------------------------------------ |
| Standard    | The rules as they are.                           |
| Hardcore    | The run starts with 1 life.                      |
| Chaos       | Prints are 3 times as likely, for opponents too. |
| Beastmaster | An ability draft every 2 phases. Bosses keep up. |
| Gambler     | Rerolls are free. Every card costs 2 more gold.  |

Modes change the rules through these checks:

- `CheckMaxLife` answers the lives a run starts with.
- `CheckAbilityInterval` answers the phases between ability drafts.
- `CheckPrintChance` answers how likely a print is on a card the player or an
  opponent gets.
- `CheckRerollCost` and `CheckCardPrice` answer what the shop charges.

## Saving

`saveGame(game)` keeps what a round cannot roll again: the seed, the round,
lives, gold, the cards and the abilities. `resumeGame(save)` restores the run at
the start of that round. Take the save when a round starts. See
[rng.md](rng.md) for why that is enough.
