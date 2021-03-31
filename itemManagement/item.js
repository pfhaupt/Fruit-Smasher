let maxZone = 7;

let itemsPerZone = 10;
let itemCount = maxZone * itemsPerZone;

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

let itemTypeName = ["Helmet", "Weapon", "Chestplate", "Pants", "Shoes", "Shield", "Ring", "Necklace", "Other"]
const itemType = {
  "Helmet": 0,
  "Weapon": 1,
  "Chestplate": 2,
  "Pants": 3,
  "Shoes": 4,
  "Shield": 5,
  "Ring": 6,
  "Necklace": 7,
  "Other": 8,
}

let itemList = new Array(itemCount);

function generateItems() {
  //new Item(id, name, imgSrc, type, maxLevel, bonus, boost, effect)
  /*
  itemList[0] = new Item(0, "hallo", "/images/placeholder.png", itemType.Helmet, 100, ["damage", "regen"], [5, 1.2], [0, 1]);
  itemList[1] = new Item(1, "hallo", "/images/placeholder.png", itemType.Pants, 100, ["damage", "maxHP"], [5, 100], [0, 0]);
  itemList[2] = new Item(2, "hallo", "/images/placeholder.png", itemType.Ring, 100, ["damage", "damage"], [10, 1], [0, 1]);
  itemList[3] = new Item(3, "hallo", "/images/placeholder.png", itemType.Other, 100, ["damage", "maxHP", "regen"], [5, -10, 0.1], [0, 0, 0]);
  itemList[4] = new Item(4, "hallo", "/images/placeholder.png", itemType.Helmet, 100, ["damage", "maxHP", "regen"], [5, -10, 0.1], [0, 0, 0]);
  itemList[5]
  */
  for (let z = 0; z < maxZone; z++) {
    for (let i = 0; i < itemsPerZone; i++) {
      let bonus = getRandomBonus(i);
      let boost = getRandomBoost(bonus.length);
      let effect = getRandomEffect(boost.length);
      let id;
      let index = i % itemsPerZone;
      if (index < 6) id = index;
      else if (index >= 6 && index < 8) id = 6;
      else if (index >= 8) id = 7;
      let name = itemTypeName[id];
      let imgSrc = "/images/items/Chestplate0.png";
      console.log(imgSrc);
      itemList[i + z * itemsPerZone] = new Item(i + z * itemsPerZone, getRandomName(i), imgSrc, itemType[itemTypeName[id % itemTypeName.length]], 1000, bonus, boost, effect);
    }
  }
}

function getRandomName(i) {
  return "Hipster Shirt";
}

function getRandomBonus(i) {
  return ["damage"];
}

function getRandomBoost(len) {
  return [100];
}

function getRandomEffect(len) {
  return [0];
}

class Item {
  constructor(id, name, imgSrc, equipmentSlot, maxLevel, boost, bonus, effect) {
    this.id = id ?? -1;
    this.name = name ?? "";
    this.img = createImg(imgSrc, "Image doesn't exist yet");
    this.img.hide();
    this.itemType = equipmentSlot ?? -1;
    this.level = 0;
    this.maxLevel = maxLevel;
    this.unlocked = false;
    this.canDrop = true;
    this.boost = boost ?? [];
    this.baseBonus = bonus ?? [];
    this.currentBonus = this.baseBonus;
    this.effect = effect ?? [];

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

  getTooltip() {
    let s = "";
    s += "Item ID: " + this.id;
    s += "\n";
    s += "Item Name: " + this.name;
    s += "\n";
    s += "Item Type: " + itemTypeName[this.itemType];
    s += "\n";
    s += "Item Level " + this.level + " of " + this.maxLevel;
    s += "\n";
    for (let i = 0; i < this.boost.length; i++) {
      let symbol;
      let bonus = this.currentBonus[i];
      if (this.effect[i] === 0 && bonus < 0) symbol = "";
      else if (this.effect[i] === 0) symbol = "+";
      else if (this.effect[i] === 1) symbol = "x";
      s += (this.boost[i][0].toUpperCase() + this.boost[i].substr(1)) + " Boost: " + symbol + bonus;
      s += "\n";
    }

    return s;
  }

  calculateCurrentBonus() {
    for (let i = 0; i < this.boost.length; i++) {
      this.currentBonus[i] = this.bonus[i] * (1 + this.level / this.maxLevel);
    }
  }
}
