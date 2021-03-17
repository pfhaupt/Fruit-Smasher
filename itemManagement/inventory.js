class Inventory extends MenuTemplate {
  constructor(name, x, y, w, h, col) {
    super(name, x, y, w, h, col);
    this.itemList = new Array(maxZone * itemsPerZone);
    this.itemList[0] = new Item(0, "Riesiger Drache aus dem Keller eines Kobolds", "/Fruit-Smasher/images/placeholder.png", 0, 100, ["damage", "regen"], [5, 1.2], [0, 1]);
    this.itemList[1] = new Item(0, "hallo", "/Fruit-Smasher/images/placeholder.png", 0, 100, ["damage", "maxHP"], [5, 100], [0, 0]);
    this.itemList[2] = new Item(0, "hallo", "/Fruit-Smasher/images/placeholder.png", 0, 100, ["damage", "damage"], [10, 1], [0, 1]);
    this.itemList[3] = new Item(0, "hallo", "/Fruit-Smasher/images/placeholder.png", 0, 100, ["damage", "maxHP", "regen"], [5, -10, 0.1], [0, 0, 0]);

    this.itemsPerLine = 10;
    this.itemsPerPage = this.itemsPerLine ** 2;
    this.aspectRatio = 1;
  }

  hide() {
    for (let i of this.itemList)
      if (typeof i !== 'undefined')
        if (typeof i.img !== 'undefined')
          i.img.hide();
  }

  show() {
    for (let i of this.itemList)
      if (typeof i !== 'undefined')
        if (typeof i.img !== 'undefined')
          i.img.show();
  }

  display() {
    super.display();
    let rectSize = Math.min(this.wAbsToScreen, this.hAbsToScreen) / this.itemsPerLine;
    for (let i = 0; i < this.itemList.length; i++) {
      let x = i % this.itemsPerLine;
      let y = floor(i / this.itemsPerLine);

      //Always draw white rectangle
      fill(255, 255, 255);
      rect(this.xAbsToScreen + x * rectSize, this.yAbsToScreen + y * rectSize, rectSize, rectSize);
      let item = this.itemList[i] ?? null;
      if (item !== null) {
        let xPos = this.xAbsToScreen + x * rectSize;
        let yPos = this.yAbsToScreen + y * rectSize;
        //Draw Image at position
        let img = this.itemList[i].img;
        if (img !== null) {
          img.show();

          //image(img, this.xAbsToScreen + x * rectSize, this.yAbsToScreen + y * rectSize, rectSize, rectSize);
        }
      }
    }
  }

  resize(parentXAbs, parentYAbs, parentWAbs, parentHAbs) {
    this.xAbsToScreen = parentXAbs + parentWAbs * this.xRelToParent;
    this.yAbsToScreen = parentYAbs + parentHAbs * this.yRelToParent;
    this.wAbsToScreen = parentWAbs * this.wRelToParent;
    this.hAbsToScreen = parentHAbs * this.hRelToParent;
    this.tempX = this.xAbsToScreen;
    this.tempY = this.yAbsToScreen;
    this.tempW = this.wAbsToScreen;
    this.tempH = this.hAbsToScreen;

    if (this.wAbsToScreen / this.aspectRatio > this.hAbsToScreen) {
      this.wAbsToScreen = this.hAbsToScreen * this.aspectRatio;
      this.xAbsToScreen = this.xAbsToScreen + (this.tempW - this.wAbsToScreen) / 2.0;
    } else {
      this.hAbsToScreen = this.wAbsToScreen / this.aspectRatio;
      this.yAbsToScreen = this.yAbsToScreen + (this.tempH - this.hAbsToScreen) / 2.0;
    }

    for (let c of this.children) c.resize(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);

    let rectSize = Math.min(this.wAbsToScreen, this.hAbsToScreen) / this.itemsPerLine;
    for (let i = 0; i < this.itemList.length; i++) {
      let x = i % this.itemsPerLine;
      let y = floor(i / this.itemsPerLine);
      let item = this.itemList[i] ?? null;
      if (item !== null) {
        let xPos = this.xAbsToScreen + x * rectSize;
        let yPos = this.yAbsToScreen + y * rectSize;
        let img = this.itemList[i].img;
        if (img !== null) {
          img.position(xPos, yPos);
          img.size(rectSize, rectSize);
          continue;
        }
      }
    }
  }
}
