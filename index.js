
let pokemonSelector, cpSelector, levelSelector, atkSelector, defSelector, hpSelector, targetSelector, luckyToggle, shadowToggle, purifiedToggle, dropdownMenu, targetRow, greatRow, ultraRow, table;
let noPokemonEl;
const rows = [];

let data;

let selectedPokemon = null;
let selectedLevel = 0;
let selectedCp = 0;
let selectedAtk = 15;
let selectedDef = 15;
let selectedHp = 15;
let dropdownMenuSelectedIndex = -1;
let isLucky = false;
let isShadow = false;
let isPurified = false;

Promise.all(
    [
        new Promise(resolve => {
            window.onload = () => {
                pokemonSelector = document.querySelector('#pokemon-selector');
                atkSelector = document.querySelector('#atk-selector');
                defSelector = document.querySelector('#def-selector');
                hpSelector = document.querySelector('#hp-selector');
                levelSelector = document.querySelector('#level-selector');
                cpSelector = document.querySelector('#cp-selector');
                targetSelector = document.querySelector('#target-selector');
                luckyToggle = document.querySelector('#lucky-toggle');
                shadowToggle = document.querySelector('#shadow-toggle');
                purifiedToggle = document.querySelector('#purified-toggle');
                dropdownMenu = document.querySelector('#dropdown-menu');
                targetRow = document.querySelector('#target-row');
                greatRow = document.querySelector('#great-row');
                ultraRow = document.querySelector('#ultra-row');
                table = document.querySelector('#table');

                resolve();
            }
        }),
        fetch('./data.json').then(r => r.json()).then(r => data = r)
    ]
).then(init);

function init() {
    noPokemonEl = document.createElement('div');
    noPokemonEl.innerText = 'No Matching Pokemon';
    noPokemonEl.classList.add('no-match', 'removed');
    dropdownMenu.append(noPokemonEl);

    data.levels.forEach(level => addRow(level));

    window.addEventListener('click', (e) => {
        // if(!dropdownMenu.contains(e.target) && ![dropdownMenu, pokemonSelector].includes(e.target)) {
        if(e.target !== pokemonSelector) {
            dropdownMenu.classList.add('removed');
        }
    });
    pokemonSelector.addEventListener('focus', () => dropdownMenu.classList.remove('removed'));
    pokemonSelector.addEventListener('input', updatePokemonList);
    pokemonSelector.addEventListener('keydown', updateSelectedDropdownIndex);
    atkSelector.addEventListener('input', updateIv);
    defSelector.addEventListener('input', updateIv);
    hpSelector.addEventListener('input', updateIv);
    levelSelector.addEventListener('input', updateLevel);
    cpSelector.addEventListener('input', updateCp);
    luckyToggle.addEventListener('input', updateLucky);
    shadowToggle.addEventListener('input', updateShadow);
    purifiedToggle.addEventListener('input', updatePurified);
    targetSelector.addEventListener('input', updateTarget);

    addPokemonToList();
}

function updateLucky() {
    if(luckyToggle.checked) {
        isLucky = true;
        isShadow = false;
        shadowToggle.checked = false;
    } else {
        isLucky = false;
    }

    updateCosts();
}

function updateShadow() {
    if(shadowToggle.checked) {
        isShadow = true;
        isLucky = false;
        isPurified = false;
        luckyToggle.checked = false;
        purifiedToggle.checked = false;
    } else {
        isShadow = false;
    }

    updateCosts();
}

function updatePurified() {
    if(purifiedToggle.checked) {
        isPurified = true;
        isShadow = false;
        shadowToggle.checked = false;
    } else {
        isPurified = false;
    }

    updateCosts();
}

