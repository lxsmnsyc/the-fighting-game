# Abilities

An ability is a power the player picks for the whole run. It lives in
[src/abilities](../src/abilities), one file per ability.

## How abilities differ from cards

- An ability triggers on a cooldown instead of reacting to events.
- An ability combines two aspects, such as Speed and Poison.
- An ability is named after an animal, such as `Viper` or `Turtle`.
- An ability makes the shop favor cards that share its aspects.

## Aspect order

The order of an ability's aspects matters. No two abilities share the same
ordered pair, so Armor and Attack is a different ability from Attack and Armor.

- The first aspect is what the ability draws on.
- The second aspect is what the ability produces.

For example, Rhino (Armor, Attack) attacks harder with Armor. Crab (Attack,
Armor) gains Armor from Attack.

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

| Name        | Aspects           | Cooldown | Effect                                                                        |
| ----------- | ----------------- | -------- | ----------------------------------------------------------------------------- |
| Viper       | Speed, Poison     | 4s       | Gains Speed, then poisons the enemy by half its Speed.                        |
| Scorpion    | Critical, Poison  | 6s       | Attacks. A critical hit also poisons by the damage dealt.                     |
| Toad        | Poison, Healing   | 7s       | Passes its own Poison to the enemy and gains Healing from it.                 |
| Spider      | Slow, Poison      | 6s       | Slows the enemy, then poisons it by its Slow.                                 |
| Jellyfish   | Magic, Corrosion  | 5s       | Gains Magic, corrodes the enemy by its Magic, then triggers Magic.            |
| Owl         | Magic, Critical   | 5s       | Triggers Magic without spending it, and gains Critical from the damage.       |
| Octopus     | Slow, Magic       | 6s       | Slows the enemy, then deals Magical damage by Magic plus its Slow.            |
| Chameleon   | Dodge, Magic      | 6s       | Gains Dodge. For 3s, each dodge triggers Magic.                               |
| Turtle      | Armor, Healing    | 8s       | Gains Armor, then heals by its Armor.                                         |
| Rhino       | Armor, Attack     | 7s       | Attacks for Attack plus Armor.                                                |
| Beetle      | Armor, Corrosion  | 6s       | Takes the enemy's Armor, then corrodes it.                                    |
| Snail       | Slow, Armor       | 8s       | Slows the enemy, then gains Armor by its Slow.                                |
| Vulture     | Corrosion, Health | 9s       | Deals Pure damage by the enemy's missing Health and Corrosion.                |
| Termite     | Corrosion, Attack | 5s       | Corrodes the enemy, then attacks.                                             |
| Hummingbird | Speed, Healing    | 3s       | Gains Speed, then heals by its Speed.                                         |
| Cheetah     | Critical, Speed   | 8s       | For 3s, gains permanent Speed by its Critical.                                |
| Hare        | Speed, Dodge      | 5s       | Gains Speed and Dodge, and charges the other abilities by 1s.                 |
| Hawk        | Critical, Attack  | 6s       | Attacks with a certain critical hit.                                          |
| Mantis      | Dodge, Critical   | 7s       | Gains Dodge. For 3s, strikes back at dodged natural attacks.                  |
| Badger      | Health, Attack    | 6s       | Attacks harder the more Health it is missing.                                 |
| Elephant    | Health, Slow      | 12s      | Gains Max Health, then slows the enemy by its Max Health.                     |
| Bat         | Attack, Healing   | 6s       | Attacks, then heals by half the damage dealt.                                 |
| Cobra       | Poison, Speed     | 5s       | Gains Speed by the enemy's Poison.                                            |
| Wasp        | Poison, Critical  | 6s       | Gains Critical by the enemy's Poison, then attacks.                           |
| Newt        | Healing, Poison   | 6s       | Poisons the enemy by its Healing.                                             |
| Stonefish   | Poison, Slow      | 6s       | Triggers the enemy's Poison without spending it, then slows it by its Poison. |
| Eel         | Corrosion, Magic  | 5s       | Gains Magic by the enemy's Corrosion, then triggers Magic.                    |
| Raven       | Critical, Magic   | 6s       | Gains Magic by its Critical, then triggers Magic without spending it.         |
| Squid       | Magic, Slow       | 6s       | Triggers Magic, then slows the enemy by the damage dealt.                     |
| Moth        | Magic, Dodge      | 7s       | Triggers Magic. For 4s, gains Dodge by half its Magical damage.               |
| Armadillo   | Healing, Armor    | 7s       | Spends its Healing and gains twice as much Armor.                             |
| Crab        | Attack, Armor     | 6s       | Gains Armor by twice its Attack.                                              |
| Pangolin    | Corrosion, Armor  | 6s       | Corrodes the enemy, then gains Armor by its Corrosion.                        |
| Porcupine   | Armor, Slow       | 7s       | Gains Armor. For 4s, slows anyone whose damage its Armor blocks.              |
| Hyena       | Health, Corrosion | 8s       | Loses 5% Max Health, then corrodes the enemy by twice the Health lost.        |
| Ant         | Attack, Corrosion | 7s       | Gains Attack. For 4s, its attacks corrode by half the damage dealt.           |
| Otter       | Healing, Speed    | 4s       | Gains Speed by its Healing.                                                   |
| Falcon      | Speed, Critical   | 8s       | For 3s, gains permanent Critical by its Speed.                                |
| Gazelle     | Dodge, Speed      | 6s       | Gains Dodge. For 3s, each dodge gains Speed and charges the other abilities.  |
| Tiger       | Attack, Critical  | 6s       | Gains Critical by three times its Attack, then attacks.                       |
| Fox         | Critical, Dodge   | 6s       | Attacks. A critical hit also gains Dodge by the damage dealt.                 |
| Wolf        | Attack, Health    | 8s       | Attacks, then gains Max Health by the damage dealt.                           |
| Sloth       | Slow, Health      | 10s      | Slows the enemy, then gains Max Health by its Slow.                           |
| Bear        | Healing, Attack   | 7s       | Triggers Healing without spending it, then attacks for Attack plus Healing.   |
