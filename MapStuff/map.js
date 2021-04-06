let defaultSaveName = "CustomMapForGame_";
let dim = 10;
let mapSize = 1000;
let tileSize = mapSize / dim;
let minimap;
let colorList = [];
let entityNames = [];
let entityList = [];
let textureNames = [];
let textureList = [];

//let upd = setInterval(generateMinimap, 100);

function generateDefaultMap() {
  console.log("Didn't find a map file, generating default map.");
  dim = 10;
  tileSize = mapSize / dim;

  let m = mainWindow.subMenus[0].children[0];
  let xrel = m.xRelToParent;
  let yrel = m.yRelToParent;
  let hrel = m.hRelToParent;
  let wrel = m.wRelToParent;
  mainWindow.subMenus[0].children[0] = new Map(10, 0, 0, 0, 0, 0);
  mainWindow.subMenus[0].children[0].xRelToParent = xrel;
  mainWindow.subMenus[0].children[0].yRelToParent = yrel;
  mainWindow.subMenus[0].children[0].hRelToParent = hrel;
  mainWindow.subMenus[0].children[0].wRelToParent = wrel;
  mainWindow.subMenus[0].children[0].updateImages(0, 0);
}

function loadActualMap(sav) {
  let newMap = new Map(0, 0);
  let mapFile = sav;
  dim = mapFile.width;
  tileSize = mapSize / dim;
  newMap.width = dim;
  newMap.height = dim;
  mainWindow.subMenus[0].children[0].children[1].clear();

  let d = dim;

  console.log(mapFile);

  let getID = (a) => {
    return {
      tileID: round((a - (a % 10)) / 10),
      entityID: a % 10
    };
  };

  sav.loadPixels();
  newMap.tiles = new Array(d);
  for (let x = 0; x < d; x++) {
    newMap.tiles[x] = [];
    for (let y = 0; y < d; y++) {
      newMap.tiles[x][y] = new TileSet(x, y);
      let id = mapFile.pixels[(y * dim + x) * 4];
      let ids = getID(id);
      if (ids.tileID !== 0) newMap.tiles[x][y].set(ids.tileID);
      if (ids.entityID !== 0) newMap.tiles[x][y].setEntity(ids.entityID);
      if (ids.entityID === 7) {
        player.position.x = x;
        player.position.y = y;
      }
    }
  }
  let m = mainWindow.subMenus[0].children[0].children[0];
  let xrel = m.xRelToParent;
  let yrel = m.yRelToParent;
  let hrel = m.hRelToParent;
  let wrel = m.wRelToParent;
  mainWindow.subMenus[0].children[0].children[0] = newMap;
  mainWindow.subMenus[0].children[0].children[0].xRelToParent = xrel;
  mainWindow.subMenus[0].children[0].children[0].yRelToParent = yrel;
  mainWindow.subMenus[0].children[0].children[0].hRelToParent = hrel;
  mainWindow.subMenus[0].children[0].children[0].wRelToParent = wrel;

  mainWindow.subMenus[0].children[0].children[0].cachedTiles = [];


  let viewRange = player.attributes.sight.total;
  let xPos = player.position.x - floor(viewRange / 2);
  let yPos = player.position.y - floor(viewRange / 2);

  let w1 = 1 / player.attributes.sight.total;
  for (let i = 0; i < player.attributes.sight.total; i++) {
    mainWindow.subMenus[0].children[0].children[0].cachedTiles[i] = [];
    for (let j = 0; j < player.attributes.sight.total; j++) {
      let posWithOffX = xPos + i;
      let posWithOffY = yPos + j;
      mainWindow.subMenus[0].children[0].children[0].cachedTiles[i][j] = {
        tile: null,
        entity: null,
        hide() {
          this.tile.hide();
          this.entity.hide();
        },
        show() {
          this.tile.show();
          this.entity.show();
        }
      };
      if (posWithOffX >= 0 && posWithOffX < mainWindow.subMenus[0].children[0].children[0].tiles.length && posWithOffY >= 0 && posWithOffY < mainWindow.subMenus[0].children[0].children[0].tiles.length) {
        let t = mainWindow.subMenus[0].children[0].children[0].tiles[posWithOffX][posWithOffY];
        mainWindow.subMenus[0].children[0].children[1].updatePixels(posWithOffX, posWithOffY);
        let tID = t.tileID;
        let eID = t.entityID;
        mainWindow.subMenus[0].children[0].children[0].cachedTiles[i][j].tile = new CustomImage(textureList[tID], 0, 0, w1, w1);
        mainWindow.subMenus[0].children[0].children[0].cachedTiles[i][j].entity = new CustomImage(entityList[eID], 0, 0, w1, w1);
      } else {
        mainWindow.subMenus[0].children[0].children[0].cachedTiles[i][j].tile = new CustomImage("MapStuff/usedTextures/textures/void.png", 0, 0, w1, w1);
        mainWindow.subMenus[0].children[0].children[0].cachedTiles[i][j].entity = new CustomImage(entityList[0], 0, 0, w1, w1);
      }
      mainWindow.subMenus[0].children[0].children[0].cachedTiles[i][j].hide();
    }
  }
  mainWindow.subMenus[0].children[0].children[0].updateImages(0, 0);
  mainWindow.resize();
}

