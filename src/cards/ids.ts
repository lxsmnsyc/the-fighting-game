/**
 * Every card's fixed id. An id never changes or gets reused, even when
 * a card is renamed, so anything saved keeps pointing at the same card.
 * Each group of cards gets its own hundred.
 */
const enum CardId {
  // Starter: energy every second
  Fortify = 100,
  Sharpen = 101,
  Corrode = 102,
  Focus = 103,
  Evade = 104,
  Mend = 105,
  Channel = 106,
  Envenom = 107,
  Hinder = 108,
  Hasten = 109,

  // Bonus whenever the energy is gained
  Ferocious = 200,
  Arcane = 201,
  Toxic = 202,
  Sturdy = 203,
  Caustic = 204,
  Swift = 205,
  Sluggish = 206,
  Nimble = 207,
  Keen = 208,
  Vital = 209,

  // Energy at the start of battle
  Ambush = 300,
  Invoke = 301,
  Taint = 302,
  Brace = 303,
  Rust = 304,
  Sprint = 305,
  Ensnare = 306,
  Sidestep = 307,
  Aim = 308,
  Rejuvenate = 309,

  // Stat at the start of battle
  Hearty = 400,

  // Energy when healed
  Harden = 500,
  Rally = 501,
  Fester = 502,
  Steady = 503,
  Limber = 504,
  Meditate = 505,
  Blight = 506,
  Numb = 507,
  Refresh = 508,

  // Energy for health lost
  Scarred = 600,
  Vengeful = 601,
  Bitter = 602,
  Desperate = 603,
  Wary = 604,
  Anguished = 605,
  Spiteful = 606,
  Crippling = 607,
  Frantic = 608,

  // Energy when attacking
  Frenzied = 700,
  Enchanted = 701,
  Poison = 702,
  Guarded = 703,
  Erode = 704,
  Quicken = 705,
  Hamstring = 706,
  Agile = 707,
  Precise = 708,
  Renew = 709,

  // Energy on a critical hit
  Exploit = 800,
  Empower = 801,
  Infect = 802,
  Bolster = 803,
  Shatter = 804,
  Accelerate = 805,
  Stagger = 806,
  Elusive = 807,
  Deadly = 808,
  Revitalize = 809,

  // Rare
  Relentless = 900,
  Ambidextrous = 901,
  Vampiric = 902,
  Merciless = 903,
  Endure = 904,
}

export default CardId;
