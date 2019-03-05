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

    static all() {
      return allTerritories
    }

    static find(id) {
      return this.all().find(ter => ter.id == id)
    }

    static createTerritoriesFromDB(data) {
      data.forEach(ter => new Territory(ter))
    }

    static findActiveTerritory() {
      return this.all().find(ter => ter.active == true)
    }

    static removeAll() {
      allTerritories = []
    }

    hasNeighborX(id) {
      return this.neighbors.find(neighbor => neighbor.base_id == id)
    }

    attack(targ) {
      if (this.power > targ.power) {
        targ.player_id = this.player_id
        targ.power = Math.floor(this.power/2)
        this.power = Math.floor(this.power/2)
      } else {
        this.power = this.power - targ.power
      }
      this.patchAttack()
      targ.patchAttack()
    }

    patchAttack() {
      fetch(`http://localhost:3000/territories/${this.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          player_id: this.player_id,
          power: this.power,
          active: false
        })
      }).then(res => res.json())
      .then(getTerritories())
    }

  }
}

const Territory = createTerritory()
