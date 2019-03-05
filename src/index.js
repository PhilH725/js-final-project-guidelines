// declare/set global variables
let turn = 1
let powerStore = 0

// retrieve page elements
const getBoard = () =>  document.getElementById('game-board')
const powerBar = (ter) => document.querySelector(`#power-${ter.id}`)
const textBox = () => document.querySelector("#text-box")
const endButton = () => document.getElementById('end-btn')

// initialize page when content loads
document.addEventListener('DOMContentLoaded', init)

function init() {
  getTerritories()
  endButton().addEventListener('click', endTurn)
  setTextBox()
  getBoard().addEventListener('click', handleBoardClick)
}

function handleBoardClick(e) {
  if (e.target && e.target.className === "territory") {
    let ter = Territory.find(e.target.id.slice(10))
    if (ter.player_id == turn) {
      if (!Territory.findActiveTerritory() || ter.active == true) {
        selectTerritory(ter)
      }
    } else if (ter.player_id != turn && Territory.findActiveTerritory().hasNeighborX(ter.id)) {
      Territory.findActiveTerritory().attack(ter)
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
function updatePower(territory, change) {
  fetch(`http://localhost:3000/territories/${territory.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({power: territory.power += change})
  })
}

function alterPower(ter, num) {
  setPowerBar(ter, num)
  updatePower(ter, num)
  powerStore = powerStore + (-num)
  setTextBox()
}

function setPowerBar(ter, num) {
  powerBar(ter).textContent = `Power: ${ter.power + num}`
}

function setTextBox() {
  textBox().textContent = `Available troops: ${powerStore}`
}

// Change active territory
function selectTerritory(ter) {
 ter.active = !ter.active
 fetch(`http://localhost:3000/territories/${ter.id}`, {
   method: "PATCH",
   headers: {
     "Content-Type": "application/json",
     "Accept": "application/json"
   },
   body: JSON.stringify({active: ter.active})
 }).then(res => res.json())
 .then(ter => fillTerColor(ter))
}

function fillTerColor(ter) {
  let terDiv = document.querySelector(`#territory-${ter.id}`)

  if (ter.active) {
    terDiv.style.backgroundColor = 'purple'
  } else {
  ter.player_id === 1 ? terDiv.style.backgroundColor = 'lightblue' : terDiv.style.backgroundColor = 'red'
  }

}

// Change turn state
function endTurn() {
  turn === 1 ? turn = 2 : turn = 1
  document.getElementById('current-turn').innerText = `Player ${turn}'s turn`

  let ter = Territory.findActiveTerritory()
  if (ter) {
    ter.active = !ter.active
    fetch(`http://localhost:3000/territories/${ter.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({active: ter.active})
    }).then(res => res.json())
    .then(ter => {
      fillTerColor(ter)
      Territory.removeAll()
      getTerritories()
    })
  } else {
    getTerritories()
  }
  // if (Territory.findActiveTerritory()) {
  //
  //   var p = new Promise((resolve, reject) => resolve(selectTerritory(Territory.findActiveTerritory())))
  //   p.then(Territory.removeAll()).then(getTerritories()).then(console.log(`after promise: ${Territory.findActiveTerritory()}`))
  //   // selectTerritory(Territory.findActiveTerritory())
  // } else {
  //   getTerritories()
  // }
  // console.log(`after get ter: ${Territory.findActiveTerritory()}`)
  // Territory.removeAll()
  // getTerritories()
}

/// conditionally render buttons (set turn variable, add end turn btn)
/// cap power allocation
/// ability to move troops to neighboring allied territories
