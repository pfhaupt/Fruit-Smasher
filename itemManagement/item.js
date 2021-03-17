let itemsPerZone = 10;

let itemWeight = [
  [100, 100, 25, 50, 10, 10, 1, 1, 1, 1],
  [100, 100, 25, 50, 10, 10, 1, 1, 1, 1],
  [100, 100, 25, 50, 10, 10, 1, 1, 1, 1],
  [100, 100, 25, 50, 10, 10, 1, 1, 1, 1],
  [100, 100, 25, 50, 10, 10, 1, 1, 1, 1],
  [100, 100, 25, 50, 10, 10, 1, 1, 1, 1],
  [100, 100, 25, 50, 10, 10, 1, 1, 1, 1],
  [100, 100, 25, 50, 10, 10, 1, 1, 1, 1],
];

class Item {
  constructor(id, name, imgSrc, equipmentSlot, maxLevel, boost, bonus, effect) {
    this.id = id ?? -1;
    this.name = name ?? "";
    this.img = createImg(imgSrc, "");
    this.img.hide();
    this.equipmentSlot = equipmentSlot ?? -1;
    this.level = 0;
    this.maxLevel = maxLevel;
    this.unlocked = false;
    this.canDrop = true;
    this.boost = boost ?? [];
    this.baseBonus = bonus ?? [];
    this.currentBonus = this.baseBonus;
    this.effect = effect ?? [];

    this.createTooltip();

    /*
    Grundidee:
    [bonus] für [boost] ist [effect]
    z.B: "5" für "Damage" ist "multiplikativ"
    -> bei den Total Stats wird Damage x5 gerechnet
    anderes Bsp: "2.75" für "Regen" ist "additiv"
    -> bei den Total Stats wird zur Regen (vor den multiplikativen Boni) +2.75 gerechnet
    Total Stats = (playerStats + additiveItems) * multiplicativeItems
    */
  }

  createTooltip() {
    let s = "";
    s += "Item Name: " + this.name;
    s += "\n";
    s += "Item Level " + this.level + " of " + this.maxLevel;
    s += "\n";
    for (let i = 0; i < this.boost.length; i++) {
      let symbol = this.effect[i] === 0 ? "+" : "x";
      s += (this.boost[i][0].toUpperCase() + this.boost[i].substr(1)) + " Boost: " + symbol + this.currentBonus[i] + "\n";
    }

    this.img.attribute("title", s);
  }

  calculateCurrentBonus() {
    for (let i = 0; i < this.boost.length; i++) {
      this.currentBonus[i] = this.bonus[i] * (1 + this.level / this.maxLevel);
    }
  }
}
