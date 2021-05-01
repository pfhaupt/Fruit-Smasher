
class UICollection extends MenuTemplate {
  constructor(name, x, y, w, h, child, dims, space = 0.0) {
    super(name, x, y, w, h);

    if (dims[0].length != dims[1].length) {
      console.log("Failed to create UICollection.");
      console.log("Reason: Wrong Dimensions for widths and heights.");
      return;
    }

    let sumWidth = 0,
      spaceForChildren = 0;
    for (let i = 0; i < dims[0].length; i++) {
      sumWidth += dims[0][i];
      spaceForChildren += dims[1][i];
    }

    let tmpWidth = new Array(dims[0].length);
    let tmpX = new Array(tmpWidth.length);
    tmpX[0] = 0;
    let tmpY = new Array(tmpX.length);
    let tmpHeight = new Array(tmpY.length);

    for (let i = 0; i < dims[0].length; i++) {
      tmpWidth[i] = dims[0][i] / sumWidth;
      if (i > 0) tmpX[i] = tmpX[i - 1] + tmpWidth[i - 1];
      tmpY[i] = 0;
      tmpHeight[i] = 1 / dims[1][i];
    }

    let xywh = [];
    let duplicates = ceil(child.length / spaceForChildren);
    for (let i = 0; i < dims[0].length; i++) {
      let tmpYOffset = 0;
      for (let j = 0; j < dims[1][i]; j++) {
        xywh.push({
          x: tmpX[i],
          y: tmpYOffset,
          w: tmpWidth[i],
          h: tmpHeight[i] / duplicates,
        });
        tmpYOffset += tmpHeight[i] / duplicates;
      }
    }

    let xOff = 0,
      yOff = 0,
      width = 1,
      height = 1;
    for (let i = 0; i < child.length; i++) {
      let c = child[i];
      let id = i % xywh.length;
      xOff = xywh[id].x;
      yOff = xywh[id].y + floor(i / spaceForChildren) / duplicates;
      width = xywh[id].w;
      height = xywh[id].h;
      try {
        switch (c[0]) {
          case Button:
            this.children.push(new Button(c[1], xOff, yOff, width, height, c[2]));
            break;
          case Text:
            this.children.push(new Text(c[1], xOff, yOff, width, height));
            break;
          case CustomImage:
            this.children.push(new CustomImage(c[1], xOff, yOff, width, height, c[2]));
            break;
          default:
            console.log("Attempted to push an undefined UI element.");
            this.children.push(new Text(["Undefined Element."], xOff, yOff, width, height));
            break;
        }
        //this.children.push(new c[0](c[1], 0, 0, 0, 0, c[2]));
      } catch (e) {
        console.log("Something went terribly wrong!");
        console.log("Couldn't push " + c[0].name + " to the stack!");
        console.log("Reason: " + e);
        this.children.push(new Text(["The Element you wanted to place here caused an error."], xOff, yOff, width, height));
      }
    }
  }
}
