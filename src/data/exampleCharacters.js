// Example characters extracted from Dolmenwoodtoons.pdf
export const exampleCharacters = [
  {
    id: '1',
    name: 'Brion Blackthorn',
    kindredClass: 'Breggle Knight',
    background: "Sorcerer's Assistant",
    alignment: 'Lawful',
    affiliation: 'House Harrowmoor',
    moonSign: 'Fall Robbers Moon',
    abilityScores: {
      strength: { score: 15, mod: 1 },
      intelligence: { score: 11, mod: 0 },
      wisdom: { score: 11, mod: 0 },
      dexterity: { score: 9, mod: 0 },
      constitution: { score: 16, mod: 2 },
      charisma: { score: 13, mod: 1 }
    },
    saveTargets: {
      doom: 12,
      ray: null,
      hold: 12,
      blast: null,
      spell: 15,
      resistance: null
    },
    hp: 9,
    maxHp: 9,
    ac: '14/15 +shield',
    speed: null,
    exploring: null,
    overland: null,
    attack: null,
    kindredTraits: `Fae
-+1 AC when unarmored or in light armor
-horns - +2 hit / 1D4+1 dmg
-Horsemanship- assessing steed worth
Chivalric Code
-Mounted Combat - +1 attack if mounted
-Strength as will +2 saving bonus against fear, maybe a key effect`,
    affiliation2: 'Sworn to House Harrowmoor',
    skillTargets: {
      listen: 6,
      search: 6,
      survival: 6
    },
    languages: ['Woldish', 'Gaelic', 'Ogrice'],
    xp: 1665,
    level: 1,
    nextLevel: 2250,
    modifier: 575,
    inventory: {
      tinyItems: ['thigh bone flute'],
      equippedItems: [
        { item: 'Chainmail (m)', weight: '14 AC', description: '' },
        { item: 'Shield', weight: '1 AC', description: '' },
        { item: 'Long sword', weight: '1D8+1', description: '' },
        { item: 'Lance', weight: '1D6+1', description: '' }
      ],
      stowedItems: [
        { item: 'Water Skin', weight: null, description: '' },
        { item: 'with chalice liquid', weight: null, description: '' },
        { item: 'riding saddle bags', weight: null, description: '' },
        { item: 'Feed (3 days) horse - 500', weight: null, description: '' },
        { item: 'Briarwort Prancer', weight: null, description: '' }
      ],
      totalWeight: null
    },
    coins: {
      copper: null,
      silver: 8,
      gold: 294,
      pellucidum: null
    },
    otherNotes: `Age 21
Height 6'
Weight 147 lbs`
  },
  {
    id: '2',
    name: 'Gilly Dagwood',
    kindredClass: 'Half Human/Elf Friar',
    background: 'Jeweler',
    alignment: 'Lawful',
    affiliation: '',
    moonSign: 'Waxing Witchs Moon',
    abilityScores: {
      strength: { score: 8, mod: -1 },
      intelligence: { score: 9, mod: 0 },
      wisdom: { score: 12, mod: 0 },
      dexterity: { score: 5, mod: -2 },
      constitution: { score: 8, mod: -1 },
      charisma: { score: 8, mod: -1 }
    },
    saveTargets: {
      doom: 11,
      ray: 12,
      hold: 13,
      blast: 14,
      spell: 14,
      resistance: 0
    },
    hp: 5,
    maxHp: 5,
    ac: '11',
    speed: 90,
    exploring: null,
    overland: null,
    attack: null,
    kindredTraits: `decisiveness
Leadership +1
Si-
armorsmith 2
Culinary implements & 14W
-
Turn Undead
All lift 5gp`,
    affiliation2: 'herbalism - might due jasul for 2 good\n1 spell\ndetect magic\ndetect evil\nBeast ward\nLesser healing\nLight\nshields of Protection\nParty str 1 - Druids\nRally',
    skillTargets: {
      listen: 6,
      search: 6,
      survival: '5/6'
    },
    languages: ['Libergic', 'Woldish'],
    xp: 1445,
    level: 1,
    nextLevel: 2735,
    modifier: '10%',
    inventory: {
      tinyItems: [],
      equippedItems: [],
      stowedItems: [],
      totalWeight: null
    },
    coins: {
      copper: null,
      silver: null,
      gold: null,
      pellucidum: null
    },
    otherNotes: `Age 26 years
Ht 5'6"
Wt 149`
  },
  {
    id: '3',
    name: 'Mudwort Mosfoot',
    kindredClass: 'Mossling Hunter',
    background: 'Squirrel Trainer',
    alignment: 'Lawful',
    affiliation: '',
    moonSign: 'Waning Witchs Moon',
    abilityScores: {
      strength: { score: 11, mod: 0 },
      intelligence: { score: 11, mod: 0 },
      wisdom: { score: 9, mod: 0 },
      dexterity: { score: 9, mod: 0 },
      constitution: { score: 9, mod: 0 },
      charisma: { score: 9, mod: 0 }
    },
    saveTargets: {
      doom: 12,
      ray: 12,
      hold: 14,
      blast: 15,
      spell: 16,
      resistance: null
    },
    hp: 10,
    maxHp: 10,
    ac: '12/13',
    speed: 30,
    exploring: null,
    overland: null,
    attack: null,
    kindredTraits: `-Symbiotic Flesh - covered in slimy green jelly
Resilience - +4 save Range/zones/poison
  - +2 all other saves
-Alertness:
Stalking
-Missile Attacks +1 Attack
-Trophies
-Wayfinding - 3 in 6 find the path`,
    affiliation2: `Animal Companion:
Tracking -
Knack - Wood Kenning
-Symbioth Flesh - death, flowers bloom in Dead in spring`,
    skillTargets: {
      listen: 6,
      search: 6,
      survival: 5,
      alertness: 5,
      stalking: 6,
      tracking: 5
    },
    languages: ['Woldish', 'Mulch'],
    xp: 2399,
    level: 2,
    nextLevel: 4500,
    modifier: '-',
    inventory: {
      tinyItems: [],
      equippedItems: [],
      stowedItems: [],
      totalWeight: null
    },
    coins: {
      copper: null,
      silver: null,
      gold: null,
      pellucidum: null
    },
    otherNotes: ''
  },
  {
    id: '4',
    name: "Kitty Grisner 3'3",
    kindredClass: 'Grimalkin Bard',
    background: 'Mariner',
    alignment: 'Chaotic',
    affiliation: '',
    moonSign: '',
    abilityScores: {
      strength: { score: 11, mod: 0 },
      intelligence: { score: 10, mod: 0 },
      wisdom: { score: 9, mod: 0 },
      dexterity: { score: 9, mod: 0 },
      constitution: { score: 17, mod: 2 },
      charisma: { score: 9, mod: 0 }
    },
    saveTargets: {
      doom: 14,
      ray: 13,
      hold: 13,
      blast: 15,
      spell: 15,
      resistance: 2
    },
    hp: 11,
    maxHp: 11,
    ac: '12/13 +holy',
    speed: 30,
    exploring: null,
    overland: null,
    attack: null,
    kindredTraits: 'Immortal',
    affiliation2: '',
    skillTargets: {
      listen: 5,
      search: null,
      survival: null,
      deciferDoc: 6,
      leaderinfluence: 5,
      monsterLore: 5
    },
    languages: ['Mewl', 'Woldish'],
    xp: 2937,
    level: 2,
    nextLevel: 3500,
    modifier: 0,
    inventory: {
      tinyItems: [],
      equippedItems: [],
      stowedItems: [],
      totalWeight: null
    },
    coins: {
      copper: null,
      silver: null,
      gold: null,
      pellucidum: null
    },
    otherNotes: 'Ape: 990'
  }
];
