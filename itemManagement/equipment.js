/*
TODO LIST:
Equipment soll funktionieren (DRAG N DROP)
Items sollen funktionieren (Item Stats -> Player Stats)
Item Weights sollen funktionieren (Einige Items sollen häufiger droppen als andere, siehe itemWeight in item.js)
*/

class Equipment extends MenuTemplate {
  constructor(name, x, y, w, h, col) {
    super(name, x, y, w, h, col);
    this.aspectRatio = 10. / 13.;

    this.currentBonus = {};

    for (const c in player.attr) {
      this.currentBonus[c] = {};
      this.currentBonus[c].additive = 0;
      this.currentBonus[c].multiplicative = 1;
    }

    this.createSlots();
  }

  calculateBonus() {
    for (const c in this.currentBonus) {
      this.currentBonus[c].additive = 0;
      this.currentBonus[c].multiplicative = 1;
    }
    for (let i = 0; i < equipSlotCount; i++) {
      let item = this.ch[i].item;
      if (item === null || typeof item === "undefined") continue;
      else {
        for (let j = 0; j < item.boost.length; j++) {
          let b = item.boost;
          let e = item.effect;
          let b1 = item.bonus;
          if (e === 0) {
            //additiver Effekt
            this.currentBonus[b].additive += b1;
          } else if (e === 1) {
            //multiplikativer Effekt
            this.currentBonus[b].multiplicative *= b1;
          }
        }
      }
    }

    for (const c in this.currentBonus) {
      console.log(c, this.currentBonus[c].additive, this.currentBonus[c].multiplicative);
    }
  }

  createSlots() {
    let w = 0.1;
    let h = w * this.aspectRatio;
    this.ch.push(new ItemSlot(0, 4 * w, h, w * 2, h * 2, null, itemType.Helmet)); //Helmet
    this.ch.push(new ItemSlot(0, 4.5 * w, 3 * h, w, h, null, itemType.Necklace)); //Necklace
    this.ch.push(new ItemSlot(0, w, 4.5 * h, w, h, null, itemType.Ring)); //Ring Left
    this.ch.push(new ItemSlot(0, 2 * w, 4 * h, 2 * w, 2 * h, null, itemType.Shield)); //Shield
    this.ch.push(new ItemSlot(0, 4 * w, 4 * h, 2 * w, 2 * h, null, itemType.Chestplate)); //Chestplate
    this.ch.push(new ItemSlot(0, 6 * w, 4 * h, 2 * w, 2 * h, null, itemType.Weapon)); //Weapon
    this.ch.push(new ItemSlot(0, 8 * w, 4.5 * h, w, h, null, itemType.Ring)); //Ring Right
    this.ch.push(new ItemSlot(0, 4 * w, 6 * h, 2 * w, 2 * h, null, itemType.Pants)); //Pants
    this.ch.push(new ItemSlot(0, 4 * w, 8 * h, 2 * w, 2 * h, null, itemType.Shoes)); //Shoes

    for (let i = 0; i < 8; i++) {
      this.ch.push(new ItemSlot(0, w*(i+1), 11 * h, w, h, null, itemType.Other)); //Other
    }

    for (let i = 0; i < this.ch.length; i++) {
      this.ch[i].slotID = i;
    }
  }
}
