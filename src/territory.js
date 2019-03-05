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

    // static updateAll() {
    //   this.all().forEach (ter => {
    //     fetch(`http://localhost:3000/territories/${ter.id}`, {
    //       method: "PATCH",
    //       headers: {
    //         "Content-Type": "application/json",
    //         "Accept": "application/json"
    //       },
    //       body: JSON.stringify({
    //         player_id: ter.player_id,
    //         power: ter.power
    //       })
    //     })
    //   })
    // }

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

    hasNeighborX(id) {
      return this.neighbors.find(neighbor => neighbor.base_id == id)
    }

    attack(targ) {
      if (this.power > targ.power) {
        targ.player_id = this.player_id
        targ.power = Math.floor(this.power/2)
        this.power = Math.floor(this.power/2)
        fillTerColor(targ)
        addTerritoryButtons(targ)
      } else {
        this.power = this.power - targ.power
        if (this.power < 0) {
          this.player_id = targ.player_id
          this.power = 0
        }
      }
      setPowerBar(this)
      setPowerBar(targ)
      activeTerritory = null
      fillTerColor(this)
    }

  }
}

const Territory = createTerritory()
