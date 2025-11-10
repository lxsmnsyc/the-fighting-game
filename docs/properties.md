# Stats and energy

## Stats

- Health

## Energies

### Offensive

- Attack
  - Consumed by rate of Speed.
  - When consumed, deals `Physical` damage equal to the current Attack energy.
  - After consumption, lose 40% of the current Attack energy.
  - Empowered by `Corrosion`
  - Reduced by `Armor`
- Magic
  - When consumed, deals `Magical` damage equal to the current Magic energy.
  - After consumption, lose 40% of the current Magic energy.
  - Empowered by `Corrosion`
  - Reduced by `Armor`
- Poison
  - Consumes the current energy every second.
  - When consumed, deals `Poison` damage equal to the current Poison energy.
  - After consumption, lose 40% of the current Poison energy.

### Supportive

- Armor
  - Counteracts `Corrosion` (when receiving `Armor`, `Corrosion` energy decreases).
  - Reduces received damage from `Attack`, `Magical` and `Physical` by the current `Armor` energy.
  - When damage is reduced, consumes 40% of the current `Armor` energy.
- Corrosion
  - Counteracts `Armor` (when receiving `Corrosion`, `Armor` energy decreases).
  - Increases received damage from `Attack`, `Magical` and `Physical` by the current `Corrosion` energy.
  - When damage is increased, consumes 40% of the current `Corrosion` energy.
- Speed
  - Counteracts `Slow` (when receiving `Speed`, `Slow` energy decreases).
  - Defines the tick rate of periodic cards.
  - Defines the tick rate of `Attack` at a 0.25 to 2.5 second rate.
  - Maximum tick improvement achieved at 750 energy.
  - Consumes 40% of the current `Speed` energy per second.
- Slow
  - Counteracts `Slow` (when receiving `Speed`, `Slow` energy decreases).
  - Consumes 40% of the current `Slow` energy per second.
- Dodge
  - Causes `Attack` damage to miss by chance.
  - When damage is dodged, consumes 40% of the current `Dodge` energy.
  - Maximum dodge chance of 100% achieved at 750 energy.
- Critical
  - Multiplies `Attack` damage (default by 2) by chance.
  - When damage is multiplied, consumes 40% of the current `Critical` energy.
  - Maximum critical chance of 100% achieved at 750 energy.
- Healing
  - Heals per second at the amount equal to the current `Healing` energy.
  - When healing, consumes 40% of the current `Healing` energy.

## Damage types

- Physical
- Magical
- Poison
- Pure
- Health Loss
