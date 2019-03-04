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
}

// fetch territories from db
function getTerritories() {
  return fetch('http://localhost:3000/territories')
  .then(res => res.json())
  .then(json => renderGameBoard(json))
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

  activeBtn = document.createElement('button')
  terDiv.appendChild(activeBtn)
  activeBtn.innerText = 'Choose Territory'

  minusBtn.addEventListener('click', ()=> {
    if (ter.power > 0) {
      alterPower(ter, -1)
    }
  })

  plusBtn.addEventListener('click', ()=> {
    if (powerStore > 0) {
      alterPower(ter, 1)
    }
  })

  activeBtn.addEventListener('click', ()=> {selectTer(ter)})
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

// Change background based on active
function fillTerColor(ter) {

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
  getTerritories()
}

/// conditionally render buttons (set turn variable, add end turn btn)
/// cap power allocation
/// ability to move troops to neighboring allied territories
