let turn = 1

document.addEventListener('DOMContentLoaded', init)
const getBoard = () =>  document.getElementById('game-board')
let powerStore = 0

function init() {
  getTerritories()
  document.getElementById('end-btn').addEventListener('click', endTurn)
  setTextBox()
}

function getTerritories() {
  return fetch('http://localhost:3000/territories')
  .then(res => res.json())
  .then(json => renderGameBoard(json))
}

function renderGameBoard(territories) {
  getBoard().innerHTML = ''
  territories.forEach(renderTerritory)
}

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
      setPowerBar(ter, -1)
      updatePower(ter, -1)
      powerStore++
      setTextBox()
    }
  })

  plusBtn.addEventListener('click', ()=> {
    if (powerStore > 0) {
      setPowerBar(ter, 1)
      updatePower(ter, 1)
      powerStore--
      setTextBox()
    }
  })

  activeBtn.addEventListener('click', ()=> {selectTer(ter)})
  }

  // if (ter.inRange) {
  //   terDiv.appendChild(document.createElement('br'))
  //   attackBtn = document.createElement('button')
  //   terDiv.appendChild(attackBtn)
  //   attackBtn.innerText = 'Attack!'
  //   attackBtn.addEventListener('click', () => {attackTerritory(activeTerritory(), ter)})
  // }

  fillTerColor(ter)

}

function powerBar(ter) {
  return document.querySelector(`#power-${ter.id}`)
}

function setPowerBar(ter, num) {
  powerBar(ter).textContent = `Power: ${ter.power + num}`
}

function textBox() {
  return document.querySelector("#text-box")
}

function setTextBox() {
  textBox().textContent = `Available troops: ${powerStore}`
}

function fillTerColor(ter) {

  if (ter.active) {
    terDiv.style.backgroundColor = 'purple'
  } else {
  ter.player_id === 1 ? terDiv.style.backgroundColor = 'lightblue' : terDiv.style.backgroundColor = 'red'
  }

}

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

function endTurn() {
  turn === 1 ? turn = 2 : turn = 1
  document.getElementById('current-turn').innerText = `Player ${turn}'s turn`
  getTerritories()
}

/// conditionally render buttons (set turn variable, add end turn btn)
/// cap power allocation
/// ability to move troops to neighboring allied territories