const searchReplaceRegex = /[-() %.:'♀♂]/gi;

function addPokemonToList() {
    data.pokemon.forEach(pokemon => {
        let el = document.createElement('div');
        el.innerText = pokemon.name;
        el.addEventListener('click', () => {
            selectedPokemon = pokemon;
            pokemonSelector.value = pokemon.name;
            updatePokemonList()

            if(selectedLevel) {
                selectedCp = calculateCp(selectedPokemon, selectedLevel, selectedAtk, selectedDef, selectedHp);
                cpSelector.value = selectedCp;
            }

            updateCosts();
        });

        pokemon.el = el;
        pokemon.id = pokemon.name.toLowerCase().replaceAll(searchReplaceRegex, '').replaceAll('é', 'e');

        dropdownMenu.append(el);
    });
}

function updateSelectedDropdownIndex(e) {
    const menuItems = dropdownMenu.querySelectorAll(':not(.removed)');

    if(e.key === 'ArrowDown') {
        e.preventDefault();
        if(dropdownMenuSelectedIndex !== -1) {
            menuItems[dropdownMenuSelectedIndex].classList.remove('selected');
        }

        dropdownMenuSelectedIndex++;
        
        if(dropdownMenuSelectedIndex >= menuItems.length) {
            dropdownMenuSelectedIndex = 0;
        }
    } else if(e.key === 'ArrowUp') {
        e.preventDefault();
        if(dropdownMenuSelectedIndex !== -1) {
            menuItems[dropdownMenuSelectedIndex].classList.remove('selected');
        }

        dropdownMenuSelectedIndex--;

        if(dropdownMenuSelectedIndex < 0) {
            dropdownMenuSelectedIndex = menuItems.length - 1;
        }
    } else if(e.key === 'Enter') {
        const name = menuItems[dropdownMenuSelectedIndex].innerText;
        const pokemon = data.pokemon.find(x => x.name === name);

        clearSelectedDropdownIndex();
        
        selectedPokemon = pokemon;
        pokemonSelector.value = pokemon.name;
        updatePokemonList();

        if(selectedLevel) {
            selectedCp = calculateCp(selectedPokemon, selectedLevel, selectedAtk, selectedDef, selectedHp);
            cpSelector.value = selectedCp;
        }

        updateCosts();

        dropdownMenu.classList.add('removed');

        return;
    } else if(e.key === 'Tab') {
        clearSelectedDropdownIndex();
        dropdownMenu.classList.add('removed');
    } else {
        return;
    }

    menuItems[dropdownMenuSelectedIndex].classList.add('selected');
}

function clearSelectedDropdownIndex() {
    if(dropdownMenuSelectedIndex === -1) {
        return;
    }

    dropdownMenu.querySelectorAll(':not(.removed)')[dropdownMenuSelectedIndex].classList.remove('selected');
    dropdownMenuSelectedIndex = -1;
}

function updateTarget() {
    let row = data.levels.find(x => +targetSelector.value === x.level);

    if (!row) {
        for(let i = 1; i < 5; i++) {
            targetRow.children[i].innerText = '';
        }

        return;
    }

    for(let i = 1; i < 5; i++) {
        targetRow.children[i].innerText = row.el.children[i].innerText;
    }
}

function updatePokemonList() {
    clearSelectedDropdownIndex();
    dropdownMenu.classList.remove('removed');

    let searchText = pokemonSelector.value.trim().toLowerCase().replaceAll(searchReplaceRegex, '').replaceAll('é', 'e');

    let empty = true;

    if(searchText) {
        data.pokemon.forEach(pokemon => {
            if(pokemon.id.includes(searchText)) {
                pokemon.el.classList.remove('removed');
                empty = false;
            } else {
                pokemon.el.classList.add('removed');
            }
        });
    } else {
        data.pokemon.forEach(pokemon => pokemon.el.classList.remove('removed'));
        empty = false;
    }

    if(empty) {
        noPokemonEl.classList.remove('removed');
    } else {
        noPokemonEl.classList.add('removed');
    }
}

function updatePokemon() {
    updateCosts();
}

function updateIv() {
    let atkValue = parseInt(atkSelector.value);
    let defValue = parseInt(defSelector.value);
    let hpValue = parseInt(hpSelector.value);

    let greatLevel = null;
    let ultraLevel = null;

    selectedAtk = atkValue >= 0 && atkValue <= 15 && atkValue % 1 === 0 ? atkValue : 15;
    selectedDef = defValue >= 0 && defValue <= 15 && defValue % 1 === 0 ? defValue : 15;
    selectedHp = hpValue >= 0 && hpValue <= 15 && hpValue % 1 === 0 ? hpValue : 15;

    data.levels.forEach((level, index) => {
        let cp = calculateCp(selectedPokemon, level.level, selectedAtk, selectedDef, selectedHp);

        if(cp > 1500 && !greatLevel && level.level <= 50) {
            greatLevel = data.levels[index - 1];
        }

        if(cp > 2500 && !ultraLevel && level.level <= 50) {
            ultraLevel = data.levels[index - 1];
        }

        level.el.children[1].innerText = cp;
    });

    if(!greatLevel) {
        greatLevel = data.levels[data.levels.length - 3];
    }

    if(!ultraLevel) {
        ultraLevel = data.levels[data.levels.length - 3];
    }
    
    for(let i = 0; i < 5; i++) {
        greatRow.children[i].innerText = greatLevel.el.children[i].innerText;
        ultraRow.children[i].innerText = ultraLevel.el.children[i].innerText;
    }

    if(selectedPokemon && selectedCp && !selectedLevel) {
        try {
            let level = getLevel(selectedPokemon, selectedCp, selectedAtk, selectedDef, selectedHp);
            selectedLevel = level.level;
            levelSelector.value = selectedLevel;
        } catch(e){
            selectedLevel = 0;
            levelSelector.value = '';
        }

        updateCosts();
    } else if(selectedPokemon && selectedLevel) {
        selectedCp = calculateCp(selectedPokemon, selectedLevel, selectedAtk, selectedDef, selectedHp);
        cpSelector.value = selectedCp;
    }
}

function updateLevel() {
    let level = parseFloat(levelSelector.value);

    if(level && level % 0.5 === 0 && level >= 1 && level <= 50) {
        selectedLevel = level;

        selectedCp = calculateCp(selectedPokemon, selectedLevel, selectedAtk, selectedDef, selectedHp);
        cpSelector.value = selectedCp;
    } else {
        selectedLevel = 0;
    }

    updateCosts();
}

function updateCp() {
    let cp = parseInt(cpSelector.value);

    if(cp && cp >= 10) {
        selectedCp = cp;

        try {
            let level = getLevel(selectedPokemon, selectedCp, selectedAtk, selectedDef, selectedHp);
            selectedLevel = level.level;
            levelSelector.value = selectedLevel;
        } catch(e){
            selectedLevel = 0;
            levelSelector.value = '';
        }

        updateCosts();
    } else {
        selectedCp = 0;
    }
}

function updateCosts() {
    if(!selectedPokemon) {
        return;
    }

    let runningStardustTotal = 0;
    let runningCandyTotal = 0;
    let runningXlTotal = 0;

    let greatLevel = null;
    let ultraLevel = null;

    let stardustMult = 1 * (isShadow ? 1.2 : 1) * (isPurified ? 0.9 : 1) * (isLucky ? 0.5 : 1);
    let candyMult = 1 * (isShadow ? 1.2 : 1) * (isPurified ? 0.9 : 1);

    data.levels.forEach((level, index) => {
        let el = level.el;

        if (index === 0) {
            return el.children[1].innerText = calculateCp(selectedPokemon, level.level, selectedAtk, selectedDef, selectedHp);
        }

        let cp = calculateCp(selectedPokemon, level.level, selectedAtk, selectedDef, selectedHp);

        el.children[1].innerText = calculateCp(selectedPokemon, level.level, selectedAtk, selectedDef, selectedHp);

        if(cp > 1500 && !greatLevel && level.level <= 50) {
            greatLevel = data.levels[index - 1];
        }

        if(cp > 2500 && !ultraLevel && level.level <= 50) {
            ultraLevel = data.levels[index - 1];
        }

        let previousLevel = data.levels[index - 1];

        if(level.level <= selectedLevel) {
            for(let i = 2; i < 5; i++) el.children[i].innerText = '';
        } else {
            runningStardustTotal += Math.ceil(previousLevel.stardust * stardustMult);
            runningCandyTotal += Math.ceil(previousLevel.candy * candyMult);
            runningXlTotal += Math.ceil(previousLevel.xl * candyMult);

            el.children[2].innerText = runningStardustTotal;
            el.children[3].innerText = runningCandyTotal;
            el.children[4].innerText = runningXlTotal || '';
        }
    });

    if(!greatLevel) {
        greatLevel = data.levels[data.levels.length - 3];
    }

    if(!ultraLevel) {
        ultraLevel = data.levels[data.levels.length - 3];
    }
    
    for(let i = 0; i < 5; i++) {
        greatRow.children[i].innerText = greatLevel.el.children[i].innerText;
        ultraRow.children[i].innerText = ultraLevel.el.children[i].innerText;
    }

    updateTarget();
}

// "level" is an entry from data.levels, not a number
function addRow(level) {
    let row = document.createElement('tr');

    addCell(row, level.level, 'level');
    addCell(row, '', 'cp');
    addCell(row, '', 'stardust');
    addCell(row, '', 'candy');
    addCell(row, '', 'xl');

    level.el = row;

    table.append(row);
}

function addCell(rowElement, content, className) {
    const element = document.createElement('td');

    element.innerText = content;
    element.title = content;

    if(className) {
        element.classList.add(className);
    }

    rowElement.append(element);

    return element;
}

function getLevel(pokemon, targetCp, atkIv = 15, defIv = 15, hpIv = 15) {
    let index = Math.floor(data.levels.length / 2);

    let cp = calculateCp(pokemon, data.levels[index].level, atkIv, defIv, hpIv);

    while(cp !== targetCp) {
        let oldCp = cp;

        if (cp > targetCp) {
            index--;

            if (index < 0) {
                throw new Error(`Could not find matching level for CP ${targetCp} with IVs ${atkIv}, ${defIv}, ${hpIv}. Somehow went past index 0`)
            }

            cp = calculateCp(pokemon, data.levels[index].level, atkIv, defIv, hpIv);

            if (cp < targetCp) {
                throw new Error(`Could not find matching level for CP ${targetCp} with IVs ${atkIv}, ${defIv}, ${hpIv}. Jumped from ${oldCp} to ${cp}`);
            }
        } else {
            index++;

            if (index >= data.levels.length) {
                throw new Error(`Could not find matching level for CP ${targetCp} with IVs ${atkIv}, ${defIv}, ${hpIv}. Somehow went past end of levels array, tried to access index ${index}`);
            }

            cp = calculateCp(pokemon, data.levels[index].level, atkIv, defIv, hpIv);

            if (cp > targetCp) {
                throw new Error(`Could not find matching level for CP ${targetCp} with IVs ${atkIv}, ${defIv}, ${hpIv}. Jumped from ${oldCp} to ${cp}`);
            }
        }
    }

    return data.levels[index];
}

function calculateCp(pokemon, level = 40, atkIv = 15, defIv = 15, hpIv = 15) {
	const cpMult = data.levels.find(x => x.level === level);

	if (!cpMult) {
		throw new Error(`No multiplier for level ${level}. Level must be between 1 and 51 inclusive, and be a multiple of 0.5`);
	}

	return Math.floor(Math.max(10, (pokemon.atk + atkIv) * Math.sqrt(pokemon.def + defIv) * Math.sqrt(pokemon.hp + hpIv) * Math.pow(cpMult.mult, 2) / 10));
}
