# Cards

## Ids and names

- Every card has a fixed id in [src/cards/ids.ts](../src/cards/ids.ts). An id
  is never changed or reused.
- Every card has a unique name of one word. The name is a verb or an adjective
  that says what the card does, such as `Guarded` or `Vampiric`.

## Descriptions

`card.description()` returns a list of tokens instead of a string, so a UI can
highlight the parts that matter:

- Text
- Raw values, such as a chance, a duration or a multiplier
- Energies, with an optional amount
- Damage, carrying its damage type for coloring
- Stats, with an optional amount

Descriptions are built with the `describe` template tag:

```ts
describe`When attacking, ${token.percent(0.25)} chance to gain ${token.energy(Energy.Armor, 20)}.`;
```

`card.description(print)` takes the print of the copy it describes. Values the
print changes in battle are shown changed: a Monotone print doubles them, and an
Error print shows the range they roll in, such as `15–25 Armor`. Pass 0 for a
card with no print, such as a shop offer.

## Rarity

- Common: Each Common card has 5 copies that can be bought.
- Uncommon: Unlocked after acquiring 10 Common cards. Each Uncommon card has 3 copies that can be bought.
- Rare: Unlocked after acquiring 10 Uncommon cards. Each Rare card only has one copy.
- Secret: Unlocked after acquiring all of the Rare cards in a given aspect. Each
  energy has one secret card. Whenever another of the player's cards of that
  energy's aspect triggers, the secret triggers too and the card's trigger runs
  once more.

## Prints

Cards can have an effect multiplier called prints. Each prints increases the multiplier by 1 and energies on one another, giving a maximum multiplier of 5.

- Error: values roll between 75% and 125% on every use.
- Monotone: values are doubled.
- Negative: the copy does not count toward the card's copy limit. The shop rolls
  an offer's print before its card, so a card at its limit can still be offered
  as a Negative copy.

Cards only ever provide consumable energy. Energy gained while a card trigger
resolves is consumable, even when permanent energy was asked for.

## Editions

Cards can also have editions, each editions giving an specific effect to the card.
