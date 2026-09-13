# RNG

A run is deterministic. The same seed and the same choices play out the same
way. Every RNG is an Alea instance.

## Seed tree

- **World** is the run seed.
  - **Round `n`** is derived from the seed and the round number only.
    - **Shop** rolls the offers when the shop opens and on each reroll. It
      also rolls the print of each card bought.
    - **Battle** rolls the opponent, then seeds the battle.
      - **Unit** gets one RNG per unit, for chance-based effects such as Dodge
        and Critical.

Round numbers count across the whole run, so round 4 is the first round of
phase 2.

## Resuming

A round depends only on the seed and its number. So a run resumes at the start
of any round from a save of:

- The seed.
- The round number.
- Lives and gold.
- The cards: id, edition, print and whether each is disabled.

The shop and the opponent are rolled again and come out the same. See
`saveGame` and `resumeGame` in [src/game/save.ts](../src/game/save.ts).

Cards and players hold no RNG. A card's print is rolled once when it is
created, so its saved fields restore it exactly.

An Error print rolls its value on every use in battle. The roll comes from the
unit's RNG, so it stays random but a replayed round rolls the same.
