export const DEFAULT_HEALTH = 1000;

export const DEFAULT_MANA_POOL = 100;

export const enum DamageType {
	Magic = 1,
	Attack = 2,

	// Can trigger some damage events
	Pure = 3,

	// Does not trigger normal damage events
	Loss = 4,
}

export class Player {
	private maxHealth = DEFAULT_HEALTH;

	private maxMana = DEFAULT_MANA_POOL;

	// Statuses
	private currentHealth = DEFAULT_HEALTH;

	private currentMana = 0;

	private currentAttackDamage = 0;

	private currentMagicDamage = 0;

	private currentCritChance = 0;

	private currentCritMultiplier = 0;

	private currentDodgeChance = 0;

	private currentManaBonus = 0;

	private currentHealBonus = 0;

	private currentPoisonBonus = 0;

	private currentPenetrationBonus = 0;

	private currentProtectionBonus = 0;

	private currentSpeedBonus = 0;

	private currentSlowBonus = 0;

	// Stacks

	private currentPoisonStacks = 0;

	private currentPenetrationStacks = 0;

	private currentProtectionStacks = 0;

	private currentSpeedStacks = 0;

	private currentSlowStacks = 0;
}

export class Ability {}

export interface GameEvent {
	priority: "before" | "after";
}

export interface PlayerEvent {
	source: Player;
}

export interface AbilityEvent extends PlayerEvent {
	ability: Ability;
}

export interface PlayerValueEvent extends PlayerEvent {
	amount: number;
}

export interface DamageEvent extends PlayerValueEvent {
	type: DamageEvent;
	target: Player;
}

export interface DodgeEvent extends PlayerValueEvent {
	type: DamageEvent;
}

export interface BuffEvent extends PlayerValueEvent {}

export interface DebuffEvent extends PlayerValueEvent {
	target: Player;
}

export type GameEventListener<T> = (event: T) => void;

export class Game {
	// Events
	on(type: "prepare", listener: () => void): void;

	// Setup event takes place before start.
	// Stat adjustments should be made here.
	on(type: "setup", listener: () => void): void;

	// Start event begins the game.
	// Timeout events for the entire game should
	// be applied here (e.g. Poison damage)
	on(type: "start", listener: () => void): void;

	// Event for when a player casts their ability.
	on(type: "cast-ability", listener: GameEventListener<AbilityEvent>): void;

	// Event for when a player deals damage
	on(type: "damage", listener: GameEventListener<DamageEvent>): void;

	// Event for when a player's deals a critical
	on(type: "critical", listener: GameEventListener<PlayerEvent>): void;

	// Event for when a player dodges a damage
	on(type: "dodge", listener: GameEventListener<DodgeEvent>): void;

	// Event for when a player gains mana
	on(type: "gain-mana", listener: GameEventListener<BuffEvent>): void;

	// Event for when a player applies Penetration
	on(type: "apply-penetration", listener: GameEventListener<DebuffEvent>): void;

	// Event for when a player applies Poison
	on(type: "apply-poison", listener: GameEventListener<DebuffEvent>): void;

	// Event for when a player gains Protection
	on(type: "gain-protection", listener: GameEventListener<BuffEvent>): void;

	// Event for when a player gains Heal
	on(type: "gain-heal", listener: GameEventListener<BuffEvent>): void;

	// Event for when a player applies Slow
	on(type: "apply-slow", listener: GameEventListener<DebuffEvent>): void;

	// Event for when a player gains Speed
	on(type: "gain-speed", listener: GameEventListener<BuffEvent>): void;

	on(type: string): void {}

	setup(): void {}

	start(): void {}

	castAbility(player: Player): void {}

	dealDamage(
		type: DamageType,
		source: Player,
		target: Player,
		amount: number,
	): void {}

	dodge(type: DamageType, player: Player, amount: number): void {}

	giveMana(player: Player, amount: number): void {}

	applyPenetration(player: Player, amount: number): void {}

	applyPoison(player: Player, amount: number): void {}

	giveProtection(player: Player, amount: number): void {}

	giveHeal(player: Player, amount: number): void {}

	applySlow(player: Player, amount: number): void {}

	giveSpeed(player: Player, amount: number): void {}
}
