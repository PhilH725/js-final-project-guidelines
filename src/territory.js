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

    static anyActiveTerritories() {
      return !!this.all().find(ter => ter.active == true)
    }

  }
}

const Territory = createTerritory()
