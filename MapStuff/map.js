let EntityIDs = {
  None: 0,
  Spider: 1,
  Scorpion: 2,
  Wraith: 3,
  Octopus: 4,
  Ghost: 5,
  Dragon: 6,
  SkeletonBoss: 7,
  Key: 8,
  Trap: 9,
  Portal: 10,
  Player: 11,
};

let TextureIDs = {
  Grass: 0,
  Sand: 1,
  Water: 2
};

let SubTextureIDs = {
  VeryLight: 0,
  Light: 1,
  Dark: 2,
  VeryDark: 3
};

let mapDir = "MapStuff/usedTextures/";
let dim = 10;
let mapSize = 1000;
let tileSize = mapSize / dim;
let minimap;
let textureColorList = [];
let entityColorList = [];
let entityNames = [];
let entityList = [];
let textureNames = [];
let textureList = [];

function generateDefaultMap() {
  console.log("Didn't find a map file, generating default map.");
  dim = 10;
  tileSize = mapSize / dim;

  let m = mainWindow.subMenus[0].children[0];
  let xrel = m.xRelToParent;
  let yrel = m.yRelToParent;
  let hrel = m.hRelToParent;
  let wrel = m.wRelToParent;
  mainWindow.subMenus[0].children[0] = new WorldMap(10, 0, 0, 0, 1, 1);
  mainWindow.subMenus[0].children[0].xRelToParent = xrel;
  mainWindow.subMenus[0].children[0].yRelToParent = yrel;
  mainWindow.subMenus[0].children[0].hRelToParent = hrel;
  mainWindow.subMenus[0].children[0].wRelToParent = wrel;
  mainWindow.subMenus[0].children[0].updateImages(0, 0);
}

