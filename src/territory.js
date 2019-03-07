function createTerritory() {
  let allTerritories = []

  return class {
    constructor(territoryData) {
      this.id = territoryData.id
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
      let def = rollDice(targ.power)

      if (att > def) {
        targ.player_id = this.player_id
        targ.power = this.power - Math.round((def/att)*this.power)
        this.power = 1

      } else if (att === def) {
        this.power = Math.floor(this.power/2)
        targ.power = Math.floor(targ.power/2)

      } else {
        this.power = 1
        targ.power = targ.power - Math.round((att/def)*targ.power) - 1
      }

      setPowerBar(this)
      setPowerBar(targ)

      activeTerritory.neighbors.forEach(n => defaultBorder(n.base_id)
      activeTerritory = null

      fillTerColor(this)
      fillTerColor(targ)

      defaultBorder(this.id)
      defaultBorder(targ.id)
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

    // Helper instance methods

    hasNeighborX(id) {
      return this.neighbors.find(neighbor => neighbor.base_id == id)
    }

  }
}

const Territory = createTerritory()
