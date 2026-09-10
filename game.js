// Game Instance
let gameState;

// DOM Elements
const pokemonListEl = document.getElementById('pokemonList');
const pokemon1SelectEl = document.getElementById('pokemon1Select');
const pokemon2SelectEl = document.getElementById('pokemon2Select');
const parent1SelectEl = document.getElementById('parent1Select');
const parent2SelectEl = document.getElementById('parent2Select');
const fusedPokemonSelectEl = document.getElementById('fusedPokemonSelect');
const fusionBtn = document.getElementById('fusionBtn');
const breedBtn = document.getElementById('breedBtn');
const unfusionBtn = document.getElementById('unfusionBtn');
const fusionResultEl = document.getElementById('fusionResult');
const breedResultEl = document.getElementById('breedResult');
const unfusionResultEl = document.getElementById('unfusionResult');
const playerLevelEl = document.getElementById('playerLevel');
const pokedexCountEl = document.getElementById('pokedexCount');
const pokemonModal = document.getElementById('pokemonModal');
const pokemonDetailsEl = document.getElementById('pokemonDetails');
const closeModalBtn = document.querySelector('.close-btn');

let selectedFusionType = 'permanent';

// Initialize Game
function initGame() {
    gameState = new GameState();
    setupEventListeners();
    updateUI();
}

// Setup Event Listeners
function setupEventListeners() {
    // Fusion type selection
    document.querySelectorAll('.fusion-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.fusion-btn').forEach(b => b.classList.remove('active'));
            e.target.closest('.fusion-btn').classList.add('active');
            selectedFusionType = e.target.closest('.fusion-btn').dataset.type;
        });
    });

    // Buttons
    fusionBtn.addEventListener('click', performFusion);
    breedBtn.addEventListener('click', performBreeding);
    unfusionBtn.addEventListener('click', performUnfusion);
    closeModalBtn.addEventListener('click', closeModal);
    pokemonModal.addEventListener('click', (e) => {
        if (e.target === pokemonModal) closeModal();
    });

    // Set default fusion type
    document.querySelector('.permanent-btn').classList.add('active');
}

// Update UI
function updateUI() {
    updatePokemonList();
    updateSelects();
    updateStats();
}

function updatePokemonList() {
    pokemonListEl.innerHTML = '';
    gameState.pokemon.forEach(pokemon => {
        const card = createPokemonCard(pokemon);
        pokemonListEl.appendChild(card);
    });
}

function createPokemonCard(pokemon) {
    const card = document.createElement('div');
    card.className = 'pokemon-card';
    
    if (pokemon.isFused) {
        card.classList.add('fused');
        if (pokemon.fusionType === 'permanent') {
            card.classList.add('permanent');
        } else if (pokemon.fusionType === 'reversible') {
            card.classList.add('reversible');
        }
    }

    card.innerHTML = `
        <div class="pokemon-img">🔷</div>
        <div class="pokemon-name">${pokemon.name}</div>
        <div class="pokemon-level">Lvl. ${pokemon.level}</div>
    `;

    card.addEventListener('click', () => showPokemonDetails(pokemon));
    return card;
}

function showPokemonDetails(pokemon) {
    pokemonDetailsEl.innerHTML = `
        <img src="" alt="${pokemon.name}">
        <h2>${pokemon.name}</h2>
        <div class="detail-row">
            <div class="detail-item">
                <span class="detail-label">Level</span>
                <span class="detail-value">${pokemon.level}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Experience</span>
                <span class="detail-value">${pokemon.experiencePoints} XP</span>
            </div>
        </div>
        <div class="detail-row">
            <div class="detail-item">
                <span class="detail-label">Type</span>
                <span class="detail-value">${pokemon.type.join(', ')}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Health</span>
                <span class="detail-value">${pokemon.health}</span>
            </div>
        </div>
        <div class="detail-row">
            <div class="detail-item">
                <span class="detail-label">Attack</span>
                <span class="detail-value">${pokemon.stats.attack}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Defense</span>
                <span class="detail-value">${pokemon.stats.defense}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Sp. Atk</span>
                <span class="detail-value">${pokemon.stats.spAtk}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Sp. Def</span>
                <span class="detail-value">${pokemon.stats.spDef}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Speed</span>
                <span class="detail-value">${pokemon.stats.speed}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Catch Rate</span>
                <span class="detail-value">${Math.round(pokemon.catchRate)}</span>
            </div>
        </div>
        ${pokemon.isFused ? `
            <div style="padding: 10px; background: #fff3cd; border-radius: 8px;">
                <strong>Fusion Type:</strong> ${pokemon.fusionType === 'permanent' ? '🔒 Permanent' : '🔄 Reversible'}
            </div>
        ` : ''}
    `;
    pokemonModal.classList.remove('hidden');
}

function closeModal() {
    pokemonModal.classList.add('hidden');
}

