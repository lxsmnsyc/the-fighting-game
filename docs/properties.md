# Stats and stacks

## Stats

- Health

## Stacks

### Offensive

- Attack
  - Consumed by rate of Speed.
  - When consumed, deals `Attack` damage equal to the current Attack stacks.
  - After consumption, lose 40% of the current Attack stacks.
  - Empowered by `Corrosion`
  - Reduced by `Armor`
  - Dodged by `Dodge` (upon Attack)
- Magic
  - When consumed, deals `Magical` damage equal to the current Magic stacks.
  - After consumption, lose 40% of the current Magic stacks.
  - Empowered by `Corrosion`
  - Reduced by `Armor`
- Poison
  - Consumes the current stack every second.
  - When consumed, deals `Poison` damage equal to the current Poison stacks.
  - After consumption, lose 40% of the current Poison stacks.

### Supportive

- Armor
  - Counteracts `Corrosion` (when receiving `Armor`, `Corrosion` stack decreases).
  - Reduces received damage from `Attack`, `Magical` and `Physical` by the current `Armor` stacks.
  - When damage is reduced, consumes 40% of the current `Armor` stacks.
- Corrosion
  - Counteracts `Armor` (when receiving `Corrosion`, `Armor` stack decreases).
  - Increases received damage from `Attack`, `Magical` and `Physical` by the current `Corrosion` stacks.
  - When damage is increased, consumes 40% of the current `Corrosion` stacks.
- Speed
  - Counteracts `Slow` (when receiving `Speed`, `Slow` stack decreases).
  - Defines the tick rate of periodic cards.
  - Defines the tick rate of `Attack` at a 0.25 to 2.5 second rate.
  - Maximum tick improvement achieved at 750 stacks.
- Slow
  - Counteracts `Slow` (when receiving `Speed`, `Slow` stack decreases).
- Dodge
  - Causes `Attack` damage to miss by chance.
  - When damage is dodged, consumes 40% of the current `Dodge` stacks.
  - Maximum dodge chance of 100% achieved at 750 stacks.
- Critical
  - Multiplies `Attack` damage (default by 2) by chance.
  - When damage is multiplied, consumes 40% of the current `Critical` stacks.
  - Maximum critical chance of 100% achieved at 750 stacks.
- Healing
  - Heals per second at the amount equal to the current `Healing` stacks.
  - When healing, consumes 40% of the current `Healing` stacks.

## Damage types

- Attack
- Physical
- Magical
- Poison
- Pure