function loadMap(zone) {
  mainWindow.subMenus[0].children[0].children[0].hide();
  let saveName = "Fruit-Smasher/MapStuff/maps/test" + zone + ".png";
  loadImage(saveName, loadActualMap, generateDefaultMap);
}

function getAverageColor(img, i, t) {
  img.loadPixels();

  let sr = 0,
    sg = 0,
    sb = 0;

  let pixCount = 0;

  for (let i = 0; i < img.pixels.length; i += 4) {
    if (img.pixels[i + 3] < 20 || (img.pixels[i] < 10 && img.pixels[i + 1] < 10 && img.pixels[i + 2] < 10)) continue;
    sr += img.pixels[i];
    sg += img.pixels[i + 1];
    sb += img.pixels[i + 2];
    pixCount++;
  }
  if (pixCount !== 0) {
    sr /= pixCount;
    sg /= pixCount;
    sb /= pixCount;
  }
  console.log(sr, sg, sb);
  if (typeof colorList[t] === 'undefined') colorList[t] = [];
  colorList[t][i] = [];
  colorList[t][i][0] = sr;
  colorList[t][i][1] = sg;
  colorList[t][i][2] = sb;
}

function loadImages() {
  let alpha = 255;

  textureList[0] = "Fruit-Smasher/MapStuff/usedTextures/textures/grass.jpg";
  textureList[1] = "Fruit-Smasher/MapStuff/usedTextures/textures/sand.jpg";
  textureList[2] = "Fruit-Smasher/MapStuff/usedTextures/textures/water.jpg";

  for (let i = 0; i < textureList.length; i++) {
    loadImage(textureList[i], (img) => {
      getAverageColor(img, i, 0);
    });
  }
  entityList[0] = "Fruit-Smasher/MapStuff/usedTextures/entities/none.png";
  entityList[1] = "Fruit-Smasher/MapStuff/usedTextures/entities/enemy0.png";
  entityList[2] = "Fruit-Smasher/MapStuff/usedTextures/entities/enemy1.png";
  entityList[3] = "Fruit-Smasher/MapStuff/usedTextures/entities/boss.png";
  entityList[4] = "Fruit-Smasher/MapStuff/usedTextures/entities/key.png";
  entityList[5] = "Fruit-Smasher/MapStuff/usedTextures/entities/trap.png";
  entityList[6] = "Fruit-Smasher/MapStuff/usedTextures/entities/portal.png";
  entityList[7] = "Fruit-Smasher/MapStuff/usedTextures/entities/player.png";
  for (let i = 0; i < entityList.length; i++) {
    loadImage(entityList[i], (img) => {
      getAverageColor(img, i, 1);
    });
  }
}

class Minimap extends BaseUIBlock {
  constructor(x, y, w, h) {
    super(x, y, w, h);
    this.aspectRatio = 1;
    this.content = createImage(200, 200);
    this.clear();
  }