function loadActualMap(sav) {
  enemies = [];
  entityCount = {
    enemy: {
      normal: {
        current: 0,
        total: 0
      },
      boss: {
        current: 0,
        total: 0
      },
      spawner: {
        current: 0,
        total: 0
      }
    },
    object: {
      key: {
        current: 0,
        total: 0
      }
    }
  }

  let newMap = new WorldMap(0, 0);
  let mapFile = sav;
  dim = mapFile.width;
  tileSize = mapSize / dim;
  newMap.width = dim;
  newMap.height = dim;
  mainWindow.subMenus[0].children[0].children[1].clear();

  let d = dim;

  let getID = (a) => {
    return {
      tileID: round((a - (a % 50)) / 50),
      entityID: a % 50
    };
  };
  sav.loadPixels();
  newMap.tiles = new Array(d);
  for (let x = 0; x < d; x++) {
    newMap.tiles[x] = [];
    for (let y = 0; y < d; y++) {
      newMap.tiles[x][y] = new TileSet();
      let id = mapFile.pixels[(y * dim + x) * 4];
      let ids = getID(id);
      if (ids.tileID !== 0) newMap.tiles[x][y].set(ids.tileID);
      if (ids.entityID !== 0) newMap.tiles[x][y].setEntity(ids.entityID);
      if (ids.entityID >= 1 && ids.entityID <= 7) newMap.tiles[x][y].setEnemyID(enemies.length);
      newMap.tiles[x][y].setTex(newMap.getNoise2D(x, y));
      mainWindow.subMenus[0].children[0].children[0].handleEnemy(x, y, ids.entityID);
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


  let viewRange = player.attributes[AttributeIDs.Sight].getTotal();
  let xPos = player.position.x - floor(viewRange / 2);
  let yPos = player.position.y - floor(viewRange / 2);

  let w1 = 1 / viewRange;
  for (let i = 0; i < viewRange; i++) {
    mainWindow.subMenus[0].children[0].children[0].cachedTiles[i] = [];
    for (let j = 0; j < viewRange; j++) {
      let posWithOffX = xPos + i;
      let posWithOffY = yPos + j;
      mainWindow.subMenus[0].children[0].children[0].cachedTiles[i][j] = {
        tile: null,
        entity: null
      };
      if (posWithOffX >= 0 && posWithOffX < mainWindow.subMenus[0].children[0].children[0].tiles.length && posWithOffY >= 0 && posWithOffY < mainWindow.subMenus[0].children[0].children[0].tiles.length) {
        let t = mainWindow.subMenus[0].children[0].children[0].tiles[posWithOffX][posWithOffY];
        t.visible = true;
        mainWindow.subMenus[0].children[0].children[1].updatePixels(posWithOffX, posWithOffY);
        let tID = t.tileID;
        let eID = t.entityID;
        let sID = t.subTexID;
        mainWindow.subMenus[0].children[0].children[0].cachedTiles[i][j].tile = new CustomImage(textureList[tID][sID], 0, 0, w1, w1);
        if (eID !== 0) mainWindow.subMenus[0].children[0].children[0].cachedTiles[i][j].entity = new CustomImage(entityList[eID], 0, 0, w1, w1);
      } else {
        let sID = mainWindow.subMenus[0].children[0].children[0].getNoise2D(posWithOffX, posWithOffY);
        mainWindow.subMenus[0].children[0].children[0].cachedTiles[i][j].tile = new CustomImage(mapDir + "textures/void_tiles/void" + sID + ".png", 0, 0, w1, w1);
        mainWindow.subMenus[0].children[0].children[0].cachedTiles[i][j].entity = null;
      }
      mainWindow.subMenus[0].children[0].children[0].cachedTiles[i][j].tile.hide();
      if (mainWindow.subMenus[0].children[0].children[0].cachedTiles[i][j].entity) mainWindow.subMenus[0].children[0].children[0].cachedTiles[i][j].entity.hide();
    }
  }

  for (let enemy of enemies) enemy.updatePositions(enemy.position.x, enemy.position.y);

  mainWindow.subMenus[0].children[0].children[0].updateImages(0, 0);
  mainWindow.resize();
  mainWindow.displayOnce();
  entityCount.enemy.boss.current = entityCount.enemy.boss.total;
  entityCount.enemy.normal.current = entityCount.enemy.normal.total;
  entityCount.enemy.spawner.current = entityCount.enemy.spawner.total;
  entityCount.object.key.current = entityCount.object.key.total;
  player.resetMoveCount();
  mainWindow.subMenus[0].children[1].setAction(ActionScreen.Idle);
}

function loadMap(zone) {
  mainWindow.subMenus[0].children[0].children[0].hide();
  let saveName = "MapStuff/maps/test" + zone + ".png";
  //if (!isLocalhost) saveName = "Fruit-Smasher/" + saveName;
  loadImage(saveName, loadActualMap, generateDefaultMap);
}

function getAverageColor(img, i, j) {
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
  textureColorList[i][j][0] = sr;
  textureColorList[i][j][1] = sg;
  textureColorList[i][j][2] = sb;
  //console.log(sr, sg, sb);
}

function loadImages() {
  let alpha = 255;

  let n = ["grass", "sand", "water", "void"];
  for (let i = 0; i < 4; i++) {
    textureList[i] = [];
    for (let j = 0; j < 4; j++) {
      textureList[i][j] = mapDir + "textures/" + n[i] + "_tiles/" + n[i] + "" + j + ".png";
    }
  }
  textureColorList = [];

  for (let i = 0; i < textureList.length; i++) {
    textureColorList[i] = [];
    for (let j = 0; j < textureList[i].length; j++) {
      textureColorList[i][j] = [];
      loadImage(textureList[i][j], (img) => {
        getAverageColor(img, i, j);
      });
    }
  }
  entityList[EntityIDs.None] = mapDir + "entities/none.png";
  entityList[EntityIDs.Scorpion] = mapDir + "entities/scorpion.png";
  entityList[EntityIDs.Spider] = mapDir + "entities/spider.png";
  entityList[EntityIDs.SkeletonBoss] = mapDir + "entities/boss_skeleton.png";
  entityList[EntityIDs.Key] = mapDir + "entities/key.png";
  entityList[EntityIDs.Trap] = mapDir + "entities/trap.png";
  entityList[EntityIDs.Portal] = mapDir + "entities/portal.png";
  entityList[EntityIDs.Player] = mapDir + "entities/player.png";
  entityList[EntityIDs.Wraith] = mapDir + "entities/wraith.png";
  entityList[EntityIDs.Octopus] = mapDir + "entities/octopus.png";
  entityList[EntityIDs.Ghost] = mapDir + "entities/ghost.png";
  entityList[EntityIDs.Dragon] = mapDir + "entities/boss_dragon.png";

  for (let i = 0; i < entityList.length; i++) {
    entityColorList[i] = [];
    entityColorList[i][0] = 255;
    entityColorList[i][1] = 0;
    entityColorList[i][2] = 0;
  }
  entityColorList[EntityIDs.Key][0] = 255;
  entityColorList[EntityIDs.Key][1] = 215;
  entityColorList[EntityIDs.Key][2] = 0;
  entityColorList[EntityIDs.Player][0] = 0;
  entityColorList[EntityIDs.Player][1] = 255;
  entityColorList[EntityIDs.Player][2] = 0;
}

class Minimap extends BaseUIBlock {
  constructor(x, y, w, h) {
    super(x, y, w, h);
    this.aspectRatio = 1;
    this.content = createImage(200, 200);
    this.clear();
  }

  displayEveryFrame() {
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
  }

  displayOnce() {
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
    if (!mainWindow.subMenus[0].children[0].children[0].tiles[x][y].visible) return;
    mainWindow.subMenus[0].children[0].children[0].tiles[x][y].visible = true;
    let map = mainWindow.subMenus[0].children[0].children[0].tiles;
    let w = this.content.width / map.length;

    let tID = map[x][y].tileID;
    let eID = map[x][y].entityID;
    let sID = map[x][y].subTexID;

    this.content.loadPixels();
    for (let i = 0; i < w; i++) {
      for (let j = 0; j < w; j++) {
        let xp = x * w + i;
        let yp = y * w + j;
        let id = yp * this.content.width + xp;
        if (eID !== 0) {
          this.content.pixels[4 * id] = entityColorList[eID][0];
          this.content.pixels[4 * id + 1] = entityColorList[eID][1];
          this.content.pixels[4 * id + 2] = entityColorList[eID][2];
          this.content.pixels[4 * id + 3] = 255;
        } else {
          this.content.pixels[4 * id] = textureColorList[tID][sID][0];
          this.content.pixels[4 * id + 1] = textureColorList[tID][sID][1];
          this.content.pixels[4 * id + 2] = textureColorList[tID][sID][2];
          this.content.pixels[4 * id + 3] = 255;
        }
      }
    }
    this.content.updatePixels();
    this.displayOnce();
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

class WorldMap extends BaseUIBlock {
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

    this.xMul = 0.3239;
    this.xOffs = 0; //.51031;
    this.yMul = 0.328;
    this.yOffs = 0;
    this.noiseMaxID = 5; //0.192179;
  }

  displayEveryFrame() {}

  displayOnce() {
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
        t.tile.displayOnce();
        if (t.entity) t.entity.displayOnce();
      }
    }
  }

  show() {
    this.hidden = false;
    for (let i = 0; i < this.cachedTiles.length; i++) {
      for (let j = 0; j < this.cachedTiles[i].length; j++) {
        this.cachedTiles[i][j].tile.show();
        if (this.cachedTiles[i][j].entity) this.cachedTiles[i][j].entity.show();
      }
    }
  }

  hide() {
    this.hidden = true;
    for (let i = 0; i < this.cachedTiles.length; i++) {
      for (let j = 0; j < this.cachedTiles[i].length; j++) {
        this.cachedTiles[i][j].tile.hide();
        if (this.cachedTiles[i][j].entity) this.cachedTiles[i][j].entity.hide();
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
    this.displayOnce();
  }

  updateEverything(x, y, px, py, id, placeInMap) {
    this.updateTileMap(px, py, EntityIDs.None);
    this.updateTileMap(x, y, id);
    this.updateEnemyPos(px, py, -1);
    this.updateEnemyPos(x, y, placeInMap);
    this.updateCacheMap(px, py, EntityIDs.None);
    this.updateCacheMap(x, y, id);
  }

  updateTileMap(x, y, id) {
    this.tiles[x][y].setEntity(id);
  }

  updateEnemyPos(x, y, id) {
    this.tiles[x][y].setEnemyID(id);
  }

  updateCacheMap(x, y, id) {
    let viewRange = player.attributes[AttributeIDs.Sight].total;
    let xPos = player.position.x - floor(viewRange / 2);
    let yPos = player.position.y - floor(viewRange / 2);
    let w1 = 1 / viewRange;
    let x1 = x - xPos,
      y1 = y - yPos;
    if (x1 >= 0 && y1 >= 0 && x1 < viewRange && y1 < viewRange) { //position cached
      let t = this.cachedTiles[x1][y1];
      if (t.entity) t.entity.content.elt.remove();
      if (id !== 0) {
        t.entity = new CustomImage(entityList[id], x1 * w1, y1 * w1, w1, w1);
        t.entity.resize(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
        t.entity.show();
        t.entity.displayOnce();
      }
    } else { //position outside of cache

    }
  }

  updateImages(x, y) {
    let viewRange = player.attributes[AttributeIDs.Sight].total;
    let xPos = player.position.x - floor(viewRange / 2);
    let yPos = player.position.y - floor(viewRange / 2);
    let w1 = 1 / viewRange;

    let tmpArray = [];
    for (let i = 0; i < this.cachedTiles.length; i++) {
      tmpArray[i] = [];
      for (let j = 0; j < this.cachedTiles[i].length; j++) {
        tmpArray[i][j] = {
          tile: null,
          entity: null
        };
        if (i + x >= 0 && i + x < this.cachedTiles.length && j + y >= 0 && j + y < this.cachedTiles[i].length) {
          tmpArray[i][j].tile = this.cachedTiles[i + x][j + y].tile;
          tmpArray[i][j].entity = this.cachedTiles[i + x][j + y].entity;
        } else {
          //Not cached, get picture from tiles
          let newX = xPos + i + x;
          let newY = yPos + j + y;
          if (newX >= 0 && newX < this.width && newY >= 0 && newY < this.height) {
            let tID = this.tiles[newX][newY].tileID;
            let eID = this.tiles[newX][newY].entityID;
            let sID = this.tiles[newX][newY].subTexID;
            tmpArray[i][j].tile = new CustomImage(textureList[tID][sID], 0, 0, w1, w1);
            if (eID !== 0) tmpArray[i][j].entity = new CustomImage(entityList[eID], 0, 0, w1, w1);
            mainWindow.subMenus[0].children[0].children[0].tiles[newX][newY].visible = true;
            mainWindow.subMenus[0].children[0].children[1].updatePixels(newX, newY);
          } else {
            let sID = this.getNoise2D(newX, newY);
            tmpArray[i][j].tile = new CustomImage(mapDir + "textures/void_tiles/void" + sID + ".png", 0, 0, w1, w1);
            tmpArray[i][j].entity = null; // = new CustomImage(mapDir + "entities/none.png", 0, 0, w1, w1);
          }
        }
        //console.log(i, j, tmpArray[i][j]);
      }
    }

    if (x == -1) {
      //Delete right row
      for (let i = 0; i < this.cachedTiles.length; i++) {
        let t = this.cachedTiles[this.cachedTiles.length - 1][i];
        t.tile.content.elt.remove();
        if (t.entity) t.entity.content.elt.remove();
      }
    } else if (x == 1) {
      //Delete left row
      for (let i = 0; i < this.cachedTiles.length; i++) {
        let t = this.cachedTiles[0][i];
        t.tile.content.elt.remove();
        if (t.entity) t.entity.content.elt.remove();
      }
    } else if (y == -1) {
      //Delete bottom column
      for (let i = 0; i < this.cachedTiles.length; i++) {
        let t = this.cachedTiles[i][this.cachedTiles.length - 1];
        t.tile.content.elt.remove();
        if (t.entity) t.entity.content.elt.remove();
      }
    } else if (y == 1) {
      //Delete top column
      for (let i = 0; i < this.cachedTiles.length; i++) {
        let t = this.cachedTiles[i][0];
        t.tile.content.elt.remove();
        if (t.entity) t.entity.content.elt.remove();
      }
    }

    for (let i = 0; i < this.cachedTiles.length; i++) {
      for (let j = 0; j < this.cachedTiles[i].length; j++) {
        let t = this.cachedTiles[i][j];
        t.tile = tmpArray[i][j].tile;
        t.entity = tmpArray[i][j].entity;
        t.tile.xRelToParent = i * w1;
        t.tile.yRelToParent = j * w1;
        t.tile.resize(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
        t.tile.show();
        if (t.entity) {
          t.entity.xRelToParent = i * w1;
          t.entity.yRelToParent = j * w1;
          t.entity.resize(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
          t.entity.show();
        }
      }
    }

    this.displayOnce();
  }

  forceUpdate() {
    console.log("Forcing Cached Tiles Update");
    let viewRange = player.attributes[AttributeIDs.Sight].total;
    let xPos = player.position.x - floor(viewRange / 2);
    let yPos = player.position.y - floor(viewRange / 2);
    let w1 = 1 / viewRange;
    for (let i = 0; i < this.cachedTiles.length; i++) {
      for (let j = 0; j < this.cachedTiles.length; j++) {
        let t = this.cachedTiles[i][j];
        t.tile.content.elt.remove();
        if (t.entity) t.entity.content.elt.remove();
      }
    }
    this.cachedTiles = new Array(viewRange);
    for (let i = 0; i < viewRange; i++) {
      this.cachedTiles[i] = [];
      for (let j = 0; j < viewRange; j++) {
        this.cachedTiles[i][j] = {
          tile: null,
          entity: null
        };
        let newX = xPos + i;
        let newY = yPos + j;
        if (newX >= 0 && newX < this.width && newY >= 0 && newY < this.height) {
          let tID = this.tiles[newX][newY].tileID;
          let eID = this.tiles[newX][newY].entityID;
          let sID = this.tiles[newX][newY].subTexID;
          this.cachedTiles[i][j].tile = new CustomImage(textureList[tID][sID], 0, 0, w1, w1);
          if (eID !== 0) this.cachedTiles[i][j].entity = new CustomImage(entityList[eID], 0, 0, w1, w1);
        } else {
          let sID = this.getNoise2D(newX, newY);
          this.cachedTiles[i][j].tile = new CustomImage(mapDir + "textures/void_tiles/void" + sID + ".png", 0, 0, w1, w1);
        }
        this.cachedTiles[i][j].tile.xRelToParent = i * w1;
        this.cachedTiles[i][j].tile.yRelToParent = j * w1;
        this.cachedTiles[i][j].tile.resize(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
        if (this.cachedTiles[i][j].entity) {
          this.cachedTiles[i][j].entity.xRelToParent = i * w1;
          this.cachedTiles[i][j].entity.yRelToParent = j * w1;
          this.cachedTiles[i][j].entity.resize(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
        }
      }
    }
    this.show();
    this.displayOnce();
    mainWindow.subMenus[0].children[0].children[1].displayOnce();
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

  getIDs(x, y) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return {
        tID: -1,
        sID: -1,
        eID: -1,
      }
    } else {
      let t = this.tiles[x][y];
      return {
        tID: t.tileID,
        sID: t.subTexID,
        eID: t.entityID,
      }
    }
  }

  getNoise2D(i, j) {
    let noiseVal = noise(i * this.xMul + this.xOffs, j * this.yMul + this.yOffs);
    let len;
    if (i < 0 || j < 0 || i >= this.width || j >= this.height) len = textureList[3].length + 1;
    else len = textureList[this.tiles[i][j].tileID].length + 1;
    this.noiseMaxID = len;
    noiseVal = floor(noiseVal * this.noiseMaxID);
    return noiseVal;
  }

  checkIfLocationFree(x, y, tID, eID, sID) {
    if (this.getEnemyAtPosition(x, y)) return false; //There's an enemy at the position
    let ids = this.getIDs(x, y); //Get all necessary information about the target position
    if (tID !== null && ids.tID !== tID) return false; //Texture ID is not matching, e.g. if enemy needs to spawn on Grass
    if (eID !== null && ids.eID !== eID) return false; //Entity ID is not matching, e.g. if there's a key at that position
    if (sID !== null && ids.sID !== sID) return false; //SubTexture ID is not matching, e.g. if enemy needs to spawn on Very Dark Tiles
    return true; //Return true if everything matches the criteria
  }

  addEnemyToLocation(x, y, enemyType) {
    if (this.handleEnemy(x, y, enemyType)) {
      let enemy = enemies[enemies.length - 1];
      enemy.initPositions();
    } else {
      console.log("Something went wrong when adding the enemy");
    }
  }

  handleEnemy(x, y, entityID) {
    switch (entityID) {
      case EntityIDs.Scorpion:
        enemies.push(new Scorpion(x, y));
        entityCount.enemy.normal.total++;
        break;
      case EntityIDs.Spider:
        enemies.push(new Spider(x, y));
        entityCount.enemy.normal.total++;
        break;
      case EntityIDs.Ghost:
        enemies.push(new Ghost(x, y));
        entityCount.enemy.normal.total++;
        break;
      case EntityIDs.Wraith:
        enemies.push(new Wraith(x, y));
        entityCount.enemy.normal.total++;
        break;
      case EntityIDs.Octopus:
        enemies.push(new Octopus(x, y));
        entityCount.enemy.normal.total++;
        break;
      case EntityIDs.Dragon:
        enemies.push(new Dragon(x, y));
        entityCount.enemy.boss.total++;
        break;
      case EntityIDs.SkeletonBoss:
        enemies.push(new SkeletonBoss(x, y));
        entityCount.enemy.boss.total++;
        break;
      case EntityIDs.Key: //Key
        entityCount.object.key.total++;
        break;
      case EntityIDs.Trap: //Trap
        enemies.push(new Trap(x, y));
        break;
      case EntityIDs.Portal: //Spawner/Portal
        entityCount.enemy.spawner.total++;
        break;
      case EntityIDs.Player:
        player.position.x = x;
        player.position.y = y;
        break;
      default:
        return false;
    }
    return true;
  }

  getEnemyAtPosition(x, y) {
    if (this.tiles[x][y].enemyID === -1) return null;
    else return enemies[this.tiles[x][y].enemyID];
  }
}

class TileSet {
  constructor() {
    this.tileID = 0;
    this.subTexID = 0;
    this.entityID = 0;
    this.enemyID = -1;
    this.visible = false;
  }

  setEntity(i) {
    this.entityID = i;
  }

  set(i) {
    this.tileID = i;
  }

  setTex(i) {
    this.subTexID = i;
  }

  setEnemyID(i) {
    this.enemyID = i;
  }
}