function updateSelects() {
    pokemon1SelectEl.innerHTML = '';
    pokemon2SelectEl.innerHTML = '';
    parent1SelectEl.innerHTML = '';
    parent2SelectEl.innerHTML = '';
    fusedPokemonSelectEl.innerHTML = '';

    pokemon1SelectEl.innerHTML += '<option value="">Select Pokémon 1</option>';
    pokemon2SelectEl.innerHTML += '<option value="">Select Pokémon 2</option>';
    parent1SelectEl.innerHTML += '<option value="">Select Parent 1</option>';
    parent2SelectEl.innerHTML += '<option value="">Select Parent 2</option>';
    fusedPokemonSelectEl.innerHTML += '<option value="">Select Fused Pokémon</option>';

    gameState.pokemon.forEach(pokemon => {
        const option = `<option value="${pokemon.instanceId}">${pokemon.name} (Lvl. ${pokemon.level})</option>`;
        pokemon1SelectEl.innerHTML += option;
        pokemon2SelectEl.innerHTML += option;
        parent1SelectEl.innerHTML += option;
        parent2SelectEl.innerHTML += option;

        // Only show fused Pokemon with reversible fusion
        if (pokemon.isFused && pokemon.fusionType === 'reversible') {
            fusedPokemonSelectEl.innerHTML += option;
        }
    });
}

function updateStats() {
    playerLevelEl.textContent = gameState.playerLevel;
    pokedexCountEl.textContent = gameState.pokedex.size;
}

// Perform Fusion
function performFusion() {
    const pokemon1Id = parseInt(pokemon1SelectEl.value);
    const pokemon2Id = parseInt(pokemon2SelectEl.value);

    if (!pokemon1Id || !pokemon2Id) {
        showResult('fusionResult', false, 'Please select two Pokémon to fuse!');
        return;
    }

    if (pokemon1Id === pokemon2Id) {
        showResult('fusionResult', false, 'Please select two different Pokémon!');
        return;
    }

    const fusedPokemon = gameState.createFusion(pokemon1Id, pokemon2Id, selectedFusionType);

    if (fusedPokemon) {
        const message = selectedFusionType === 'permanent' 
            ? `Created ${fusedPokemon.name}! This fusion is PERMANENT and CANNOT be undone.`
            : `Created ${fusedPokemon.name}! This fusion can be REVERSED in the Unfusion Center.`;
        
        showResult('fusionResult', true, message, fusedPokemon);
        updateUI();
        pokemon1SelectEl.value = '';
        pokemon2SelectEl.value = '';
    } else {
        showResult('fusionResult', false, 'Fusion failed! Please try again.');
    }
}

// Perform Breeding
function performBreeding() {
    const parent1Id = parseInt(parent1SelectEl.value);
    const parent2Id = parseInt(parent2SelectEl.value);

    if (!parent1Id || !parent2Id) {
        showResult('breedResult', false, 'Please select two Pokémon to breed!');
        return;
    }

    if (parent1Id === parent2Id) {
        showResult('breedResult', false, 'Please select two different Pokémon!');
        return;
    }

    const babyPokemon = gameState.breedPokemon(parent1Id, parent2Id);

    if (babyPokemon) {
        showResult('breedResult', true, `A baby ${babyPokemon.name} was born!`, babyPokemon);
        updateUI();
        parent1SelectEl.value = '';
        parent2SelectEl.value = '';
    } else {
        showResult('breedResult', false, 'Breeding failed! Please try again.');
    }
}

// Perform Unfusion
function performUnfusion() {
    const fusedId = parseInt(fusedPokemonSelectEl.value);

    if (!fusedId) {
        showResult('unfusionResult', false, 'Please select a fused Pokémon to unfuse!');
        return;
    }

    const unfusedResult = gameState.unfusePokemon(fusedId);

    if (unfusedResult) {
        const message = `Successfully unfused! You now have ${unfusedResult.pokemon1.name} and ${unfusedResult.pokemon2.name} back.`;
        showResult('unfusionResult', true, message);
        updateUI();
        fusedPokemonSelectEl.value = '';
    } else {
        showResult('unfusionResult', false, 'Unfusion failed! This Pokémon cannot be unfused.');
    }
}

// Show Result
function showResult(elementId, success, message, pokemon = null) {
    const resultEl = document.getElementById(elementId);
    resultEl.classList.remove('hidden', 'result-success', 'result-error');
    resultEl.classList.add(success ? 'result-success' : 'result-error');

    if (pokemon) {
        resultEl.innerHTML = `
            <div class="result-content">
                <div class="result-pokemon">
                    <div class="result-pokemon-img">🔷</div>
                    <strong>${pokemon.name}</strong>
                </div>
                <div class="result-info">
                    <h3>${message}</h3>
                    <p><strong>Type:</strong> ${pokemon.type.join(', ')}</p>
                    <p><strong>Level:</strong> ${pokemon.level}</p>
                    <div class="stat-row">
                        <div class="stat"><strong>HP:</strong> ${pokemon.stats.hp}</div>
                        <div class="stat"><strong>ATK:</strong> ${pokemon.stats.attack}</div>
                        <div class="stat"><strong>DEF:</strong> ${pokemon.stats.defense}</div>
                        <div class="stat"><strong>SP.ATK:</strong> ${pokemon.stats.spAtk}</div>
                    </div>
                </div>
            </div>
        `;
    } else {
        resultEl.innerHTML = `<p><strong>${message}</strong></p>`;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initGame);
