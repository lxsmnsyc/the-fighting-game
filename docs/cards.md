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

## Rarity

- Common: Each Common card has 5 copies that can be bought.
- Uncommon: Unlocked after acquiring 10 Common cards. Each Uncommon card has 3 copies that can be bought.
- Rare: Unlocked after acquiring 10 Uncommon cards. Each Rare card only has one copy.
- Secret: Unlocked after acquiring all of the Rare cards in a given aspect.

## Prints

Cards can have an effect multiplier called prints. Each prints increases the multiplier by 1 and energies on one another, giving a maximum multiplier of 5.

- Negative
- Error
- Monotone

## Editions

Cards can also have editions, each editions giving an specific effect to the card.
