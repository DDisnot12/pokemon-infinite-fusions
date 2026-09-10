// Base Pokemon Data
const basePokemon = [
    { id: 1, name: 'Bulbasaur', type: ['Grass', 'Poison'], baseStats: { hp: 45, attack: 49, defense: 49, spAtk: 65, spDef: 65, speed: 45 }, catchRate: 45 },
    { id: 2, name: 'Ivysaur', type: ['Grass', 'Poison'], baseStats: { hp: 60, attack: 62, defense: 63, spAtk: 80, spDef: 80, speed: 60 }, catchRate: 45 },
    { id: 3, name: 'Venusaur', type: ['Grass', 'Poison'], baseStats: { hp: 80, attack: 82, defense: 83, spAtk: 100, spDef: 100, speed: 80 }, catchRate: 45 },
    { id: 4, name: 'Charmander', type: ['Fire'], baseStats: { hp: 39, attack: 52, defense: 43, spAtk: 60, spDef: 50, speed: 65 }, catchRate: 45 },
    { id: 5, name: 'Charmeleon', type: ['Fire'], baseStats: { hp: 58, attack: 64, defense: 58, spAtk: 80, spDef: 65, speed: 80 }, catchRate: 45 },
    { id: 6, name: 'Charizard', type: ['Fire', 'Flying'], baseStats: { hp: 78, attack: 84, defense: 78, spAtk: 109, spDef: 85, speed: 100 }, catchRate: 45 },
    { id: 7, name: 'Squirtle', type: ['Water'], baseStats: { hp: 44, attack: 48, defense: 65, spAtk: 50, spDef: 64, speed: 43 }, catchRate: 45 },
    { id: 8, name: 'Wartortle', type: ['Water'], baseStats: { hp: 59, attack: 63, defense: 80, spAtk: 65, spDef: 80, speed: 58 }, catchRate: 45 },
    { id: 9, name: 'Blastoise', type: ['Water'], baseStats: { hp: 79, attack: 83, defense: 100, spAtk: 85, spDef: 105, speed: 78 }, catchRate: 45 },
    { id: 25, name: 'Pikachu', type: ['Electric'], baseStats: { hp: 35, attack: 55, defense: 40, spAtk: 50, spDef: 50, speed: 90 }, catchRate: 190 },
];

// Game State
class GameState {
    constructor() {
        this.playerLevel = 1;
        this.pokedex = new Map();
        this.pokemon = [];
        this.nextId = 100;
        
        // Initialize with starter Pokemon
        this.addPokemon(this.createPokemonInstance(1, 1)); // Bulbasaur
        this.addPokemon(this.createPokemonInstance(4, 1)); // Charmander
        this.addPokemon(this.createPokemonInstance(7, 1)); // Squirtle
        this.addPokemon(this.createPokemonInstance(25, 1)); // Pikachu
    }

    createPokemonInstance(baseId, level = 1) {
        const basePoke = basePokemon.find(p => p.id === baseId);
        if (!basePoke) return null;

        return {
            instanceId: this.nextId++,
            baseId: baseId,
            name: basePoke.name,
            level: level,
            type: [...basePoke.type],
            stats: this.calculateStats(basePoke.baseStats, level),
            baseStats: basePoke.baseStats,
            catchRate: basePoke.catchRate,
            isFused: false,
            fusionType: null, // 'permanent' or 'reversible'
            originalParents: null, // For reversible fusions
            experiencePoints: 0,
            health: this.calculateHP(basePoke.baseStats, level),
        };
    }

    calculateStats(baseStats, level) {
        return {
            hp: this.calculateStat(baseStats.hp, level, 'hp'),
            attack: this.calculateStat(baseStats.attack, level),
            defense: this.calculateStat(baseStats.defense, level),
            spAtk: this.calculateStat(baseStats.spAtk, level),
            spDef: this.calculateStat(baseStats.spDef, level),
            speed: this.calculateStat(baseStats.speed, level),
        };
    }

    calculateStat(baseStat, level, statType = 'normal') {
        if (statType === 'hp') {
            return Math.floor((2 * baseStat + 31) * level / 100) + level + 5;
        }
        return Math.floor(((2 * baseStat + 31) * level / 100) + 5);
    }

    calculateHP(baseStats, level) {
        return this.calculateStat(baseStats.hp, level, 'hp');
    }

    addPokemon(pokemon) {
        if (pokemon) {
            this.pokemon.push(pokemon);
            if (!this.pokedex.has(pokemon.baseId)) {
                this.pokedex.set(pokemon.baseId, { baseId: pokemon.baseId, name: pokemon.name });
            }
        }
    }

    getPokemonById(instanceId) {
        return this.pokemon.find(p => p.instanceId === instanceId);
    }