  display() {
    if (this.hidden) return;
    if (debug) {
      push();
      noFill();
      stroke(255, 0, 0);
      rect(this.tempX, this.tempY, this.tempW, this.tempH);
      stroke(0, 255, 0);
      rect(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
      pop();
    }
    image(this.content, this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
  }

  show() {
    this.hidden = false;
  }

  hide() {
    this.hidden = true;
  }

  updatePixels(x, y) {
    /*
    minimap.loadPixels();
    for (let i = 0; i < w; i++) {
      for (let j = 0; j < h; j++) {
        minimap.set(x * w + i, y * h + j, colorList[id]);
      }
    }*/
    mainWindow.subMenus[0].children[0].children[0].tiles[x][y].visible = true;
    let map = mainWindow.subMenus[0].children[0].children[0].tiles;
    let w = this.content.width / map.length;

    let tID = map[x][y].tileID;
    let eID = map[x][y].entityID;

    this.content.loadPixels();
    for (let i = 0; i < w; i++) {
      for (let j = 0; j < w; j++) {
        let xp = x * w + i;
        let yp = y * w + j;
        let id = yp * this.content.width + xp;
        if (eID !== 0) {
          this.content.pixels[4 * id] = colorList[1][eID][0];
          this.content.pixels[4 * id + 1] = colorList[1][eID][1];
          this.content.pixels[4 * id + 2] = colorList[1][eID][2];
          this.content.pixels[4 * id + 3] = 255;
        } else {
          this.content.pixels[4 * id] = colorList[0][tID][0];
          this.content.pixels[4 * id + 1] = colorList[0][tID][1];
          this.content.pixels[4 * id + 2] = colorList[0][tID][2];
          this.content.pixels[4 * id + 3] = 255;
        }
      }
    }
    this.content.updatePixels();
  }

  clear() {
    this.content.loadPixels();
    for (let i = 0; i < this.content.pixels.length; i++) {
      this.content.pixels[4 * i] = 200; //R
      this.content.pixels[4 * i + 1] = 200; //G
      this.content.pixels[4 * i + 2] = 200; //B
      this.content.pixels[4 * i + 3] = 255; //A
    }
    this.content.updatePixels();
  }
}

class Map extends BaseUIBlock {
  constructor(dim, zone, x, y, w, h) {
    super(x, y, w, h);
    this.aspectRatio = 1;
    this.tiles = [];
    this.width = dim;
    this.height = dim;
    for (let i = 0; i < this.width; i++) {
      this.tiles[i] = [];
      for (let j = 0; j < this.height; j++) {
        this.tiles[i][j] = new TileSet(i, j);
      }
    }
    this.cachedTiles = [];
    let w1 = 1 / player.attributes.sight.total;
    for (let i = 0; i < player.attributes.sight.total; i++) {
      this.cachedTiles[i] = [];
      for (let j = 0; j < player.attributes.sight.total; j++) {
        this.cachedTiles[i][j] = {
          tile: new CustomImage(textureList[0], i * w1, j * w1, w1, w1),
          entity: new CustomImage(entityList[0], i * w1, j * w1, w1, w1),
          hide() {
            this.tile.hide();
            this.entity.hide();
          },
          show() {
            this.tile.show();
            this.entity.show();
          }
        };
        this.cachedTiles[i][j].hide();
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
    for (let i = 0; i < this.cachedTiles.length; i++) {
      for (let j = 0; j < this.cachedTiles[i].length; j++) {
        let t = this.cachedTiles[i][j];
        fill(0);
        rect(this.xAbsToScreen + i * this.wAbsToScreen / this.cachedTiles.length, this.yAbsToScreen + j * this.hAbsToScreen / this.cachedTiles[i].length, this.wAbsToScreen / this.cachedTiles.length, this.hAbsToScreen / this.cachedTiles[i].length);

        if (t.tile) t.tile.display();
        if (t.entity) t.entity.display();
      }
    }
  }

  show() {
    this.hidden = false;
    for (let i = 0; i < this.cachedTiles.length; i++) {
      for (let j = 0; j < this.cachedTiles[i].length; j++) {
        this.cachedTiles[i][j].tile.show();
        this.cachedTiles[i][j].entity.show();
      }
    }
  }

  hide() {
    this.hidden = true;
    for (let i = 0; i < this.cachedTiles.length; i++) {
      for (let j = 0; j < this.cachedTiles[i].length; j++) {
        this.cachedTiles[i][j].tile.hide();
        this.cachedTiles[i][j].entity.hide();
      }
    }
  }

  resize(parentXAbs, parentYAbs, parentWAbs, parentHAbs) {
    super.resize(parentXAbs, parentYAbs, parentWAbs, parentHAbs);
    for (let i = 0; i < this.cachedTiles.length; i++) {
      for (let j = 0; j < this.cachedTiles[i].length; j++) {
        let t = this.cachedTiles[i][j];
        if (t.tile) t.tile.resize(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
        if (t.entity) t.entity.resize(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
      }
    }
    /*
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        this.tiles[i][j].resize(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
      }
    }
    */
  }

  updateImages(x, y) {
    let s = Date.now();
    let viewRange = player.attributes.sight.total;
    let xPos = player.position.x - floor(viewRange / 2);
    let yPos = player.position.y - floor(viewRange / 2);
    let w1 = 1 / viewRange;
    /*
        for (let i = 0; i < this.cachedTiles.length; i++) {
          for (let j = 0; j < this.cachedTiles[i].length; j++) {
            this.cachedTiles[i][j].hide();
            let tile = null;
            let entity = null;
            if (xPos + i > this.width - 1 || xPos + i < 0 || yPos + j > this.height - 1 || yPos + j < 0) {
              tile = new CustomImage("/MapStuff/usedTextures/textures/void.png", i * w1, j * w1, w1, w1);
              entity = new CustomImage("/MapStuff/usedTextures/entities/none.png", i * w1, j * w1, w1, w1);
            } else {
              let t = this.tiles[xPos + i][yPos + j];
              tile = new CustomImage(textureList[t.tileID], i * w1, j * w1, w1, w1);
              entity = new CustomImage(entityList[t.entityID], i * w1, j * w1, w1, w1);
            }
            this.cachedTiles[i][j].tile = tile;
            this.cachedTiles[i][j].entity = entity;
            this.cachedTiles[i][j].show();
            this.cachedTiles[i][j].tile.resize(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
            this.cachedTiles[i][j].entity.resize(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);

          }
        }

        */

    let tmpArray = [];
    for (let i = 0; i < this.cachedTiles.length; i++) {
      tmpArray[i] = [];
      for (let j = 0; j < this.cachedTiles[i].length; j++) {
        this.cachedTiles[i][j].hide();
        tmpArray[i][j] = {
          tile: null,
          entity: null
        };
        if (i + x >= 0 && i + x < this.cachedTiles.length && j + y >= 0 && j + y < this.cachedTiles[i].length) {
          tmpArray[i][j].tile = this.cachedTiles[i + x][j + y].tile;
          tmpArray[i][j].entity = this.cachedTiles[i + x][j + y].entity;
        } else {
          //Not cached, get picture from tiles
          if (xPos + i + x >= 0 && xPos + i + x < this.tiles.length && yPos + j + y >= 0 && yPos + j + y < this.tiles[i].length) {
            let newX = xPos + i + x;
            let newY = yPos + j + y;
            let tID = this.tiles[newX][newY].tileID;
            let eID = this.tiles[newX][newY].entityID;
            tmpArray[i][j].tile = new CustomImage(textureList[tID], 0, 0, w1, w1);
            tmpArray[i][j].entity = new CustomImage(entityList[eID], 0, 0, w1, w1);
            if (!mainWindow.subMenus[0].children[0].children[0].tiles[newX][newY].visible) mainWindow.subMenus[0].children[0].children[1].updatePixels(newX, newY);
          } else {
            tmpArray[i][j].tile = new CustomImage("MapStuff/usedTextures/textures/void.png", 0, 0, w1, w1);
            tmpArray[i][j].entity = new CustomImage("MapStuff/usedTextures/entities/none.png", 0, 0, w1, w1);
          }
        }
        //console.log(i, j, tmpArray[i][j]);
      }
    }
    for (let i = 0; i < this.cachedTiles.length; i++) {
      for (let j = 0; j < this.cachedTiles[i].length; j++) {
        this.cachedTiles[i][j].tile = tmpArray[i][j].tile;
        this.cachedTiles[i][j].entity = tmpArray[i][j].entity;
        this.cachedTiles[i][j].tile.xRelToParent = i * w1;
        this.cachedTiles[i][j].entity.xRelToParent = i * w1;
        this.cachedTiles[i][j].tile.yRelToParent = j * w1;
        this.cachedTiles[i][j].entity.yRelToParent = j * w1;
        this.cachedTiles[i][j].tile.resize(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
        this.cachedTiles[i][j].entity.resize(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
        this.cachedTiles[i][j].show();
      }
    }
  }

  set(x, y, id) {
    if (!(x >= 0 && x < this.width && y >= 0 && y < this.height)) {
      console.log("INVALID TILE", x, y);
      return;
    }
    this.tiles[x][y].set(id);
    //updateMinimap(x, y, id);
  }

  setEntity(x, y, id) {
    this.tiles[x][y].setEntity(id);
  }
}

class TileSet {
  constructor(i, j) {
    this.x = i;
    this.y = j;
    this.tileID = 0;
    this.entityID = 0;
    this.visible = false;
    //this.img.size(dim, dim);
  }

  setEntity(i) {
    this.entityID = i;
  }

  set(i) {
    this.tileID = i;
  }
}
