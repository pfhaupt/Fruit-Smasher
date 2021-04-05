let defaultSaveName = "CustomMapForGame_";
let dim = 10;
let mapSize = 1000;
let tileSize = mapSize / dim;
let minimap;
let colorList;
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
    }
  }
  let m = mainWindow.subMenus[0].children[0];
  let xrel = m.xRelToParent;
  let yrel = m.yRelToParent;
  let hrel = m.hRelToParent;
  let wrel = m.wRelToParent;
  mainWindow.subMenus[0].children[0] = newMap;
  mainWindow.subMenus[0].children[0].xRelToParent = xrel;
  mainWindow.subMenus[0].children[0].yRelToParent = yrel;
  mainWindow.subMenus[0].children[0].hRelToParent = hrel;
  mainWindow.subMenus[0].children[0].wRelToParent = wrel;
  mainWindow.subMenus[0].children[0].updateImages(0, 0);
}

function loadMap(zone) {
  mainWindow.subMenus[0].children[0].hide();
  let saveName = "MapStuff/maps/test" + zone + ".png";
  loadImage(saveName, loadActualMap, generateDefaultMap);
  mainWindow.subMenus[0].children[0].show();
}

function generateMinimap() {
  minimap = createImage(200, 200);
  minimap.loadPixels();
  for (let i = 0; i < minimap.width; i++) {
    for (let j = 0; j < minimap.height; j++) {
      let x = floor(i * map.width / minimap.width);
      let y = floor(j * map.height / minimap.height);
      minimap.set(i, j, colorList[map.tiles[x][y].tileID]);
    }
  }
  minimap.updatePixels();
}

function loadImages() {
  let alpha = 155;
  colorList = [
    color(0, 255, 0, alpha),
    color(255, 255, 0, alpha),
    color(0, 0, 255, alpha),
  ];

  textureList[0] = "/MapStuff/usedTextures/textures/grass.jpg";
  textureList[1] = "/MapStuff/usedTextures/textures/sand.jpg";
  textureList[2] = "/MapStuff/usedTextures/textures/water.jpg";

  entityList[0] = "/MapStuff/usedTextures/entities/none.png";
  entityList[1] = "/MapStuff/usedTextures/entities/enemy0.png";
  entityList[2] = "/MapStuff/usedTextures/entities/enemy1.png";
  entityList[3] = "/MapStuff/usedTextures/entities/boss.png";
  entityList[4] = "/MapStuff/usedTextures/entities/key.png";
  entityList[5] = "/MapStuff/usedTextures/entities/trap.png";
  entityList[6] = "/MapStuff/usedTextures/entities/portal.png";
  entityList[7] = "/MapStuff/usedTextures/entities/player.png";
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
        this.cachedTiles[i][j].show();
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
    /*
    let tmpArray = [];
    for (let i = 0; i < this.cachedTiles.length; i++) {
      tmpArray[i] = [];
      for (let j = 0; j < 1; j++) {
        this.cachedTiles[i][j].hide();
        tmpArray[i][j] = {
          tile: null,
          entity: null
        };
        if (i + x >= 0 && i + x < this.cachedTiles.length && j + y >= 0 && j + y < this.cachedTiles[i].length) {
          tmpArray[i][j].tile = this.cachedTiles[i + x][j + y].tile;
          tmpArray[i][j].entity = this.cachedTiles[i + x][j + y].entity;
        }
        console.log(i, j, tmpArray[i][j]);
      }
    }
    for (let i = 0; i < this.cachedTiles.length; i++) {
      for (let j = 0; j < 1; j++) {
        this.cachedTiles[i][j].tile = tmpArray[i][j].tile;
        this.cachedTiles[i][j].entity = tmpArray[i][j].entity;
        console.log(i, j, this.cachedTiles[i][j]);
        this.cachedTiles[i][j].show();
      }
    }*/
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
