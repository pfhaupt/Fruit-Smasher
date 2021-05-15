function loadActualDefaultMap(sav) {
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
  newMap.width = mapFile.width;
  newMap.height = mapFile.height;
  mainWindow.subMenus[0].ch[0].ch[1].clear();

  let d = mapFile.width;

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
      let id = mapFile.pixels[(y * mapFile.width + x) * 4];
      let ids = getID(id);
      if (ids.tileID !== 0) newMap.tiles[x][y].set(ids.tileID);
      if (ids.entityID !== 0) newMap.tiles[x][y].setEntity(ids.entityID);
      if (ids.entityID >= 1 && ids.entityID <= 7) newMap.tiles[x][y].setEnemyID(enemies.length);
      newMap.tiles[x][y].setTex(newMap.getNoise2D(x, y));
      mainWindow.subMenus[0].ch[0].ch[0].handleEnemy(x, y, ids.entityID);
    }
  }

  let m = mainWindow.subMenus[0].ch[0].ch[0];
  let xrel = m.xRelToParent;
  let yrel = m.yRelToParent;
  let hrel = m.hRelToParent;
  let wrel = m.wRelToParent;
  mainWindow.subMenus[0].ch[0].ch[0] = newMap;
  mainWindow.subMenus[0].ch[0].ch[0].xRelToParent = xrel;
  mainWindow.subMenus[0].ch[0].ch[0].yRelToParent = yrel;
  mainWindow.subMenus[0].ch[0].ch[0].hRelToParent = hrel;
  mainWindow.subMenus[0].ch[0].ch[0].wRelToParent = wrel;

  mainWindow.subMenus[0].ch[0].ch[0].cachedTiles = [];


  let viewRange = player.attr[AttrIDs.Sight].getTotal();
  let xPos = player.position.x - floor(viewRange / 2);
  let yPos = player.position.y - floor(viewRange / 2);

  let w1 = 1 / viewRange;
  for (let i = 0; i < viewRange; i++) {
    mainWindow.subMenus[0].ch[0].ch[0].cachedTiles[i] = [];
    for (let j = 0; j < viewRange; j++) {
      let posWithOffX = xPos + i;
      let posWithOffY = yPos + j;
      mainWindow.subMenus[0].ch[0].ch[0].cachedTiles[i][j] = {
        tile: null,
        entity: null
      };
      if (posWithOffX >= 0 && posWithOffX < mainWindow.subMenus[0].ch[0].ch[0].tiles.length && posWithOffY >= 0 && posWithOffY < mainWindow.subMenus[0].ch[0].ch[0].tiles.length) {
        let t = mainWindow.subMenus[0].ch[0].ch[0].tiles[posWithOffX][posWithOffY];
        t.visible = true;
        mainWindow.subMenus[0].ch[0].ch[1].updatePixels(posWithOffX, posWithOffY);
        let tID = t.tileID;
        let eID = t.entityID;
        let sID = t.subTexID;
        mainWindow.subMenus[0].ch[0].ch[0].cachedTiles[i][j].tile = new CustomImage(textureList[tID][sID], 0, 0, w1, w1);
        if (eID !== 0) mainWindow.subMenus[0].ch[0].ch[0].cachedTiles[i][j].entity = new CustomImage(entityList[eID], 0, 0, w1, w1);
      } else {
        let sID = mainWindow.subMenus[0].ch[0].ch[0].getNoise2D(posWithOffX, posWithOffY);
        mainWindow.subMenus[0].ch[0].ch[0].cachedTiles[i][j].tile = new CustomImage(mapDir + "textures/void_tiles/void" + sID + ".png", 0, 0, w1, w1);
        mainWindow.subMenus[0].ch[0].ch[0].cachedTiles[i][j].entity = null;
      }
      mainWindow.subMenus[0].ch[0].ch[0].cachedTiles[i][j].tile.hide();
      if (mainWindow.subMenus[0].ch[0].ch[0].cachedTiles[i][j].entity) mainWindow.subMenus[0].ch[0].ch[0].cachedTiles[i][j].entity.hide();
    }
  }

  for (let enemy of enemies) enemy.updatePositions(enemy.position.x, enemy.position.y);

  mainWindow.subMenus[0].ch[0].ch[0].updateImages(0, 0);
  mainWindow.resize();
  mainWindow.displayOnce();
  entityCount.enemy.boss.current = entityCount.enemy.boss.total;
  entityCount.enemy.normal.current = entityCount.enemy.normal.total;
  entityCount.enemy.spawner.current = entityCount.enemy.spawner.total;
  entityCount.object.key.current = entityCount.object.key.total;
  player.resetMoveCount();
  mainWindow.subMenus[0].ch[1].setAction(ActionScreen.Idle);
}

function loadDefaultMap(zone) {
  mainWindow.subMenus[0].ch[0].ch[0].hide();
  let saveName = "MapStuff/maps/test" + zone + ".png";
  currentZone = zone;
  //if (!isLocalhost) saveName = "Fruit-Smasher/" + saveName;
  loadImage(saveName, loadActualDefaultMap, generateDefaultMap);
}

