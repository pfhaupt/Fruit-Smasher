var defaultFontSize = 24;

class BaseUIBlock {
  constructor(x, y, w, h) {
    this.xRelToParent = x;
    this.yRelToParent = y;
    this.wRelToParent = w;
    this.hRelToParent = h;
    this.xAbsToScreen = 0;
    this.yAbsToScreen = 0;
    this.wAbsToScreen = 0;
    this.hAbsToScreen = 0;
    this.hidden = true;
  }

  resize(parentXAbs, parentYAbs, parentWAbs, parentHAbs) {
    this.xAbsToScreen = parentXAbs + parentWAbs * this.xRelToParent;
    this.yAbsToScreen = parentYAbs + parentHAbs * this.yRelToParent;
    this.wAbsToScreen = parentWAbs * this.wRelToParent;
    this.hAbsToScreen = parentHAbs * this.hRelToParent;
  }

  display() {

  }

  hide() {
    this.hidden = true;
  }

  show() {
    this.hidden = false;
  }
}

class Button extends BaseUIBlock {
  constructor(name, x, y, w, h, fun, s = defaultFontSize) {
    super(x, y, w, h);
    this.b = createButton(name);
    this.b.mouseReleased(fun);
    this.txtSize = s;
    this.b.style('font-size', this.txtSize + 'px');
  }

  hide() {
    this.b.hide();
  }

  show() {
    this.b.show();
  }

  display() {
    this.b.position(this.xAbsToScreen, this.yAbsToScreen);
    this.b.size(this.wAbsToScreen, this.hAbsToScreen);
  }

  resize(parentXAbs, parentYAbs, parentWAbs, parentHAbs) {
    this.txtSize = Math.min(defaultFontSize, Math.max(this.wAbsToScreen, this.hAbsToScreen) / 3);
    this.b.style('font-size', this.txtSize + 'px');
    super.resize(parentXAbs, parentYAbs, parentWAbs, parentHAbs);
  }
}

class Text extends BaseUIBlock {
  constructor(message, sMessage, x, y, w, h, s = defaultFontSize, aX = CENTER, aY = CENTER, format = true) {
    super(x, y, w, h);
    this.message = message;
    this.secondaryMessage = sMessage;
    this.txtSize = s;
    this.alignX = aX;
    this.alignY = aY;
    this.format = format;
  }

  display() {
    let txt = this.secondaryMessage;
    if (this.format) txt += prettify(eval(this.message), 2);
    push();
    textSize(this.txtSize);
    textAlign(this.alignX, this.alignY);
    text(txt, this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
    pop();
  }
}

class Image extends BaseUIBlock {
  constructor(name, x, y, w, h, squareMode = true) {
    super(x, y, w, h);
    let n = "/Fruit-Smasher/images/"+name;
    this.img = createImg(n, "");
    this.squareMode = squareMode;
  }

  resize(parentXAbs, parentYAbs, parentWAbs, parentHAbs) {
    let ratio = parentWAbs / parentHAbs;
    this.xAbsToScreen = parentXAbs + parentWAbs * this.xRelToParent;
    this.yAbsToScreen = parentYAbs + parentHAbs * this.yRelToParent;
    this.wAbsToScreen = parentWAbs * this.wRelToParent;
    this.hAbsToScreen = parentHAbs * this.hRelToParent * ratio;
  }

  display() {
    push();
    image(this.img, this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
    pop();
  }
}


class MainMenuButton extends Button {
  constructor(name, x, y, w, h, id) {
    super(name, x, y, w, h, function() {
      mainWindow.showMenu(id);
    });
  }
}

function prettify(val, digits) {
  if (isNaN(val)) return;
  if (val === 0) return 0;
  var powOf10 = pow(10, digits);
  return round(val * powOf10) / powOf10;
}
