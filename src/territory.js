function createTerritory() {
  let allTerritories = []

  return class {
    constructor(territoryData) {
      this.id = territoryData.id
      this.name = territoryData.name
      this.player_id = territoryData.player_id
      this.power = territoryData.power
      this.active = territoryData.active
      this.neighbors = territoryData.neighbors
      allTerritories.push(this)
    }

    // New items from db
    static createTerritoriesFromDB(data) {
      data.forEach(ter => new Territory(ter))
    }

    // Assign players random territories for new game
    static randomizePlayers() {
      let arr = shuffle([1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2])
      for (const index in arr) {
        let ter = Territory.find(parseInt(index) + 1)
        ter.player_id = arr[index]
      }
    }

    // Patch all territories at once at end of turn
    static updateAll() {
      let ta = Territory.all()
      fetch('http://localhost:3000/update/territories', {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ta})
      }).then(res => res.json())
      .then(json => renderGameBoard(json))
    }

    // Attack
    attack(targ) {
      let att = rollDice(this.power)
      let def = rollDice(targ.power) + 1
      let result
      let fadeImage

      if (att > def) {
        targ.player_id = this.player_id
        targ.power = this.power - Math.floor((def/att)*this.power)
        this.power = 1
        gameLog.push(`Player ${this.player_id} attacked ${targ.name} from ${this.name} and was successful! (Score: ${att} to ${def})`)
        fadeImage = divById(targ.id).cloneNode(true)
        fadeImage.id = 'minimap-image3'
        result = 'win'
      } else if (att === def) {
        this.power = Math.ceil(this.power/2)
        targ.power = Math.ceil(targ.power/2)
        gameLog.push(`Player ${this.player_id} attacked ${targ.name} from ${this.name}, but ${targ.name}'s troops defended their territory! (Score: ${att} to ${def})`)
        result = 'loss'

      } else {
        gameLog.push(`Player ${this.player_id} attacked ${targ.name} from ${this.name}, but ${targ.name}'s troops defended their territory! (Score: ${att} to ${def})`)
        this.power = 1
        targ.power = targ.power - Math.floor((att/def)*targ.power)
        result = 'loss'
      }

      activeTerritory.neighbors.forEach(n => defaultBorder(n.base_id))
      activeTerritory = null

      fillTerColor(this)
      fillTerColor(targ)

      defaultBorder(this.id)
      defaultBorder(targ.id)

      if (Territory.playerTerritories(this.player_id) === 22) {
        // window.alert(`Player ${this.player_id} wins!`)
        let h4 = document.createElement('h4')
        h4.textContent = `Player ${this.player_id} wins!`
        // debugger
        document.querySelector(".modal-content").appendChild(h4)
        winModal().style.display = "block"
      }

      result === 'win' ? setHudBox(targ, result, fadeImage) : setHudBox(this, result)

      scrollNum = 2
      displayGameLog(2)
    }

    // Class helper methods
    static all() {
      return allTerritories
    }

    static find(id) {
      return this.all().find(ter => ter.id == id)
    }

    static findActiveTerritory() {
      return this.all().find(ter => ter.active == true)
    }

    static removeAll() {
      allTerritories = []
    }

    static resetPower() {
      this.all().forEach(t => t.power = 5)
    }

    static playerTerritories(id) {
      return this.all().filter(t => t.player_id === id).length
    }

    // Helper instance methods

    hasNeighborX(id) {
      return this.neighbors.find(neighbor => neighbor.base_id == id)
    }

  }
}

const Territory = createTerritory()
