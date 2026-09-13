# Battle engine

A battle is one event bus ([src/battle/core.ts](../src/battle/core.ts)).
Every mechanic and card registers listeners on it. Nothing changes unit state
directly: unit methods emit events, and mechanics apply them.

## The field

- A `Battle` holds alliances.
- An `Alliance` is a side. Its teams fight together.
- A `Team` is what one `Player` brings. It holds units.
- A `Unit` is a fighter. It holds stats, energy, cards and abilities.

The battle ends once one alliance or none has units standing. The outcome is
checked after each tick.

```ts
const battle = createBattle('seed');

const allies = new Alliance(battle);
battle.addAlliance(allies);
const unit = fieldPlayer(battle, allies, player);

battle.start();
battle.tick(1000 / 60);
```

`createBattle(seed, { realtime: true })` drives the battle from animation
frames. Tests and replays leave it off and call `tick` themselves.

## Events

- `Check*` events are questions. Listeners write the answer into a field, such
  as `CheckUnitEnemy.target` or `CheckUnitEnergyPeriod.duration`.
- `Unit*`, `Team*` and `Alliance*` events are things that happen.
- A listener stops an event by setting `disabled`.

Each event has a priority scale:

- `EventPriority`: `Pre`, `Exact`, `Post`. `Exact` is the mechanic's own
  answer.
- `ValuePriority`: the base value on `Initial`, then `Additive` and
  `Multiplicative` modifiers, then `Pre`, `Exact`, `Post`.
- `DamagePriority`: one step per energy that changes damage, before it lands on
  `Exact`.

## Energy

The shared rules live in
[src/battle/mechanics/energy.ts](../src/battle/mechanics/energy.ts):

- Gaining Armor, Corrosion, Speed or Slow first removes consumable energy of
  its pair.
- `UnitTriggerEnergy` makes an energy take effect, then consumes 40% of it
  unless `NoConsume` is set.
- Each energy triggers on its own period, answered by `CheckUnitEnergyPeriod`.
  Energies with no period, such as Magic, never trigger on their own.

## Cards

A card's `setup` registers its listeners for one unit and returns a
`Lifecycle`. The card mechanics start it when the unit gets the card and stop
it while the card is disabled.

`unit.triggerCard(card, target, value)` is the card's visible trigger:

- A card whose effect leaves the triggering event alone applies it on
  `UnitTriggerCard` at `Exact`.
- A card that changes the triggering event checks the return value of
  `triggerCard` and applies the change inline.

A card cannot trigger from anything its own trigger sets off. While a trigger
resolves, its card id sits in `battle.triggeringCards`, and `triggerCard`
refuses any card already there. This holds through any chain of events and
other cards, and for copies of the same card. An effect that emits events must
therefore run on `UnitTriggerCard`, where the rule can see it.

## Abilities

An ability's `setup` works like a card's. The ability mechanics in
[src/battle/mechanics/ability.ts](../src/battle/mechanics/ability.ts) charge
each ability on every tick and emit `UnitTriggerAbility` once it is full. The
effect runs on that event at `Exact`. See [abilities.md](abilities.md).
