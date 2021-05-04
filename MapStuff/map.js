// isLocalhost will be True if you site is hosted on localhost. Otherwise it will be False.
var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
  // [::1] is the IPv6 localhost address.
  window.location.hostname === '[::1]' ||
  // 127.0.0.1/8 is considered localhost for IPv4.
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

let mapDir = "MapStuff/usedTextures/";
//if (!isLocalhost) mapDir = "Fruit-Smasher/" + mapDir;
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
      newMap.tiles[x][y].setTex(newMap.getNoise2D(x, y));
      switch (ids.entityID) {
        case 1: //Scorpion
          enemies.push(new Enemy(x, y, ids.entityID, enemies.length));
          entityCount.enemy.normal.total++;
          break;
        case 2: //Spider
          enemies.push(new Enemy(x, y, ids.entityID, enemies.length));
          entityCount.enemy.normal.total++;
          break;
        case 3: //Boss
          enemies.push(new Enemy(x, y, ids.entityID, enemies.length));
          entityCount.enemy.boss.total++;
          break;
        case 4: //Key
          entityCount.object.key.total++;
          break;
        case 5: //Trap
          break;
        case 6: //Spawner/Portal
          entityCount.enemy.spawner.total++;
          break;
        case 7:
          player.position.x = x;
          player.position.y = y;
          break;
        default:
          continue;
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
  mainWindow.subMenus[0].children[0].children[0].updateImages(0, 0);
  mainWindow.resize();
  mainWindow.displayOnce();
  entityCount.enemy.boss.current = entityCount.enemy.boss.total;
  entityCount.enemy.normal.current = entityCount.enemy.normal.total;
  entityCount.enemy.spawner.current = entityCount.enemy.spawner.total;
  entityCount.object.key.current = entityCount.object.key.total;
  player.resetMoveCount();
  mainWindow.subMenus[0].children[1].setAction(0);
}

function loadMap(zone) {
  mainWindow.subMenus[0].children[0].children[0].hide();
  let saveName = "MapStuff/maps/test" + zone + ".png";
  //if (!isLocalhost) saveName = "Fruit-Smasher/" + saveName;
  loadImage(saveName, loadActualMap, generateDefaultMap);
}

function getAverageColor(img, i, j, t) {
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
  //console.log(sr, sg, sb);
  if (typeof colorList[t] === 'undefined') colorList[t] = [];
  if (typeof colorList[t][i] === 'undefined') colorList[t][i] = [];
  colorList[t][i][j] = [];
  colorList[t][i][j][0] = sr;
  colorList[t][i][j][1] = sg;
  colorList[t][i][j][2] = sb;
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

  for (let i = 0; i < textureList.length; i++) {
    for (let j = 0; j < textureList[i].length; j++) {
      loadImage(textureList[i][j], (img) => {
        getAverageColor(img, i, j, 0);
      });
    }
  }

  entityList[0] = mapDir + "entities/none.png";
  entityList[1] = mapDir + "entities/enemy0.png";
  entityList[2] = mapDir + "entities/enemy1.png";
  entityList[3] = mapDir + "entities/boss.png";
  entityList[4] = mapDir + "entities/key.png";
  entityList[5] = mapDir + "entities/trap.png";
  entityList[6] = mapDir + "entities/portal.png";
  entityList[7] = mapDir + "entities/player.png";
  /*
  for (let i = 0; i < entityList.length; i++) {
    loadImage(entityList[i], (img) => {
      getAverageColor(img, i, 0, 1);
    });
  }
  */
  let col = [
    color(0, 0, 0, 0), //minimap color none
    color(204, 68, 0), //minimap color scorpion
    color(255, 119, 51), //minimap color spider
    color(255, 0, 0), //minimap color boss
    color(200, 180, 50), //minimap color key
    color(100, 100, 100), //minimap color trap
    color(153, 0, 230), //minimap color portal
    color(0, 255, 0) //minimap color player
  ]
  console.log(col);
  colorList[1] = [];
  for (let i = 0; i < entityList.length; i++) {
    colorList[1][i] = [];
    colorList[1][i][0] = [];
    for (let j = 0; j < col[i].levels.length; j++) {
      colorList[1][i][0][j] = col[i].levels[j];
    }
  }
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
          this.content.pixels[4 * id] = colorList[1][eID][0][0];
          this.content.pixels[4 * id + 1] = colorList[1][eID][0][1];
          this.content.pixels[4 * id + 2] = colorList[1][eID][0][2];
          this.content.pixels[4 * id + 3] = 255;
        } else {
          this.content.pixels[4 * id] = colorList[0][tID][sID][0];
          this.content.pixels[4 * id + 1] = colorList[0][tID][sID][1];
          this.content.pixels[4 * id + 2] = colorList[0][tID][sID][2];
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
    /*
    let w1 = 1 / player.attributes.sight.total;
    for (let i = 0; i < player.attributes.sight.total; i++) {
      this.cachedTiles[i] = [];
      for (let j = 0; j < player.attributes.sight.total; j++) {
        this.cachedTiles[i][j] = {
          tile: null,
          entity: null,
          hide() {
            this.tile.hide();
            if (this.entity) this.entity.hide();
          },
          show() {
            this.tile.show();
            if (this.entity) this.entity.show();
          }
        };
        this.cachedTiles[i][j].hide();
      }
    }
*/

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

  updateTileMap(x, y, id) {
    this.tiles[x][y].setEntity(id);
  }

  updateCacheMap(x, y, id) {
    let viewRange = player.attributes.sight.total;
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
    let viewRange = player.attributes.sight.total;
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
    let viewRange = player.attributes.sight.total;
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
        eID: -1,
      }
    } else {
      let t = this.tiles[x][y];
      return {
        tID: t.tileID,
        eID: t.entityID
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
}

class TileSet {
  constructor(i, j) {
    this.x = i;
    this.y = j;
    this.tileID = 0;
    this.subTexID = 0;
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

  setTex(i) {
    this.subTexID = i;
  }
}