    createFusion(pokemon1Id, pokemon2Id, fusionType) {
        const poke1 = this.getPokemonById(pokemon1Id);
        const poke2 = this.getPokemonById(pokemon2Id);

        if (!poke1 || !poke2) return null;

        const fusedId = 10000 + Math.floor(Math.random() * 89999); // Custom fusion ID
        const fusedName = `${poke1.name}${poke2.name}`;
        const fusedLevel = Math.max(poke1.level, poke2.level);
        
        // Combine types
        const fusedTypes = [...new Set([...poke1.type, ...poke2.type])].slice(0, 2);

        // Average stats with slight boost
        const statBoost = 1.1;
        const fusedStats = {
            hp: Math.floor((poke1.baseStats.hp + poke2.baseStats.hp) / 2 * statBoost),
            attack: Math.floor((poke1.baseStats.attack + poke2.baseStats.attack) / 2 * statBoost),
            defense: Math.floor((poke1.baseStats.defense + poke2.baseStats.defense) / 2 * statBoost),
            spAtk: Math.floor((poke1.baseStats.spAtk + poke2.baseStats.spAtk) / 2 * statBoost),
            spDef: Math.floor((poke1.baseStats.spDef + poke2.baseStats.spDef) / 2 * statBoost),
            speed: Math.floor((poke1.baseStats.speed + poke2.baseStats.speed) / 2 * statBoost),
        };

        // Reduce catch rate for fused Pokemon
        const baseCatchRate = Math.min(poke1.catchRate, poke2.catchRate) * 0.5;

        const fusedPokemon = {
            instanceId: this.nextId++,
            baseId: fusedId,
            name: fusedName,
            level: fusedLevel,
            type: fusedTypes,
            stats: this.calculateStats(fusedStats, fusedLevel),
            baseStats: fusedStats,
            catchRate: baseCatchRate,
            isFused: true,
            fusionType: fusionType, // 'permanent' or 'reversible'
            originalParents: fusionType === 'reversible' ? { pokemon1: poke1, pokemon2: poke2 } : null,
            experiencePoints: 0,
            health: this.calculateHP(fusedStats, fusedLevel),
        };

        // For permanent fusion, remove originals
        if (fusionType === 'permanent') {
            this.pokemon = this.pokemon.filter(p => p.instanceId !== pokemon1Id && p.instanceId !== pokemon2Id);
        } else if (fusionType === 'reversible') {
            // For reversible, keep originals but mark them as used in fusion
            poke1.inReversibleFusion = true;
            poke2.inReversibleFusion = true;
        }

        this.addPokemon(fusedPokemon);
        return fusedPokemon;
    }

    unfusePokemon(fusedInstanceId) {
        const fusedPoke = this.getPokemonById(fusedInstanceId);

        if (!fusedPoke || fusedPoke.fusionType !== 'reversible' || !fusedPoke.originalParents) {
            return null;
        }

        // Remove fused Pokemon
        this.pokemon = this.pokemon.filter(p => p.instanceId !== fusedInstanceId);

        // Re-enable original parents
        fusedPoke.originalParents.pokemon1.inReversibleFusion = false;
        fusedPoke.originalParents.pokemon2.inReversibleFusion = false;

        return {
            pokemon1: fusedPoke.originalParents.pokemon1,
            pokemon2: fusedPoke.originalParents.pokemon2,
        };
    }

    breedPokemon(pokemon1Id, pokemon2Id) {
        const poke1 = this.getPokemonById(pokemon1Id);
        const poke2 = this.getPokemonById(pokemon2Id);

        if (!poke1 || !poke2) return null;

        // Breed creates a new Pokemon with base stats between parents
        const babyLevel = 1;
        const babyBaseStats = {
            hp: Math.floor((poke1.baseStats.hp + poke2.baseStats.hp) / 2),
            attack: Math.floor((poke1.baseStats.attack + poke2.baseStats.attack) / 2),
            defense: Math.floor((poke1.baseStats.defense + poke2.baseStats.defense) / 2),
            spAtk: Math.floor((poke1.baseStats.spAtk + poke2.baseStats.spAtk) / 2),
            spDef: Math.floor((poke1.baseStats.spDef + poke2.baseStats.spDef) / 2),
            speed: Math.floor((poke1.baseStats.speed + poke2.baseStats.speed) / 2),
        };

        // Randomly choose a parent type
        const parentForType = Math.random() > 0.5 ? poke1 : poke2;

        const babyPokemon = {
            instanceId: this.nextId++,
            baseId: 20000 + Math.floor(Math.random() * 79999), // Custom breed ID
            name: `${parentForType.name} (bred)`,
            level: babyLevel,
            type: [...parentForType.type],
            stats: this.calculateStats(babyBaseStats, babyLevel),
            baseStats: babyBaseStats,
            catchRate: Math.max(poke1.catchRate, poke2.catchRate) * 1.2,
            isFused: false,
            fusionType: null,
            originalParents: null,
            experiencePoints: 0,
            health: this.calculateHP(babyBaseStats, babyLevel),
            isBred: true,
            parents: { pokemon1Id, pokemon2Id },
        };

        this.addPokemon(babyPokemon);
        return babyPokemon;
    }

    levelUp(instanceId, levels = 1) {
        const pokemon = this.getPokemonById(instanceId);
        if (pokemon) {
            pokemon.level += levels;
            pokemon.stats = this.calculateStats(pokemon.baseStats, pokemon.level);
            pokemon.health = this.calculateHP(pokemon.baseStats, pokemon.level);
        }
    }
}

// Export for use in game.js
window.GameState = GameState;
window.basePokemon = basePokemon;
