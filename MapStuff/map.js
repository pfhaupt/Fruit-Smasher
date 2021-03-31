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

function generateDefaultMap(dim, x, y, w, h) {
  return new Map(dim, 0, false, x, y, w, h).tiles;
}

function loadMap(zone, x, y, w, h) {
  let saveName = defaultSaveName + zone;
  let storedSave = localStorage.getItem(saveName);
  if (storedSave === null || typeof storedSave === "undefined") {
    console.log("Nothing to load!");
    return generateDefaultMap(100, x, y, w, h);
  }
  let decodeSave = atob(storedSave);
  let parsedSave = JSON.parse(decodeSave);
  let save = parsedSave;

  console.log("Found ", save);

  let mapWidth, mapHeight, mapDim;
  let defaultDim = 32;

  if (save.tiles === null || typeof save.tiles === 'undefined') {
    console.log("No tiles given, setting default Map.");
    save.tiles = [];
  }

  if (save.dim === null || typeof save.dim === 'undefined') {
    console.log("No dimension given, setting to default.");
    mapDim = defaultDim;
  } else {
    console.log("Setting dimension to " + save.dim + ".");
    mapDim = save.dim;
  }
  if (save.xSize === null || typeof save.xSize === 'undefined') {
    console.log("No map width given, setting to default.");
    mapWidth = mapSize / defaultDim;
  } else {
    console.log("Setting map width to " + save.xSize + ".");
    mapWidth = save.xSize;
  }
  if (save.ySize === null || typeof save.ySize === 'undefined') {
    console.log("No map height given, setting to default.");
    mapHeight = mapSize / defaultDim;
  } else {
    console.log("Setting map height to " + save.ySize + ".");
    mapHeight = save.ySize;
  }

  tileSize = mapSize / mapDim;

  console.log("Initializing new Map");
  let newMap = new Map(mapDim, -1, false, x, y, w, h);

  dim = mapDim;

  console.log("Filling new Map");
  for (let t of save.tiles) {
    //console.log("Loaded tile at (" + t.xPos + "," + t.yPos + ") with an ID of " + t.tileID);
    if (t.index) newMap.set(t.xPos, t.yPos, t.index);
    if (t.tileID) newMap.set(t.xPos, t.yPos, t.tileID);
    if (t.entityID) newMap.setEntity(t.xPos, t.yPos, t.entityID);
  }

  console.log(newMap);
  return newMap.tiles;
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

  entityList[0] = "/MapStuff/usedTextures/entities/enemy0.png";
  entityList[1] = "/MapStuff/usedTextures/entities/enemy1.png";
  entityList[2] = "/MapStuff/usedTextures/entities/boss.png";
  entityList[3] = "/MapStuff/usedTextures/entities/key.png";
  entityList[4] = "/MapStuff/usedTextures/entities/trap.png";
  entityList[5] = "/MapStuff/usedTextures/entities/portal.png";
  entityList[6] = "/MapStuff/usedTextures/entities/player.png";
}

class Map extends BaseUIBlock {
  constructor(dim, zone, load, x, y, w, h) {
    super(x, y, w, h);
    loadImages();
    this.aspectRatio = 1;
    this.tiles = [];
    this.width = dim;
    this.height = dim;
    if (!load) {
      for (let i = 0; i < dim; i++) {
        this.tiles[i] = [];
        for (let j = 0; j < dim; j++) {
          this.tiles[i][j] = new TileSet(i, j);
        }
      }
    } else {
      this.tiles = loadMap(zone);
      this.width = this.tiles.length;
      this.height = this.tiles[0].length;
    }
    this.cachedTiles = [];
    let w1 = 1 / player.attributes.sight.total;
    for (let i = 0; i < player.attributes.sight.total; i++) {
      this.cachedTiles[i] = [];
      for (let j = 0; j < player.attributes.sight.total; j++) {
        this.cachedTiles[i][j] = {
          tile: new Image(textureList[0], i * w1, j * w1, w1, w1),
          entity: null,
          hide() {
            if (this.tile) this.tile.hide();
            if (this.entity) this.entity.hide();
          },
          show() {
            if (this.tile) this.tile.show();
            if (this.entity) this.entity.show();
          }
        };
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
        let t = this.cachedTiles[i][j];
        if (t) t.show();
      }
    }
  }

  hide() {
    this.hidden = true;
    for (let i = 0; i < this.cachedTiles.length; i++) {
      for (let j = 0; j < this.cachedTiles[i].length; j++) {
        let t = this.cachedTiles[i][j];
        if (t) t.hide();
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
          tile = new Image("/MapStuff/usedTextures/textures/void.png", i * w1, j * w1, w1, w1);
        } else {
          let t = this.tiles[xPos + i][yPos + j];
          tile = new Image(textureList[t.tileID], i * w1, j * w1, w1, w1);
          if (t.entityID !== -1) entity = new Image(entityList[t.entityID], i * w1, j * w1, w1, w1);
        }
        this.cachedTiles[i][j].tile = tile;
        this.cachedTiles[i][j].entity = entity;
        this.cachedTiles[i][j].show();
        this.cachedTiles[i][j].tile.resize(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
        if (this.cachedTiles[i][j].entity) this.cachedTiles[i][j].entity.resize(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);

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
    this.entityID = -1;
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
