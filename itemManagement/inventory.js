class Inventory extends MenuTemplate {
  constructor(name, x, y, w, h, col) {
    super(name, x, y, w, h, col);
    let itemCount = maxZone * itemsPerZone;
    this.itemList = new Array(itemCount);
    this.itemList[0] = new Item(0, "hallo", "/images/placeholder.png", itemType.Helmet, 100, ["damage", "regen"], [5, 1.2], [0, 1]);
    this.itemList[1] = new Item(1, "hallo", "/images/placeholder.png", itemType.Pants, 100, ["damage", "maxHP"], [5, 100], [0, 0]);
    this.itemList[2] = new Item(2, "hallo", "/images/placeholder.png", itemType.Ring, 100, ["damage", "damage"], [10, 1], [0, 1]);
    this.itemList[3] = new Item(3, "hallo", "/images/placeholder.png", itemType.Other, 100, ["damage", "maxHP", "regen"], [5, -10, 0.1], [0, 0, 0]);

    this.itemsPerLine = 10;
    this.itemsPerPage = this.itemsPerLine ** 2;
    this.aspectRatio = 1 / (Math.min(itemCount, this.itemsPerPage) / this.itemsPerPage);

    this.children = new Array(itemCount);
    let w1 = 1.0 / this.itemsPerLine;
    let h1 = w1 * this.aspectRatio;
    for (let i = 0; i < itemCount; i++) {
      let x = i % this.itemsPerLine;
      let y = floor(i / this.itemsPerLine);
      this.children[i] = new ItemSlot(x * w1, y * h1, w1, h1, null);
    }
    for (let i = 0; i < itemCount; i++) {
      if (typeof this.itemList[i] !== "undefined" && this.itemList[i] !== null) {
        this.children[i].setItem(this.itemList[i]);
      }
    }

  }

  hide() {
    this.hidden = true;
    for (let i of this.itemList)
      if (typeof i !== 'undefined')
        if (typeof i.img !== 'undefined')
          i.img.hide();
  }

  show() {
    this.hidden = false;
    for (let i of this.itemList)
      if (typeof i !== 'undefined')
        if (typeof i.img !== 'undefined')
          i.img.show();
  }
}
