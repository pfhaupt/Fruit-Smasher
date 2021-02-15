class MenuTemplate {
  constructor(name, x, y, w, h, col) {
    this.name = name;
    this.xRelToParent = x;
    this.yRelToParent = y;
    this.wRelToParent = w;
    this.hRelToParent = h;
    this.xAbsToScreen = 0;
    this.yAbsToScreen = 0;
    this.wAbsToScreen = 0;
    this.hAbsToScreen = 0;
    this.col = col;
    this.children = []; //Alle Elemente eines Fensters hier rein, wenn möglich
    this.hidden = true;
  }

  //x und y zwischen 0 und 1
  //relative Koordinaten im Bereich des Submenüs
  placeAtRelativePos(x, y) {

  }

  display() {
    if (this.hidden) return;
    push();
    fill(this.col);
    rect(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
    pop();
    for (var c of this.children) {
      c.display();
    }
  }

  show() {
    this.hidden = false;
    for (let c of this.children) c.show();
  }

  hide() {
    this.hidden = true;
    for (let c of this.children) c.hide();
  }

  resize(parentXAbs, parentYAbs, parentWAbs, parentHAbs) {
    this.xAbsToScreen = parentXAbs + parentWAbs * this.xRelToParent;
    this.yAbsToScreen = parentYAbs + parentHAbs * this.yRelToParent;
    this.wAbsToScreen = parentWAbs * this.wRelToParent;
    this.hAbsToScreen = parentHAbs * this.hRelToParent;
    for (var c of this.children) {
      c.resize(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
    }
  }
}
