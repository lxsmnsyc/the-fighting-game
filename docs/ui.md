# UI

The UI is Solid with Tailwind CSS, in [src/ui](../src/ui). Run it with
`pnpm dev`. Add `?seed=` to the URL to skip the menu and replay a Standard run.

## Menus

The game opens on the main menu:

- Start sets up a run. The player picks a game mode, then a random seed or
  their own. The same seed and mode always deal the same shops, drafts and
  opponents.
- Options holds the settings. They are kept in local storage.

| Option           | Effect                                                             |
| ---------------- | ------------------------------------------------------------------ |
| Shake            | Cards and abilities shake when they trigger.                       |
| Projectiles      | Damage and energy fly across the screen in battle.                 |
| Battle countdown | Battles count down 3 seconds before they begin, from the next run. |

When a run ends, the player can start a new run in the same mode, retry the
same seed, or go back to the main menu. The end screen shows the seed.

The browser tests in [e2e](../e2e) drive the real game with Playwright. Run
them with `pnpm test:e2e`.

## Layout

The screen has three rows:

- The top row holds the ability offers in a draft, the shop's offers, or the
  enemy's cards in battle.
- The middle row holds the draft or shop controls, or the health strip in
  battle.
- The bottom row holds the player's cards.

A card row never grows past the screen. The more cards it holds, the more they
overlap.

Tooltips render over the whole page, so no row clips them. Each opens on its
preferred side of what it describes, flips to the other side when only that one
fits, and is kept inside the viewport.

In the draft, the middle row shows the phase, round and lives on the left, a
prompt in the middle, and the abilities already owned on the right. Clicking an
offer picks it.

In the shop, the middle row shows the phase, round and lives on the left, the
reroll button, gold, card slots and start button in the middle, and the last
battle's result and the owned abilities on the right. Clicking a card in the
deck sells it, and offers cannot be bought while the deck is full.

In battle, the middle row is one health strip. The left half is the player and
the right half is the enemy. The timer sits in the middle. It counts down 3
seconds before the battle starts, then counts down the time limit. Each side
shows its abilities, then its energies as icons. Hovering one shows what it
does. A ring around each ability fills as its cooldown charges.

When a battle ends, its summary opens over the battle. It shows the result, the
gold earned, the lives left, how long the fight lasted, and each side's damage,
healing, attacks, critical hits, dodges and triggers. Continue opens the next
shop, or the run over screen after the last life.

## Effects

- A hovered card rises toward the middle row and shows a tooltip with its
  description, its rarity and its prints.
- A hovered ability offer rises and shows its description, cooldown and the
  aspects it favors.
- A card or ability that triggers shakes with a spring.
- Damage flies as a dot from the dealer's card row to the target's health, in
  the color of its damage type.
- Energy a card hands out flies as a dot from that card to the receiver's icon
  for that energy, in the energy's color. Energy counts as the card's when it is
  gained while the card's trigger resolves.
- A projectile flies in a gentle arc that bends to a random side.

## State

The game and the battle are mutable and emit events.
[src/ui/state.ts](../src/ui/state.ts) turns those events into Solid signals:

- `createGameVersion` changes whenever the run changes.
- `createBattleView` changes on every battle tick, and also tracks card
  triggers and projectiles.

Components read a signal, then read the game state they need.
