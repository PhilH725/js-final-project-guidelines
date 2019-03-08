// declare/set global variables
let turn = 1
let powerStore = 0
let gameLog = []
let scrollNum = 2
let gamePhase = "deploy"
let activeTerritory

// retrieve page elements
const board = () =>  document.getElementById('game-board')
const textBox = () => document.querySelector("#text-box")
const troopsBar = () => document.querySelector("#troops-bar")
const divById = (id) => document.querySelector(`#map-ter-${id} > *:not(text)`)
const newGameButton = () => document.getElementById('new-game')
const hudBox = () => document.getElementById('hud-box')
const log1 = () => document.querySelector('#log-1')
const log2 = () => document.querySelector('#log-2')
const scrollUp = () => document.querySelector('#scroll-up')
const scrollDown = () => document.querySelector('#scroll-down')
const phaseButton = () => document.querySelector('#phase-btn')

// initialize page when content loads
document.addEventListener('DOMContentLoaded', init)

function init() {
  getTerritories()
  setTroopsBar()
  board().addEventListener('click', handleBoardClick)
  addPowerAdjusters()
  hudBox().addEventListener('click', handlePowerClick)
  newGameButton().addEventListener('click', startNewGame)
  scrollUp().addEventListener('click', handleScroll)
  scrollDown().addEventListener('click', handleScroll)
  document.querySelector('#up-icon').addEventListener('click', handleScroll)
  document.querySelector('#down-icon').addEventListener('click', handleScroll)
  phaseButton().addEventListener('click', handlePhaseClick)
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
  troopsBar().textContent = `Deployable Troops: ${powerStore}`
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

function setHudBox(ter, result=null, fadeImage=null) {

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

  let resultBar = document.getElementById('battle-result')
  resultBar.innerText = ''

  if (result === 'loss') {
    resultBar.innerText = 'Attack failed!'
    resultBar.style.color='red'
  } else if (result === 'win') {
    hudImage = document.getElementById('minimap-image')
    updateHudImage(ter, copy, fadeImage, hudMap)
    resultBar.innerText = 'Successful Attack!'
    resultBar.style.color='green'
  }
}

function updateHudImage(ter, copy, fadeImage, hudMap) {
  hudMap.innerHTML = ''

  let copy2 = divById(ter.id).cloneNode(true)
  copy2.id = 'minimap-image2'
  copy2.style.strokeWidth = '1'
  hudMap.appendChild(copy2)

  hudMap.appendChild(fadeImage)
  removeOldTer(fadeImage)

}

function removeOldTer(el) {
  //makes the opacity of the covering image 0, revealing the other. supposed to fade, but right now it just flashes
  setTimeout(()=>{
    el.style.opacity=0}, 750)
  }

function resetHud() {

  document.getElementById('hud-title').innerText = 'Choose a territory'
  document.getElementById('hud-map').innerHTML = ''
  document.getElementById('hud-power-info').innerText = 'Power: ~'
  document.getElementById('battle-result').innerText = ''
}

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
    let rg = 110 - (11 * ter.power)
    divById(ter.id).style.fill = `rgb(${rg},${rg},150)`
  } else {
    // let blue = 140 - (7 * ter.power)
    // let green = blue + 30
    let gb = 150 - (15 * ter.power)
    divById(ter.id).style.fill = `rgb(255,${gb},${gb})`
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

    } else if (ter.player_id != turn && activeTerritory && activeTerritory.hasNeighborX(ter.id) && activeTerritory.power > 1 && gamePhase === "attack") {
      activeTerritory.attack(ter)
    }

  }
}

function handlePowerClick(e) {
  if (e.target && e.target.nodeName === "BUTTON") {

    if (e.target.textContent === "-" && activeTerritory.power > 1) {
      alterPower(activeTerritory, -1)

    } else if (e.target.textContent === "+" && powerStore > 0 && activeTerritory.power < 10) {
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

function handlePhaseClick() {
  if (gamePhase === "deploy") {
    gamePhase = "attack"
    phaseButton().textContent = "End turn"
    document.querySelector('#power-adjust-wrapper').removeChild(document.querySelector('#power-adjust-div'))
  } else {
    gamePhase = "deploy"
    phaseButton().textContent = "Begin attack phase"
    endTurn()
    addPowerAdjusters()
  }
}

function addPowerAdjusters() {
  let div = document.createElement('div')
  div.id = "power-adjust-div"
  let span = document.createElement('span')
  span.textContent = "Adjust Power"
  span.id = "adj-power"
  let inc = document.createElement('button')
  inc.textContent = "+"
  inc.id = "increase"
  let dec = document.createElement('button')
  dec.textContent = "-"
  dec.id = "decrease"

  div.appendChild(span)
  div.appendChild(dec)
  div.appendChild(inc)
  document.querySelector('#power-adjust-wrapper').appendChild(div)
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
  resetHud()
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

  //cap troop loss for successful attack/defense
  //failed attack leading to 1/1 power leads to all ters being low power


//cant minus power under 3?

//random starting power? (still equals same amount, but 4-6 range instead of all 5)



//
