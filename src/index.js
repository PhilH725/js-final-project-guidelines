// declare/set global variables
let turn = 1
let powerStore = 0
let gameLog = []
let scrollNum = 2
let activeTerritory

// retrieve page elements
const board = () =>  document.getElementById('game-board')
const textBox = () => document.querySelector("#text-box")
const troopsBar = () => document.querySelector("#troops-bar")
const endButton = () => document.getElementById('end-btn')
const divById = (id) => document.querySelector(`#map-ter-${id} > *:not(text)`)
const newGameButton = () => document.getElementById('new-game')
// const activeBar = () => document.getElementById('active-ter-specifics')
const hudBox = () => document.getElementById('hud-box')
const log1 = () => document.querySelector('#log-1')
const log2 = () => document.querySelector('#log-2')
const scrollUp = () => document.querySelector('#scroll-up')
const scrollDown = () => document.querySelector('#scroll-down')

// initialize page when content loads
document.addEventListener('DOMContentLoaded', init)

function init() {
  getTerritories()
  setTroopsBar()
  endButton().addEventListener('click', endTurn)
  board().addEventListener('click', handleBoardClick)
  hudBox().addEventListener('click', handlePowerClick)
  newGameButton().addEventListener('click', startNewGame)
  scrollUp().addEventListener('click', handleScroll)
  scrollDown().addEventListener('click', handleScroll)
  document.querySelector('#up-icon').addEventListener('click', handleScroll)
  document.querySelector('#down-icon').addEventListener('click', handleScroll)
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
  territories.forEach(renderTerritory)
}

// render each territory
function renderTerritory(ter) {
  defaultBorder(ter.id)
  fillTerColor(ter)

}

function alterPower(ter, num) {
  ter.power = ter.power + (num)
  powerStore = powerStore + (-num)
  document.querySelector('#hud-power-info').textContent = `Power: ${ter.power}`
  setTroopsBar()
  fillTerColor(ter)
}

function setTroopsBar() {
  troopsBar().textContent = `${powerStore}`
}

// Toggle active territory
function toggleActive(ter) {
  if (activeTerritory === ter) {
    activeTerritory = null
    defaultBorder(ter.id)
    ter.neighbors.forEach(n => {
      defaultBorder(n.base_id)
    })
  } else {
    activeTerritory = ter
    activeBorder(ter.id)
    if (ter.power > 1) {
      ter.neighbors.forEach(n => {
        if (Territory.find(n.base_id).player_id != ter.player_id) {
          attackBorder(n.base_id)
        }
      })
    }
    setHudBox(ter)
  }
}

function setHudBox(ter) {

  let hudTerName = document.getElementById('hud-title')
  hudTerName.innerText = ter.name

  let hudMap = document.getElementById('hud-map')
  hudMap.innerHTML = ''

  let copy = divById(ter.id).cloneNode(true)
  copy.id = 'minimap-image'
  copy.style.strokeWidth = '1'

  hudMap.appendChild(copy)

  let powerEl = document.getElementById('hud-power-info')
  powerEl.innerText = `Power: ${ter.power}`
}

// function setTerritorySidebar(ter) {
//   clear(activeBar())
//
//   p = document.createElement('p')
//   p.textContent = `Adjust power in territory ${ter.id}: `
//   activeBar().appendChild(p)
//
//   minusBtn = document.createElement('button')
//   activeBar().appendChild(minusBtn)
//   minusBtn.textContent = '-'
//
//   plusBtn = document.createElement('button')
//   activeBar().appendChild(plusBtn)
//   plusBtn.textContent = '+'
// }

// Style based on game state
function defaultBorder(id) {
  divById(id).style.stroke = 'black'
  divById(id).style.strokeWidth = '2px'
}

function attackBorder(id) {
  divById(id).style.stroke = 'pink'
  divById(id).style.strokeWidth = '4px'
}

function activeBorder(id) {
  divById(id).style.stroke = '#FFA20F'
  divById(id).style.strokeWidth = '4px'
}

function fillTerColor(ter) {
  if (ter.player_id === 1) {
    let rg = 160 - (8 * ter.power)
    divById(ter.id).style.fill = `rgb(${rg},${rg},255)`
  } else {
    let blue = 140 - (7 * ter.power)
    let green = blue + 30
    divById(ter.id).style.fill = `rgb(255,${green},${blue})`
  }
}

// Handle click events for territories and power increment buttons
function handleBoardClick(e) {

  if (e.target && e.target.parentElement.parentElement.id === 'map') {
    let ter = Territory.find(e.target.id)

    if (ter.player_id == turn) {

      if (!activeTerritory || activeTerritory === ter) {
        toggleActive(ter)

      } else if (activeTerritory.player_id === ter.player_id) {
        toggleActive(activeTerritory)
        toggleActive(ter)
      }

    } else if (ter.player_id != turn && activeTerritory && activeTerritory.hasNeighborX(ter.id) && activeTerritory.power > 1) {
      activeTerritory.attack(ter)
    }

  }
}

function handlePowerClick(e) {
  if (e.target && e.target.nodeName === "BUTTON") {

    if (e.target.textContent === "-" && activeTerritory.power > 1) {
      alterPower(activeTerritory, -1)

    } else if (e.target.textContent === "+" && powerStore > 0) {
      alterPower(activeTerritory, 1)
    }

  }
}

function handleScroll(e) {
  if (e.target.id === 'scroll-up' || e.target.id === 'up-icon') {
    if (scrollNum < gameLog.length) {
      displayGameLog(++scrollNum)
    }
  } else {
    if (scrollNum > 2) {
      displayGameLog(--scrollNum)
    }
  }
}

// Display game log
function displayGameLog(num) {
  log2().textContent = gameLog[gameLog.length-(num)]
  log1().textContent = gameLog[gameLog.length-(num-1)]
}

// Change turn state
function endTurn() {
  gameLog.push(`Player ${turn}'s turn ended.`)
  displayGameLog(2)

  turn === 1 ? turn = 2 : turn = 1
  document.getElementById('current-turn').innerText = `Player ${turn}'s turn`

  if (activeTerritory) {
    activeTerritory = null
  }

  Territory.updateAll()
  powerStore = 10
  setTroopsBar()
}

// Start new game
function startNewGame() {
  Territory.resetPower()
  Territory.randomizePlayers()
  Territory.updateAll()
  gameLog = ["New game! Player 1 and Player 2 are competing to JSON Derule the World!"]

  turn = 1
  document.getElementById('current-turn').innerText = `Player ${turn}'s turn`

  scrollNum = 2
  displayGameLog(2)
}

// Helpers
function clear(area) {
  while (area.firstChild) {
    area.removeChild(area.firstChild)
  }
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

function rollDice(num) {
  max = num*3
  return Math.floor(Math.random() * (max - num)) + num
}
