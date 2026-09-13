# UI

The UI is Solid with Tailwind CSS, in [src/ui](../src/ui). Run it with
`pnpm dev`. Add `?seed=` to the URL to replay a run.

The browser tests in [e2e](../e2e) drive the real game with Playwright. Run
them with `pnpm test:e2e`.

## Layout

The screen has three rows:

- The top row holds the ability offers in a draft, the shop's offers, or the
  enemy's cards in battle.
- The middle row holds the draft or shop controls, or the health strip in
  battle.
- The bottom row holds the player's cards.

In the draft, the middle row shows the phase, round and lives on the left, a
prompt in the middle, and the abilities already owned on the right. Clicking an
offer picks it.

In the shop, the middle row shows the phase, round and lives on the left, the
reroll button, gold and start button in the middle, and the last battle's result
and the owned abilities on the right.

In battle, the middle row is one health strip. The left half is the player and
the right half is the enemy. The timer sits in the middle. It counts down 3
seconds before the battle starts, then counts down the time limit. Each side
shows its abilities, then its energies as icons. Hovering one shows what it
does. A ring around each ability fills as its cooldown charges.

## Effects

- A hovered card rises toward the middle row and shows a tooltip with its
  description, its rarity and its prints.
- A hovered ability offer rises and shows its description, cooldown and the
  aspects it favors.
- A card or ability that triggers shakes with a spring.
- Damage flies as a dot from the dealer's card row to the target's health, in
  the color of its damage type.

## State

The game and the battle are mutable and emit events.
[src/ui/state.ts](../src/ui/state.ts) turns those events into Solid signals:

- `createGameVersion` changes whenever the run changes.
- `createBattleView` changes on every battle tick, and also tracks card
  triggers and projectiles.

Components read a signal, then read the game state they need.
