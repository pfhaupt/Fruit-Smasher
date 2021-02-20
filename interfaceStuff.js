var realDefaultFontSize = 32;
var defaultFontSize = Math.min(realDefaultFontSize, Math.max(screen.width, screen.height) / 3);
var debug = true;


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
    this.tempY = 0;
    this.tempX = 0;
    this.tempW = 0;
    this.tempH = 0;
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
      this.tempX = this.xAbsToScreen;
      this.tempY = this.yAbsToScreen;
      this.tempW = this.wAbsToScreen;
      this.tempH = this.hAbsToScreen;
      if (parentWAbs / this.aspectRatio > parentHAbs) {
        this.wAbsToScreen = this.hAbsToScreen * this.aspectRatio;
        this.xAbsToScreen = this.xAbsToScreen + (this.tempW - this.wAbsToScreen) / 2.0;
      } else {
        this.hAbsToScreen = this.wAbsToScreen / this.aspectRatio;
        this.yAbsToScreen = this.yAbsToScreen + (this.tempH - this.hAbsToScreen) / 2.0;
      }
    }
  }

  display() {
    if (debug) {
      push();
      noFill();
      stroke(255, 0, 0);
      rect(this.tempX, this.tempY, this.tempW, this.tempH);
      stroke(0, 255, 0);
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
  constructor(sMessage, message, x, y, w, h, s = defaultFontSize, a = 'center', format = true) {
    super(x, y, w, h);
    this.message = message;
    this.secondaryMessage = sMessage;
    this.txtSize = s;
    this.align = a;
    this.format = format;
    this.content = createP(this.secondaryMessage + prettify(eval(this.message), 2));
  }
  
  resize(parentXAbs, parentYAbs, parentWAbs, parentHAbs) {
    super.resize(parentXAbs, parentYAbs, parentWAbs, parentHAbs);
    this.txtSize = defaultFontSize;
    this.content.style('font-size', this.txtSize + 'px');
    this.content.style('line-height', (this.hAbsToScreen - 2 * this.txtSize) + 'px');
    this.content.style('text-align', this.align);
    //this.content.center();
  }

  display() {
    //let txt = this.secondaryMessage + prettify(eval(this.message), 2);
    //this.content.html(txt);
    super.display();
    /*let txt = this.secondaryMessage;
    if (this.format) txt += prettify(eval(this.message), 2);
    push();
    textSize(this.txtSize);
    textAlign(this.alignX, this.alignY);
    text(txt, this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
    pop();*/
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
