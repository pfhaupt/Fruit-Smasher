class Inventory extends MenuTemplate {
  constructor(name, x, y, w, h) {
    super(name, x, y, w, h);

    this.itemsPerLine = 10;
    this.itemsPerPage = this.itemsPerLine ** 2;
    this.aspectRatio = 1 / (Math.min(itemCount, this.itemsPerPage) / this.itemsPerPage);

    this.children = new Array(itemCount);
    let w1 = 1.0 / this.itemsPerLine;
    let h1 = w1 * this.aspectRatio;
    for (let i = 0; i < itemCount; i++) {
      let x = i % this.itemsPerLine;
      let y = floor(i / this.itemsPerLine);
      this.children[i] = new ItemSlot(17 + i, x * w1, y * h1, w1, h1, null);
    }
    for (let i = 0; i < itemCount; i++) {
      if (typeof itemList[i] !== "undefined" && itemList[i] !== null) {
        this.children[i].setItem(itemList[i]);
      }
    }

  }

  hide() {
    this.hidden = true;
    for (let i of itemList)
      if (typeof i !== 'undefined')
        if (typeof i.img !== 'undefined')
          i.img.hide();
  }

  show() {
    this.hidden = false;
    for (let i of itemList)
      if (typeof i !== 'undefined')
        if (typeof i.img !== 'undefined')
          i.img.show();
  }
}
