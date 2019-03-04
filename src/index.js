
const getBoard = () =>  document.getElementById('game-board')
const getGameText = () => document.getElementById('game-text')

const activeTerritory = () => {
  return tempTer.find(i => i.active)
}

const tempTer = [
  {
    id: 1,
    neighbors: [2,3],
    power: 3,
    ally: true,
    active: false,
    inRange: false
  },
  {
    id: 2,
    neighbors: [1,4],
    power: 3,
    ally: false,
    active: false,
    inRange: false
  },
  {
    id: 3,
    neighbors: [1,4],
    power: 3,
    ally: false,
    active: false,
    inRange: false
  },
  {
    id: 4,
    neighbors: [2,3],
    power: 3,
    ally: true,
    active: false,
    inRange: false
  }
]

document.addEventListener('DOMContentLoaded', init)

function init() {
  renderGameBoard()

}

function renderGameBoard() {
  getBoard().innerHTML = ''

  tempTer.forEach(renderTerritory)

  document.getElementById('text-box').innerHTML = ''

  gameText = document.createElement('p')
  document.getElementById('text-box').appendChild(gameText)
  gameText.id = 'game-text'
  gameText.innerText = 'Player 1, choose your attacking territory'
}

function renderTerritory(ter) {

  // Array.from(document.getElementById('game-board').children).map(i=>i.id).includes(ter.id) ?

  terDiv = document.createElement('div')
  getBoard().appendChild(terDiv)
  terDiv.classList.add('territory')

  terName = document.createElement('h3')
  terDiv.appendChild(terName)
  terDiv.id = `territory-${ter.id}`
  terName.innerText = `Territory ${ter.id}`

  powerEl = document.createElement('p')
  terDiv.appendChild(powerEl)
  powerEl.innerText = `Power: ${ter.power} `

  minusBtn = document.createElement('button')
  powerEl.appendChild(minusBtn)
  minusBtn.innerText = '-'

  plusBtn = document.createElement('button')
  powerEl.appendChild(plusBtn)
  plusBtn.innerText = '+'

  terDiv.appendChild(document.createElement('br'))

  activeBtn = document.createElement('button')
  terDiv.appendChild(activeBtn)
  activeBtn.innerText = 'Choose Territory'

  if (ter.inRange) {
    terDiv.appendChild(document.createElement('br'))
    attackBtn = document.createElement('button')
    terDiv.appendChild(attackBtn)
    attackBtn.innerText = 'Attack!'
    attackBtn.addEventListener('click', () => {attackTerritory(activeTerritory(), ter)})
  }

  fillTerColor(ter)

  minusBtn.addEventListener('click', ()=> {modifyPower(ter, -1)})

  plusBtn.addEventListener('click', ()=> {modifyPower(ter, 1)})

  activeBtn.addEventListener('click', ()=> {selectTer(ter)})
}

function fillTerColor(ter) {

  if (ter.active) {
    terDiv.style.backgroundColor = 'purple'
  } else {
  ter.ally ? terDiv.style.backgroundColor = 'lightblue' : terDiv.style.backgroundColor = 'red'
  }

}

function modifyPower(ter, change) {
  for (const i of tempTer) {
    if (i.id === ter.id) {
      i.power += change
    }
  }
  renderGameBoard()
}

function selectTer(ter) {
  for (const i of tempTer) {
    if (i.id === ter.id) {
      i.active = true
      setAttackRange(i)
    } else {
      i.active = false
    }
  }
  renderGameBoard()
}

function setAttackRange(ter) {
  // debugger
  for (const i of tempTer) {
    if (ter.neighbors.includes(i.id) && i.ally !== ter.ally) {
      i.inRange = true
    }
  }
}

function attackTerritory(attacker, defender) {
  let atk = attacker.power
  let def = defender.power
  for (const i of tempTer) {
    i.active = false
    i.inRange = false
    if (i.id === defender.id) {
      // getGameText().innerText = `${attacker.id} is attacking ${defender.id}`
      console.log(`${attacker.id} is attacking ${defender.id}`)
      console.log(processAttack(atk, def))
      atk > def ? i.ally = !i.ally : ''
    }
  }
  renderGameBoard()
}

function processAttack(atk, def) {
  let message
  atk > def ? message = 'successful attack!' : message = 'attack failed'
  return message
}





//