function loadSaveFile(file) {
  mainWindow.showMenu(SubMenu.Field);
  let map = mainWindow.subMenus[SubMenu.Field].ch[0].ch[0];
  if (file.subtype !== "json") {
    console.log("Wrong File");
    return;
  }


  let saveObj = JSON.retrocycle(JSON.parse(atob(file.data)));
  console.log(saveObj);

  enemies = [];

  mainWindow.subMenus[SubMenu.Field].ch[0].ch[1].clear();

  //enemies = [...saveObj.enemies];
  entityCount = {
    ...saveObj.entityCount
  };

  player.experience = saveObj.player.experience;
  player.level = saveObj.player.level;
  player.chestCount = [...saveObj.player.chestCount];
  player.position = {
    ...saveObj.player.position
  };

  for (let i = 0; i < player.attr.length; i++) {
    if (saveObj.player.attr[i] && saveObj.player.attr[i].skillLevel)
      player.attr[i].skillLevel = saveObj.player.attr[i].skillLevel;
    else
      player.attr[i].skillLevel = 0;
    player.attr[i].calculateTotal();
  }

  let statusEffectKeyed = Object.keys(saveObj.player.statusEffects);
  for (let i = 0; i < statusEffectKeyed.length; i++) {
    player.statusEffects[statusEffectKeyed[i]] = {
      ...saveObj.player.statusEffects[statusEffectKeyed[i]]
    };
  }

  map.tiles = [];
  map.width = saveObj.map.width;
  map.height = saveObj.map.height;
  for (let x = 0; x < saveObj.map.width; x++) {
    map.tiles[x] = [];
    for (let y = 0; y < saveObj.map.height; y++) {
      let t = new TileSet();
      t.set(saveObj.map.pixels[(y * saveObj.map.width + x) * 4]);
      t.setEntity(saveObj.map.pixels[(y * saveObj.map.width + x) * 4 + 1]);
      t.setTex(saveObj.map.pixels[(y * saveObj.map.width + x) * 4 + 2]);
      t.setEnemyID(saveObj.map.pixels[(y * saveObj.map.width + x) * 4 + 3] - 1);
      if (map.handleEnemy(x, y, saveObj.map.pixels[(y * saveObj.map.width + x) * 4 + 1])) {
        console.log("Placed Entity.");
      }
      map.tiles[x][y] = t;
    }
  }

  map.forceUpdate();
  for (let x = 0; x < map.cachedTiles.length; x++) {
    for (let y = 0; y < map.cachedTiles[x].length; y++) {
      map.cachedTiles[x][y].tile.hide();
      if (map.cachedTiles[x][y].entity) map.cachedTiles[x][y].entity.hide();
    }
  }


  let viewRange = player.attr[AttrIDs.Sight].getTotal();
  let xPos = player.position.x - floor(viewRange / 2);
  let yPos = player.position.y - floor(viewRange / 2);

  for (let x = 0; x < map.cachedTiles.length; x++) {
    for (let y = 0; y < map.cachedTiles[x].length; y++) {
      let posWithOffX = xPos + x;
      let posWithOffY = yPos + y;
      if (posWithOffX >= 0 && posWithOffX < map.width && posWithOffY >= 0 && posWithOffY < map.height) {
        map.tiles[posWithOffX][posWithOffY].visible = true;
        mainWindow.subMenus[0].ch[0].ch[1].updatePixels(posWithOffX, posWithOffY);
      }
    }
  }

  for (let enemy of enemies) enemy.updatePositions(enemy.position.x, enemy.position.y);

  map.show();
  windowResized();
}

function saveMap() {
  let map = mainWindow.subMenus[SubMenu.Field].ch[0].ch[0];
  let saveName1 = "map" + currentZone + "_played.json";
  let saveImg = createImage(map.width, map.height);
  saveImg.loadPixels();
  for (let x = 0; x < saveImg.width; x++) {
    for (let y = 0; y < saveImg.height; y++) {
      saveImg.pixels[(y * saveImg.width + x) * 4] = map.tiles[x][y].tileID;
      saveImg.pixels[(y * saveImg.width + x) * 4 + 1] = map.tiles[x][y].entityID;
      saveImg.pixels[(y * saveImg.width + x) * 4 + 2] = map.tiles[x][y].subTexID;
      saveImg.pixels[(y * saveImg.width + x) * 4 + 3] = map.tiles[x][y].enemyID + 1;
    }
  }
  saveImg.updatePixels();
  //save(saveImg, saveName0);

  let saveObj = {
    player: player,
    enemies: enemies,
    entityCount: entityCount,
    map: saveImg,
  };
  saveObj = JSON.decycle(saveObj);
  let txt = JSON.stringify(saveObj);
  save(btoa(txt), saveName1);
}


class OptionMenu extends MenuTemplate {
  constructor(name, x, y, w, h) {
    super(name, x, y, w, h);

  }
}