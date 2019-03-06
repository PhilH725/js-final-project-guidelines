// declare/set global variables
let turn = 1
let powerStore = 0
let activeTerritory

// retrieve page elements
const getBoard = () =>  document.getElementById('game-board')
const powerBar = (ter) => document.querySelector(`#power-${ter.id}`)
const textBox = () => document.querySelector("#text-box")
const troopsBar = () => document.querySelector("#troop-level")
const endButton = () => document.getElementById('end-btn')
const territoryDiv = (ter) => document.querySelector(`#territory-${ter.id}`)
const neighborDiv = (ter) => document.querySelector(`#territory-${ter.base_id}`)
const divById = (id) => document.querySelector(`#territory-${id}`)
const newGameButton = () => document.getElementById('new-game')
const activeBar = () => document.getElementById('active-ter-specifics')

// initialize page when content loads
document.addEventListener('DOMContentLoaded', init)

function init() {
  getTerritories()
  endButton().addEventListener('click', endTurn)
  setTroopsBar()
  getBoard().addEventListener('click', handleBoardClick)
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
  getBoard().innerHTML = ''
  territories.forEach(renderTerritory)
}

// render each territory
function renderTerritory(ter) {

  terDiv = document.createElement('div')
  getBoard().appendChild(terDiv)
  terDiv.classList.add('territory')

  terName = document.createElement('h3')
  terDiv.appendChild(terName)
  terDiv.id = `territory-${ter.id}`
  terName.innerText = `Territory ${ter.id}`

  powerEl = document.createElement('p')
  powerEl.id = `power-${ter.id}`
  terDiv.appendChild(powerEl)
  powerEl.innerText = `Power: ${ter.power} `

  // if (ter.player_id === turn) {
  //   minusBtn = document.createElement('button')
  //   terDiv.appendChild(minusBtn)
  //   minusBtn.innerText = '-'
  //
  //   plusBtn = document.createElement('button')
  //   terDiv.appendChild(plusBtn)
  //   plusBtn.innerText = '+'
  // }

  fillTerColor(ter)

}

function alterPower(ter, num) {
  ter.power = ter.power + (num)
  setPowerBar(ter)
  powerStore = powerStore + (-num)
  setTroopsBar()
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
    ter.neighbors.forEach(n => {
      defaultBorder(n.base_id)
    })
  } else {
    activeTerritory = ter
    ter.neighbors.forEach(n => {
      if (Territory.find(n.base_id).player_id != ter.player_id) {
        attackBorder(n.base_id)
      }
    })
    setTerritorySidebar(ter)
  }
  fillTerColor(ter)
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
  divById(id).style.border = "5px solid orange"
}

function fillTerColor(ter) {
  let terDiv = document.querySelector(`#territory-${ter.id}`)

  if (activeTerritory === ter) {
    terDiv.style.backgroundColor = 'purple'
  } else {
  ter.player_id === 1 ? terDiv.style.backgroundColor = 'lightblue' : terDiv.style.backgroundColor = 'red'
  }
}


// function addTerritoryButtons(ter) {
//   minusBtn = document.createElement('button')
//   territoryDiv(ter).appendChild(minusBtn)
//   minusBtn.innerText = '-'
//
//   plusBtn = document.createElement('button')
//   territoryDiv(ter).appendChild(plusBtn)
//   plusBtn.innerText = '+'
// }

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
