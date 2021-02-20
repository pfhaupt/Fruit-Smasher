var realDefaultFontSize = 24;
var defaultFontSize = Math.min(realDefaultFontSize, Math.max(screen.width, screen.height) / 3);
var debug = false;


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
    this.aspectRatio = 0;
    this.content = null;
  }

  resize(parentXAbs, parentYAbs, parentWAbs, parentHAbs) {
    this.xAbsToScreen = parentXAbs + parentWAbs * this.xRelToParent;
    this.yAbsToScreen = parentYAbs + parentHAbs * this.yRelToParent;
    this.wAbsToScreen = parentWAbs * this.wRelToParent;
    this.hAbsToScreen = parentHAbs * this.hRelToParent;
    if (this.aspectRatio !== 0) {
      if (parentWAbs / this.aspectRatio > parentHAbs) {
        let oldW = this.wAbsToScreen;
        this.wAbsToScreen = this.hAbsToScreen * this.aspectRatio;
        this.xAbsToScreen = this.xAbsToScreen + (oldW - this.wAbsToScreen) / 2.0;
      } else {
        let oldH = this.hAbsToScreen;
        this.hAbsToScreen = this.wAbsToScreen / this.aspectRatio;
        this.yAbsToScreen = this.yAbsToScreen + (oldH - this.hAbsToScreen) / 2.0;
      }
    }
  }

  display() {
    if (debug) {
      push();
      noFill();
      rect(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
      pop();
    }
    this.content.position(this.xAbsToScreen, this.yAbsToScreen);
    this.content.size(this.wAbsToScreen, this.hAbsToScreen);
  }

  hide() {
    this.content.hide();
  }

  show() {
    this.content.show();
  }
}

class Button extends BaseUIBlock {
  constructor(name, x, y, w, h, fun, s = defaultFontSize) {
    super(x, y, w, h);
    this.content = createButton(name);
    this.content.mouseReleased(fun);
    this.txtSize = s;
    this.content.style('font-size', this.txtSize + 'px');
  }

  resize(parentXAbs, parentYAbs, parentWAbs, parentHAbs) {
    super.resize(parentXAbs, parentYAbs, parentWAbs, parentHAbs);
    this.txtSize = Math.min(defaultFontSize, Math.max(this.wAbsToScreen, this.hAbsToScreen) / 3);
    this.content.style('font-size', this.txtSize + 'px');
  }
}

class Text extends BaseUIBlock {
  constructor(sMessage, message, x, y, w, h, s = defaultFontSize, aX = CENTER, aY = CENTER, format = true) {
    super(x, y, w, h);
    this.message = message;
    this.secondaryMessage = sMessage;
    this.txtSize = s;
    this.alignX = aX;
    this.alignY = aY;
    this.format = format;
  }

  resize(parentXAbs, parentYAbs, parentWAbs, parentHAbs) {
    super.resize(parentXAbs, parentYAbs, parentWAbs, parentHAbs);
    this.txtSize = defaultFontSize;
  }

  hide() {

  }

  show() {

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
  constructor(name, x, y, w, h, ar = 1) {
    super(x, y, w, h);
    this.content = createImg(name, "");
    this.aspectRatio = ar;
  }
}

class MainMenuButton extends Button {
  constructor(name, x, y, w, h, id) {
    super(name, x, y, w, h, function() {
      mainWindow.showMenu(id);
      mainWindow.resize();
    });
  }
}

function prettify(val, digits) {
  if (isNaN(val)) return;
  if (val === 0) return 0;
  var powOf10 = pow(10, digits);
  return round(val * powOf10) / powOf10;
}
