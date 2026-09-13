# Abilities

An ability is a power the player picks for the whole run. It lives in
[src/abilities](../src/abilities), one file per ability.

## How abilities differ from cards

- An ability triggers on a cooldown instead of reacting to events.
- An ability combines two aspects, such as Poison and Speed.
- An ability is named after an animal, such as `Viper` or `Turtle`.
- An ability makes the shop favor cards that share its aspects.

## Getting abilities

- The run opens with a draft of 5 random abilities. The player picks one.
- Every `ABILITY_PHASE_INTERVAL` (8) phases, the player picks another from 5
  new offers. Abilities stack, and an owned ability is never offered again.
- A boss comes with as many abilities as the player is due at that phase.

## Cooldowns

- Each ability has a charge that fills with battle time while its unit stands.
- The ability triggers on the tick its charge reaches its cooldown. The charge
  then starts over.
- `CheckUnitAbilityCooldown` answers the cooldown. Speed shortens it by up to
  50% and Slow lengthens it by up to 50%, both at 1000.
- `unit.chargeAbility(ability, value)` adds charge. Charge past the cooldown is
  dropped.

Abilities only trigger from the tick, never while an effect resolves. So an
ability that charges another can never loop.

## Shop bias

A card starts at a weight of 1 in shop rolls. It gains `ABILITY_BIAS` (2) for
each aspect it shares with each owned ability. The weight picks a card within
its rarity, so abilities do not change how often each rarity shows up.

`CheckCardWeight` answers the weight, so other effects can change it too.

## Writing an ability

```ts
export default createAbility({
  id: AbilityId.Turtle,
  name: 'Turtle',
  image: '',
  aspects: [Aspect.Armor, Aspect.Healing],
  cooldown: 8000,
  description(): Description {
    return describe`Gain ${token.energy(Energy.Armor, 40)}, then heal ${token.stat(Stat.Health)} equal to your ${token.energy(Energy.Armor)}.`;
  },
  setup(context): Lifecycle {
    const { unit } = context;
    return onTriggerAbility(context, () => {
      unit.addEnergy(Energy.Armor, 40, false);
      unit.heal(unit, unit.getTotalEnergy(Energy.Armor), 0);
    });
  },
});
```

The helpers in [src/abilities/effects.ts](../src/abilities/effects.ts):

- `onTriggerAbility` runs the effect against the enemy when the ability
  triggers.
- `measureDamage` reports the damage an action deals, and whether any of it was
  critical.
- `withCertainCritical` makes the first attack of an action a critical hit.
- `createWindow` opens a span of battle time, counted on ticks.

## List

| Name        | Aspects           | Cooldown | Effect                                                                  |
| ----------- | ----------------- | -------- | ----------------------------------------------------------------------- |
| Viper       | Poison, Speed     | 4s       | Gains Speed, then poisons the enemy by half its Speed.                  |
| Scorpion    | Poison, Critical  | 6s       | Attacks. A critical hit also poisons by the damage dealt.               |
| Toad        | Poison, Healing   | 7s       | Passes its own Poison to the enemy and gains Healing from it.           |
| Spider      | Slow, Poison      | 6s       | Slows the enemy, then poisons it by its Slow.                           |
| Jellyfish   | Magic, Corrosion  | 5s       | Gains Magic, corrodes the enemy by its Magic, then triggers Magic.      |
| Owl         | Magic, Critical   | 5s       | Triggers Magic without spending it, and gains Critical from the damage. |
| Octopus     | Magic, Slow       | 6s       | Slows the enemy, then deals Magical damage by Magic plus its Slow.      |
| Chameleon   | Dodge, Magic      | 6s       | Gains Dodge. For 3s, each dodge triggers Magic.                         |
| Turtle      | Armor, Healing    | 8s       | Gains Armor, then heals by its Armor.                                   |
| Rhino       | Armor, Attack     | 7s       | Attacks for Attack plus Armor.                                          |
| Beetle      | Armor, Corrosion  | 6s       | Takes the enemy's Armor, then corrodes it.                              |
| Snail       | Slow, Armor       | 8s       | Slows the enemy, then gains Armor by its Slow.                          |
| Vulture     | Corrosion, Health | 9s       | Deals Pure damage by the enemy's missing Health and Corrosion.          |
| Termite     | Corrosion, Attack | 5s       | Corrodes the enemy, then attacks.                                       |
| Hummingbird | Speed, Healing    | 3s       | Gains Speed, then heals by its Speed.                                   |
| Cheetah     | Speed, Critical   | 8s       | For 3s, gains permanent Speed by its Critical.                          |
| Hare        | Speed, Dodge      | 5s       | Gains Speed and Dodge, and charges the other abilities by 1s.           |
| Hawk        | Critical, Attack  | 6s       | Attacks with a certain critical hit.                                    |
| Mantis      | Critical, Dodge   | 7s       | Gains Dodge. For 3s, strikes back at dodged natural attacks.            |
| Badger      | Attack, Health    | 6s       | Attacks harder the more Health it is missing.                           |
| Elephant    | Health, Slow      | 12s      | Gains Max Health, then slows the enemy by its Max Health.               |
| Bat         | Attack, Healing   | 6s       | Attacks, then heals by half the damage dealt.                           |
