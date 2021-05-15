/*
Example:

let xyz = new UICollection("HealAction", 0, 0, 1, 0,
  [
    [Button, "Heal (" + ActionCost.HealAction + " EP)", () => {
      if (player.attr[AttrIDs.Energy].current < ActionCost.HealAction) {
        return;
      }
      player.heal();
      mainWindow.subMenus[SubMenu.Field].ch[1].displayOnce();
      if (currentlyFightingEnemy)
        currentlyFightingEnemy.performRandomAction(player);
      mainWindow.subMenus[SubMenu.Field].ch[1].displayOnce();
    }],
    [Text, ["Heal yourself for ", "player.attr[AttrIDs.Damage].total * player.healRange.min", " to ", "player.attr[AttrIDs.Damage].total * player.healRange.max", " hitpoints"]],
    [Text, ["This is another text!"]]
  ],
  [
    [1, 3],
    [
      [1],
      [1, 1]
    ]
  ], [0.0, space]));
*/

class UICollection extends MenuTemplate {
  constructor(name, x, y, w, h, child, dims, space = [0.0, 0.0]) {
    super(name, x, y, w, h);

    if (dims[0].length != dims[1].length) {
      console.log("Failed to create UICollection.");
      console.log("Reason: Wrong Dimensions for widths and heights.");
      return;
    }

    let sumWidth = 0,
      spaceForch = 0;
    for (let i = 0; i < dims[0].length; i++) {
      sumWidth += dims[0][i];
      for (let j = 0; j < dims[1][i].length; j++) {
        spaceForch++;
      }
    }

    let tmpWidth = [];
    let tmpHeight = [];
    for (let i = 0; i < dims[0].length; i++) {
      let sumHeight = 0;
      for (let j = 0; j < dims[1][i].length; j++) {
        sumHeight += dims[1][i][j];
      }
      for (let j = 0; j < dims[1][i].length; j++) {
        tmpWidth.push(dims[0][i] / sumWidth);
        tmpHeight.push(dims[1][i][j] / sumHeight);
      }
    }

    let xOff = 0;
    let yOff = 0;
    let width = 0;
    let height = 0;
    let xywh = [];
    let id = 0;
    for (let i = 0; i < dims[0].length; i++) {
      yOff = 0;
      for (let j = 0; j < dims[1][i].length; j++) {
        xywh.push({
          x: xOff,
          y: yOff,
          w: tmpWidth[id],
          h: tmpHeight[id],
        });
        yOff += tmpHeight[id];
        id++;
      }
      xOff += tmpWidth[id - 1];
    }

    for (let dim of xywh) {
      dim.x = (1 - 2 * dim.x) * space[0] + dim.x;
      dim.y = (1 - 2 * dim.y) * space[1] + dim.y;
      dim.w = dim.w * (1.0 - 2 * space[0]);
      dim.h = dim.h * (1.0 - 2 * space[1]);
    }

    for (let i = 0; i < child.length; i++) {
      if (i >= spaceForch) {
        console.log("Attempted to add more ch than space is available.");
        break;
      }
      let c = child[i];
      let id = i % xywh.length;
      xOff = xywh[id].x;
      yOff = xywh[id].y;
      width = xywh[id].w;
      height = xywh[id].h;
      try {
        switch (c[0]) {
          case UICollection:
            this.ch.push(new UICollection("", xOff, yOff, width, height, c[1], c[2], c[3]));
            break;
          case Button:
            this.ch.push(new Button(c[1], xOff, yOff, width, height, c[2]));
            break;
          case Text:
            this.ch.push(new Text(c[1], xOff, yOff, width, height));
            break;
          case SwapableText:
            this.ch.push(new SwapableText(c[1], xOff, yOff, width, height));
            break;
          case CustomImage:
            this.ch.push(new CustomImage(c[1], xOff, yOff, width, height, c[2]));
            break;
          case ProgressBar:
            this.ch.push(new ProgressBar(c[1], c[2], c[3], xOff, yOff, width, height));
            break;
          case EmptyElement:
            this.ch.push(new EmptyElement(xOff, yOff, width, height));
            break;
          default:
            console.log("Attempted to push an undefined UI element.");
            this.ch.push(new EmptyElement(xOff, yOff, width, height));
            break;
        }
        //this.ch.push(new c[0](c[1], 0, 0, 0, 0, c[2]));
      } catch (e) {
        console.log("Something went terribly wrong!");
        console.log("Couldn't push " + c[0].name + " to the stack!");
        console.log("Reason: " + e);
        this.ch.push(new Text(["The Element you wanted to place here caused an error."], xOff, yOff, width, height));
      }
    }
  }
}