// declare/set global variables
let turn = 1
let powerStore = 0
let activeTerritory

// retrieve page elements
const getBoard = () =>  document.getElementById('game-board')
const powerBar = (ter) => document.querySelector(`#power-${ter.id}`)
const textBox = () => document.querySelector("#text-box")
const endButton = () => document.getElementById('end-btn')
const territoryDiv = (ter) => document.querySelector(`#territory-${ter.id}`)
const neighborDiv = (ter) => document.querySelector(`#territory-${ter.base_id}`)
const divById = (id) => document.querySelector(`#territory-${id}`)
const newGameButton = () => document.getElementById('new-game')

// initialize page when content loads
document.addEventListener('DOMContentLoaded', init)

function init() {
  getTerritories()
  endButton().addEventListener('click', endTurn)
  setTextBox()
  getBoard().addEventListener('click', handleBoardClick)
  newGameButton().addEventListener('click', startNewGame)
}

function handleBoardClick(e) {
  if (e.target && e.target.className === "territory") {
    let ter = Territory.find(e.target.id.slice(10))
    if (ter.player_id == turn) {
      if (!activeTerritory || activeTerritory === ter) {
        selectTerritory(ter)
      }
    } else if (ter.player_id != turn && activeTerritory && activeTerritory.hasNeighborX(ter.id)) {
      activeTerritory.attack(ter)
    }
  } else if (e.target && e.target.nodeName === "BUTTON"){
    let ter = Territory.find(e.target.parentElement.id.slice(10))
    let power = powerBar(ter).textContent.slice(7)

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

  if (ter.player_id === turn) {
    minusBtn = document.createElement('button')
    terDiv.appendChild(minusBtn)
    minusBtn.innerText = '-'

    plusBtn = document.createElement('button')
    terDiv.appendChild(plusBtn)
    plusBtn.innerText = '+'

    terDiv.appendChild(document.createElement('br'))

    // activeBtn = document.createElement('button')
    // terDiv.appendChild(activeBtn)
    // activeBtn.innerText = 'Choose Territory'

    // activeBtn.addEventListener('click', ()=> {selectTer(ter)})
  }

  fillTerColor(ter)

}

// Set/reset territory's power
// function updatePower(territory, change) {
//   fetch(`http://localhost:3000/territories/${territory.id}`, {
//     method: "PATCH",
//     headers: {
//       "Content-Type": "application/json",
//       "Accept": "application/json"
//     },
//     body: JSON.stringify({power: territory.power += change})
//   })
// }

function alterPower(ter, num) {
  ter.power = ter.power + (num)
  setPowerBar(ter)
  powerStore = powerStore + (-num)
  setTextBox()
}

function setPowerBar(ter) {
  powerBar(ter).textContent = `Power: ${ter.power}`
}

function setTextBox() {
  textBox().textContent = `Available troops: ${powerStore}`
}

// Change active territory
function selectTerritory(ter) {
  // activeTerritory === ter ? activeTerritory = null : activeTerritory = ter
  if (activeTerritory === ter) {
    activeTerritory = null
    ter.neighbors.forEach(n => {
      // neighborDiv(n).style.border = "5px solid black"
      defaultBorder(n.base_id)
    })
  } else {
    activeTerritory = ter
    ter.neighbors.forEach(n => {
      if (Territory.find(n.base_id).player_id != ter.player_id) {
        // neighborDiv(n).style.border = "5px solid orange"
        attackBorder(n.base_id)
      }
    })
  }
  fillTerColor(ter)
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

//
function addTerritoryButtons(ter) {
  minusBtn = document.createElement('button')
  territoryDiv(ter).appendChild(minusBtn)
  minusBtn.innerText = '-'

  plusBtn = document.createElement('button')
  territoryDiv(ter).appendChild(plusBtn)
  plusBtn.innerText = '+'
}

// function removeTerritoryButtons(ter) {
//   territoryDiv(ter).children.
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


// fetch('http://localhost:3000/territories/2', {
//   method: "PATCH",
//   headers: {
//     "Content-Type": "application/json",
//     "Accept": "application/json"
//   },
//   body: JSON.stringify({
//     player_id: 2
//   })
// })

/// conditionally render buttons (set turn variable, add end turn btn)
/// cap power allocation
/// ability to move troops to neighboring allied territories
