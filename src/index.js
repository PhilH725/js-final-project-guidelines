// declare/set global variables
let turn = 1
let powerStore = 0
let activeTerritory

// retrieve page elements
const board = () =>  document.getElementById('game-board')
const powerBar = (ter) => document.querySelector(`#power-${ter.id}`)
const textBox = () => document.querySelector("#text-box")
const troopsBar = () => document.querySelector("#troop-level")
const endButton = () => document.getElementById('end-btn')
const divById = (id) => document.querySelector(`#territory-${id}`)
const newGameButton = () => document.getElementById('new-game')
const activeBar = () => document.getElementById('active-ter-specifics')

// initialize page when content loads
document.addEventListener('DOMContentLoaded', init)

function init() {
  getTerritories()
  endButton().addEventListener('click', endTurn)
  setTroopsBar()
  board().addEventListener('click', handleBoardClick)
  activeBar().addEventListener('click', handlePowerClick)
  newGameButton().addEventListener('click', startNewGame)
}

function handleBoardClick(e) {
  if (e.target && e.target.className === "territory") {
    let ter = Territory.find(e.target.id.slice(10))
    if (ter.player_id == turn) {
      if (!activeTerritory || activeTerritory === ter) {
        clear(activeBar())
        selectTerritory(ter)
      } else if (activeTerritory.player_id === ter.player_id) {
        clear(activeBar())
        selectTerritory(activeTerritory)
        selectTerritory(ter)
      }
    } else if (ter.player_id != turn && activeTerritory && activeTerritory.hasNeighborX(ter.id)) {
      activeTerritory.attack(ter)
    }
  }
}

function handlePowerClick(e) {
  if (e.target && e.target.nodeName === "BUTTON"){
    let ter = activeTerritory
    let power = activeTerritory.power

    if (e.target.textContent === "-" && power > 0) {
      alterPower(ter, -1)
    } else if (e.target.textContent === "+" && powerStore > 0) {
      alterPower(ter, 1)
    }
  }
}

// fetch territories from db
function getTerritories() {
  return fetch('http://localhost:3000/territories')
  .then(res => res.json())
  .then(territoryData => {
    Territory.createTerritoriesFromDB(territoryData)
    renderGameBoard(territoryData)
  })
}

// iterate through territories to create game board
function renderGameBoard(territories) {
  board().innerHTML = ''
  territories.forEach(renderTerritory)
}

// render each territory
function renderTerritory(ter) {

  terDiv = document.createElement('div')
  board().appendChild(terDiv)
  terDiv.classList.add('territory')

  terName = document.createElement('h3')
  terDiv.appendChild(terName)
  terDiv.id = `territory-${ter.id}`
  terName.innerText = `Territory ${ter.id}`

  powerEl = document.createElement('p')
  powerEl.id = `power-${ter.id}`
  terDiv.appendChild(powerEl)
  powerEl.innerText = `Power: ${ter.power} `

  fillTerColor(ter)

}

function alterPower(ter, num) {
  ter.power = ter.power + (num)
  setPowerBar(ter)
  powerStore = powerStore + (-num)
  setTroopsBar()
  fillTerColor(ter)
}

function setPowerBar(ter) {
  powerBar(ter).textContent = `Power: ${ter.power}`
}

function setTroopsBar() {
  troopsBar().textContent = `Available troops: ${powerStore}`
}

// Change active territory
function selectTerritory(ter) {
  if (activeTerritory === ter) {
    activeTerritory = null
    defaultBorder(ter.id)
    ter.neighbors.forEach(n => {
      defaultBorder(n.base_id)
    })
  } else {
    activeTerritory = ter
    activeBorder(ter.id)
    ter.neighbors.forEach(n => {
      if (Territory.find(n.base_id).player_id != ter.player_id) {
        attackBorder(n.base_id)
      }
    })
    setTerritorySidebar(ter)
  }
}

function setTerritorySidebar(ter) {
  clear(activeBar())

  p = document.createElement('p')
  p.textContent = `Adjust power in territory ${ter.id}: `
  activeBar().appendChild(p)

  minusBtn = document.createElement('button')
  activeBar().appendChild(minusBtn)
  minusBtn.textContent = '-'

  plusBtn = document.createElement('button')
  activeBar().appendChild(plusBtn)
  plusBtn.textContent = '+'
}

function defaultBorder(id) {
  divById(id).style.border = "5px solid black"
}

function attackBorder(id) {
  divById(id).style.border = "5px solid #27C26A"
}

function activeBorder(id) {
  divById(id).style.border = "5px solid #FF9D0F"
}

function fillTerColor(ter) {
  let terDiv = document.querySelector(`#territory-${ter.id}`)

  if (ter.player_id === 1) {
    switch (ter.power) {
      case 4:
        terDiv.style.backgroundColor = 'rgba(61,119,191,0.8)'
        break
      case 3:
        terDiv.style.backgroundColor = 'rgba(61,119,191,0.6)'
        break
      case 2:
        terDiv.style.backgroundColor = 'rgba(61,119,191,0.4)'
        break
      case 1:
        terDiv.style.backgroundColor = 'rgba(61,119,191,0.2)'
        break
      case 0:
        terDiv.style.backgroundColor = 'rgba(61,119,191,0)'
        break
      default:
        terDiv.style.backgroundColor = 'rgba(61,119,191,1)'
    }
  } else {
    switch (ter.power) {
      case 4:
        terDiv.style.backgroundColor = 'rgba(178,28,0,0.8)'
        break
      case 3:
        terDiv.style.backgroundColor = 'rgba(178,28,0,0.6)'
        break
      case 2:
        terDiv.style.backgroundColor = 'rgba(178,28,0,0.4)'
        break
      case 1:
        terDiv.style.backgroundColor = 'rgba(178,28,0,0.2)'
        break
      case 0:
        terDiv.style.backgroundColor = 'rgba(178,28,0,0)'
        break
      default:
        terDiv.style.backgroundColor = 'rgba(178,28,0,1)'
    }
  }
}

// Change turn state
function endTurn() {
  turn === 1 ? turn = 2 : turn = 1
  document.getElementById('current-turn').innerText = `Player ${turn}'s turn`

  if (activeTerritory) {
    activeTerritory = null
  }

  Territory.updateAll()
}

// Start new game
function startNewGame() {
  Territory.resetPower()
  Territory.randomizePlayers()
  Territory.updateAll()
}

function shuffle(array) {
  var l = array.length, t, i;
  while (l) {
    i = Math.floor(Math.random() * l--);
    t = array[l];
    array[l] = array[i];
    array[i] = t;
  }
  return array;
}

// Helpers
function clear(area) {
  while (area.firstChild) {
    area.removeChild(area.firstChild)
  }
}

/// conditionally render buttons (set turn variable, add end turn btn)
/// cap power allocation
/// ability to move troops to neighboring allied territories
