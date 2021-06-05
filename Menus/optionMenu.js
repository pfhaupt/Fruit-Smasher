//https://trello.com/b/Pp4OXQRR/todo-liste
let version = {
  a: 0,
  b: 0,
  c: 0,
  d: 1
}

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

function loadActualSaveFile(img) {
  //Init Pointer so we always know where we are in the SaveArray
  let currentPixelPointer = 0;

  //We need to get pixel values, so load them
  img.loadPixels();

  //Just to be safe we create a copy of the array and work with that
  let saveArr = [...img.pixels];

  //Helper function, gets collection of [slots] pixel channels, and sums them up
  //Example:
  //2 slots: Total value = slot1 * 256 + slot2
  //3 slots: Total value = slot1 * 256 * 256 + slot2 * 256 + slot3
  let getPixelValues = (slots) => {
    let total = 0;
    let pow256 = Math.pow(256, slots - 1);
    for (let i = slots - 1; i > 0; i--) {
      let p = getPixelValue();
      total += pow256 * p;
      pow256 /= 256;
    }
    total += getPixelValue();
    return total;
  }

  //Helper function, gets single pixel channel value
  let getPixelValue = () => {
    let curr = currentPixelPointer;
    if ((curr + 1) % 4 === 0) {
      currentPixelPointer++;
      return getPixelValue();
    }
    currentPixelPointer++;
    return saveArr[curr];
  }

  //Get version number!
  let v = new Array(4);
  for (let i = 0; i < v.length; i++) {
    v[i] = getPixelValue();
  }

  //Get map width and height
  let len = getPixelValue();
  let w = getPixelValues(len);
  let h = getPixelValues(len);
  console.log("Loading Map starts at ", currentPixelPointer);
  //Temp Array for Map Data
  let mapArr = new Array(w * h * 4);
  for (let i = 0; i < mapArr.length; i++) {
    mapArr[i] = getPixelValue();
  }
  //console.log(mapArr);

  //Save Enemy Positions on the way
  let enemyLength = getPixelValue();
  let enemiesLength = getPixelValues(enemyLength);
  let enemyPositions = new Array(enemiesLength);

  //Fill actual map
  let m = new WorldMap(w, 0, map.xRelToParent, map.yRelToParent, map.wRelToParent, map.hRelToParent);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let id = (x * h + y) * 4;
      let enID = mapArr[id + 3] - 1; //-1 because Default is -1, so we add one when saving because PNG can't handle negs
      let eID = mapArr[id + 1];
      if (enID !== -1) { //Enemy found!
        //We don't need to store the enemy position in the save
        //because we can easily restore it here
        enemyPositions[enID] = {
          x,
          y,
          eID
        };
      }
      //Overwrite default tiles with actual data
      m.tiles[x][y].setAll(
        mapArr[id], //Set Tex
        mapArr[id + 1], //Set Entity
        mapArr[id + 2], //Set SubTex
        enID); //Set Enemy
    }
  }
  //console.log(m.tiles);

  console.log("Loading Enemies starts at ", currentPixelPointer);
  //If everything went good, we're here.
  let maxLevelSlotCount = getPixelValue();
  let slotsPerEnemy = getPixelValue();
  let slotsForGeneralEnemyStuff = getPixelValue();
  let slotsForEachAttribute = getPixelValue();
  let attributeLength = getPixelValue();
  let statusLength = getPixelValue();

  //Helper Arrays for creating and naming enemies
  let tmpDeity = new Deity();
  let EnemyClassNames = Object.keys(EntityIDs);
  let EnemyStatusEffects = Object.keys(tmpDeity.statusEffects);

  //Our new Enemy Array
  let tmpEnemies = new Array(enemies.length);

  for (let i = 0; i < tmpEnemies.length; i++) {
    let stuff = enemyPositions[i];
    //Wonky way of dynamically creating enemy class
    tmpEnemies[i] = eval("new " + EnemyClassNames[stuff.eID] + "(stuff.x, stuff.y)");
    let lvl = getPixelValues(maxLevelSlotCount);
    tmpEnemies[i].level = lvl;
    let name = enemyNames[getPixelValue()];
    tmpEnemies[i].name = name;
    //Grab the next few pixel values and fill the attributes
    for (let j = 0; j < attributeLength; j++) {
      let curr = getPixelValues(slotsForEachAttribute);
      let total = getPixelValues(slotsForEachAttribute);
      tmpEnemies[i].attr[j].current = curr;
      tmpEnemies[i].attr[j].total = total;

      //If stuff bugs out, this line is probably wrong
      tmpEnemies[i].attr[j].perLevel = (total - curr) / lvl;
    }
    //Grab the next few pixel values and fill the status effects
    for (let j = 0; j < statusLength; j++) {
      let curr = getPixelValue();
      let stacks = getPixelValue();
      tmpEnemies[i].statusEffects[EnemyStatusEffects[j]].curr = curr === 1;
      tmpEnemies[i].statusEffects[EnemyStatusEffects[j]].stacks = stacks;
    }
  }

  console.log("Loading Player starts at ", currentPixelPointer);
  //Our new Player
  let tmpPlayer = new Player();

  //Get the player data
  let playerLevel = getPixelValues(maxLevelSlotCount);
  tmpPlayer.level = playerLevel;
  for (let i = 0; i < attributeLength; i++) {
    let curr = getPixelValues(slotsForEachAttribute);
    let total = getPixelValues(slotsForEachAttribute);
    tmpPlayer.attr[i].current = curr;
    tmpPlayer.attr[i].total = total;

    tmpPlayer.attr[i].perLevel = (total - curr) / playerLevel;
  }

  console.log("Calculating Block Safety starts at ", currentPixelPointer);
  let blockAmount = getPixelValue();
  let blockSizeLength = getPixelValue();
  let blockSize = getPixelValues(blockSizeLength);

  let blockSumCalculated = new Array(blockAmount);
  blockSumCalculated.fill(0);
  let blockSumStored = new Array(blockAmount);
  blockSumStored.fill(0);
  let currentBlockPointer = 0;

  for (let i = 0; i < blockAmount; i++) {
    for (let j = 0; j < blockSize; j++) {
      blockSumCalculated[i] += saveArr[currentBlockPointer];
      currentBlockPointer++;
    }

    let blockSlotLength = getPixelValue();
    let blocksum = getPixelValues(blockSlotLength);
    blockSumStored[i] = blocksum;
  }
  let blockCheckPassed = true;
  for (let i = 0; i < blockAmount; i++) {
    if (blockSumStored[i] !== blockSumCalculated[i]) {
      console.log("Block " + i + " doesn't seem to match.");
      blockCheckPassed = false;
    }
    console.log(blockSumStored[i] === blockSumCalculated[i]);
  }

  let pointerLength = getPixelValue();
  let currentPixelPointerTmp = currentPixelPointer;
  let savedCurrentPixelPointer = getPixelValues(pointerLength);
  //Safety check
  //If this fails either save corrupted or loading failed
  if (!blockCheckPassed)
    console.log("EHEHHHHHH");
  if (savedCurrentPixelPointer !== currentPixelPointerTmp)
    console.log("AHHHHHHHHHHHHH");
  else
    console.log("Pointers match up in the end. Looks like a valid save file.");

  console.log("The map dimensions are " + w + "x" + h);
  console.log("version: " + v);
}

function loadSaveFile(file) {
  mainWindow.showMenu(SubMenu.Field);
  let map = mainWindow.subMenus[SubMenu.Field].ch[0].ch[0];
  if (file.type === "image") {
    //Thanks for that forum post
    //https://forum.processing.org/two/discussion/15752/accessing-pixel-data-from-an-image-loaded-in-the-browser
    loadImage(file.data, loadDataArray);
    //loadImage(file.data, loadActualSaveFile);
    return;
  }

  /*
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
    */
}

function createDataArray() {
  let map = mainWindow.subMenus[SubMenu.Field].ch[0].ch[0];
  let nName = {
    Map: 0,
    Enemies: 1,
    Player: 2
  };
  let saveFile = [];

  saveFile.push([]); //Push Map
  saveFile.push([]); //Push Enemies
  saveFile.push([]); //Push Player

  let tMap = saveFile[nName.Map];
  let tEnemies = saveFile[nName.Enemies];
  let tPlayer = saveFile[nName.Player];

  tMap.push([]); //Push Info to Map
  tMap.push([]); //Push Tiles to Map

  let tInfo = tMap[0];
  tInfo.push(currentZone);
  tInfo.push(map.width);
  tInfo.push(map.height);

  let tileLength = [];

  let lenBitMaskTex = ceil(log(Object.keys(TextureIDs).length) / log(2));
  let lenBitMaskEnt = ceil(log(Object.keys(EntityIDs).length) / log(2));
  let lenBitMaskSubTex = ceil(log(Object.keys(SubTextureIDs).length) / log(2));
  let lenBitMaskEnemy = ceil(log(enemies.length) / log(2));

  tileLength.push(lenBitMaskTex);
  tileLength.push(lenBitMaskEnt);
  tileLength.push(lenBitMaskSubTex);
  tileLength.push(lenBitMaskEnemy);

  tInfo.push(tileLength);

  let tVersion = [];
  tVersion.push(version.a);
  tVersion.push(version.b);
  tVersion.push(version.c);
  tVersion.push(version.d);
  tInfo.push(tVersion);

  console.log(lenBitMaskTex, lenBitMaskEnt, lenBitMaskSubTex, lenBitMaskEnemy);

  let tTiles = tMap[1];
  for (let x = 0; x < map.width; x++) {
    for (let y = 0; y < map.height; y++) {
      let t = map.getIDs(x, y);
      if (t.tID === -1) {
        tTiles.push(0);
        continue;
      }
      let n = 0;
      n |= t.tID;
      n <<= lenBitMaskEnt;
      n |= t.eID;
      n <<= lenBitMaskSubTex;
      n |= t.sID;
      n <<= lenBitMaskEnemy;
      n |= (t.enID + 1);
      tTiles.push(n);
    }
  }

  let entityNames = Object.keys(EntityIDs);
  for (let i = 0; i < enemies.length; i++) {
    let e = enemies[i];
    let enemyContent = [];
    enemyContent.push(e.level);
    enemyContent.push(entityNames.indexOf(e.constructor.name));
    enemyContent.push(enemyNames.indexOf(e.name));

    let eAttributes = [];
    for (let i = 0; i < e.attr.length; i++) {
      let a = e.attr[i];
      let attrContent = [];
      attrContent.push(a.getBaseValue());
      attrContent.push(a.getCurrent());
      attrContent.push(a.getTotal());

      eAttributes.push(attrContent);
    }
    enemyContent.push(eAttributes);

    let eStatusEffects = [];
    for (let i = 0; i < e.statusEffects.length; i++) {
      let s = e.statusEffects[i];
      let statContent = [];
      statContent.push(s.getCurrentAsInt());
      statContent.push(s.getStackCount());
      statContent.push(s.getImmunityAsInt());

      eStatusEffects.push(statContent);
    }
    enemyContent.push(eStatusEffects);

    tEnemies.push(enemyContent);
  }

  let playerContent = [];
  playerContent.push(player.level);
  let pAttributes = [];
  for (let i = 0; i < player.attr.length; i++) {
    let a = player.attr[i];
    let attrContent = [];
    attrContent.push(a.getBaseValue());
    attrContent.push(a.getCurrent());
    attrContent.push(a.getTotal());

    pAttributes.push(attrContent);
  }
  playerContent.push(pAttributes);

  let pStatusEffects = [];
  for (let i = 0; i < player.statusEffects.length; i++) {
    let s = player.statusEffects[i];
    let statContent = [];
    statContent.push(s.getCurrentAsInt());
    statContent.push(s.getStackCount());
    statContent.push(s.getImmunityAsInt());

    pStatusEffects.push(statContent);
  }
  playerContent.push(pStatusEffects);

  saveFile[nName.Player] = [...playerContent];

  console.log(saveFile);

  let recordDepth = 0;
  let getMaxDepth = (arr, depth) => {
    if (arr instanceof Array) {
      for (let i = 0; i < arr.length; i++) {
        getMaxDepth(arr[i], depth + 1);
      }
    }
    recordDepth = max(recordDepth, depth);
  }
  getMaxDepth(saveFile, 0);

  let getSlotLength = (value) => {
    if (value < 256) return 1;
    return ceil(log(value) / log(256));
  }

  let setArrayValue = (arr, value, setLen = true) => {
    let len = getSlotLength(value);
    if (setLen) arr.push(len);
    let pow256 = Math.pow(256, len - 1);
    for (let i = len - 1; i > 0; i--) {
      arr.push(floor(value / pow256) % 256);
      pow256 /= 256;
    }
    arr.push(value % 256);
  }

  let isInt = (n) => {
    return n % 1 === 0;
  }
  let branchCounter = 0;
  let TreeToNumberArray = (value, depth) => {
    if (value instanceof Array) {
      //"value" is array
      let header = [];
      header[0] = depth; //Identifier Depth
      let dataArr = new Array(value.length);
      dataArr.fill([]);
      for (let i = 0; i < value.length; i++) {
        dataArr[i] = TreeToNumberArray(value[i], depth - 1);
      }
      setArrayValue(header, dataArr.length);
      for (let i = 0; i < dataArr.length; i++) {
        setArrayValue(header, dataArr[i].length);
      }
      for (let i = 0; i < dataArr.length; i++) {
        for (let j = 0; j < dataArr[i].length; j++) {
          header.push(dataArr[i][j]);
        }
      }
      return header;
    } else {
      //"value" is some number
      // * 10_000 because we have small float numbers
      let val = value;
      let valIsInt = isInt(val);
      let data = [];
      data[0] = 80; //Identifier Data
      data[0] *= (2 - int(valIsInt));
      //if val is int identifier is 80
      //if val is float identifier is 160
      val *= 1 + int(!valIsInt) * 9999;
      let len = getSlotLength(val);
      data[0] += len;
      setArrayValue(data, val, false);
      //console.log(data);
      branchCounter++;
      return data;
    }
  }

  let a = TreeToNumberArray(saveFile, recordDepth);
  console.log("Reached " + branchCounter + " branch ends.");

  let currentPixelPointer = 0;
  let setPixel = (value) => {
    if ((currentPixelPointer + 1) % 4 === 0) {
      saveImg.pixels[currentPixelPointer] = 255;
      currentPixelPointer++;
    }
    saveImg.pixels[currentPixelPointer] = value;
    currentPixelPointer++;
  }

  let imageDim = ceil(sqrt(a.length / 3));
  let saveImg = createImage(imageDim, imageDim);
  saveImg.loadPixels();
  for (let i = 0; i < a.length; i++) {
    setPixel(a[i]);
  }
  saveImg.updatePixels();
  console.log(saveImg.pixels);
  save(saveImg, "test.png");
}

function loadDataArray(img) {
  img.loadPixels();
  //We don't need the alpha channel, filter it
  let saveArr = img.pixels.filter(function (_, i) {
    return (i + 1) % 4;
  });
  //Convert from UInt8Array to normal Array so normal Array functions can be used
  saveArr = [...saveArr];

  let getArrayValue = (arr, index) => {
    let len = arr[index];
    let val = 0;
    let pow256 = Math.pow(256, len - 1);
    index++;
    for (let i = 0; i < len; i++) {
      let v = arr[index];
      val += v * pow256;
      pow256 /= 256;
      index++;
    }
    return val;
  }

  let getSingleArrayValue = (arr, index) => {
    return arr[index];
  }

  let getHeaderLength = (arr) => {
    let len = 2 + getSingleArrayValue(arr, 1); //One for Identifier, One for Stored Length
    let amt = getArrayValue(arr, 1);
    let offset = len;
    for (let i = 0; i < amt; i++) {
      let l = getSingleArrayValue(arr, offset) + 1;
      len += l;
      offset += l;
    }
    return len;
  }

  let saveFile = [...saveArr]; //Init saveFile
  let branchCounter = 0; //Just for debugging purposes

  //Magic function that decodes our array
  let NumberArrayToTree = (arr) => {
    //overhead is unnecessary stuff that can be removed
    //like header or trailing zeros
    let overhead = arr.length;
    let h = getHeaderLength(arr);
    let amtLen = getSingleArrayValue(arr, 1);
    //How many sub arrays do we have?
    let amt = getArrayValue(arr, 1);
    //lens stores start pos and length
    let lens = [];
    let index = 1 + amtLen + 1; //index is now at first subArr length
    //for splicing
    let currPos = h;
    for (let i = 0; i < amt; i++) {
      let info = [];
      amtLen = getSingleArrayValue(arr, index);
      //val stores length of sub array
      let val = getArrayValue(arr, index);
      //where does sub array start in array?
      info.push(currPos);
      //how long is sub array?
      info.push(val);
      //store info in lens array
      lens.push(info);
      //offset position
      currPos += val;
      //subtract from possible overhead
      overhead -= val;
      index += amtLen + 1;
    }

    //Divide our array into sub arrays
    let tmpArr = [];
    for (let i = amt - 1; i >= 0; i--) {
      let subArr = arr.splice(lens[i][0], lens[i][1]);
      tmpArr.push(subArr);
    }

    //because of splice we need to loop backwards through array
    //so now the order of sub arrays in tree is flipped,
    //that's why we need to undo the flip
    for (let i = amt - 1; i >= 0; i--) {
      arr.push(tmpArr[i]);
    }

    //remove overhead from array so only sub arrays are left over,
    //shift() removes first element, that's okay because we
    //used push() for sub-arrays, meaning sub-arrays always come last
    for (let i = 0; i < overhead; i++) {
      arr.shift();
    }

    //Recursively fill sub arrays until we hit data
    for (let i = 0; i < arr.length; i++) {
      let subArr = arr[i];
      //if we have not hit data yet, fill sub array
      if (!(subArr[0] === 0 || subArr[0] >= 80)) NumberArrayToTree(subArr);
      else {
        //we may have hit data here
        let isFloat = subArr[0] >= 160; //Identifier Float
        if (isFloat) {
          subArr[0] -= 160;
        } else {
          subArr[0] -= 80;
        }
        //If isFloat, divide stored data by 10k
        //else divide by 1, saving original data
        arr[i] = getArrayValue(subArr, 0) / (1 + int(isFloat) * 9999);
        branchCounter++;
      }
    }
  }

  NumberArrayToTree(saveFile); //Decode Array
  console.log("Reached " + branchCounter + " branch ends.");
  console.log(saveFile);
  
  //At this point saveFile contains the decoded Tree

  let tMap = saveFile[0];

  let tMapInfo = tMap[0];
  let tCurrentZone = tMapInfo[0];
  let tMapWidth = tMapInfo[1];
  let tMapHeight = tMapInfo[2];
  let tMaskLens = tMapInfo[3];

  let tMapTiles = tMap[1];
  let getTileInfo = (n) => {
    let vals = [];
    let v = n;
    let mask = 0;
    for (let i = tMaskLens.length - 1; i >= 0; i--) {
      mask = Math.pow(2, tMaskLens[i]) - 1;
      vals.unshift(v & mask);
      v >>= tMaskLens[i];
    }
    vals[3] -= 1; //we store enemyID + 1, now remove it
    return vals;
  }
  let tTiles = [];
  let tEnemyPositions = [];
  let tileIndex = 0;
  for (let i = 0; i < tMapWidth; i++) {
    tTiles.push([]);
    for (let j = 0; j < tMapHeight; j++) {
      let tileInfo = getTileInfo(tMapTiles[tileIndex]);
      if (tileInfo[3] !== -1) {
        //Enemy at that tile
        tEnemyPositions[tileInfo[3]] = {
          x: i,
          y: j
        };
      }
      tTiles[i].push(tileInfo);
      tileIndex++;
    }
  }
  console.log(tTiles);

  let tEnemies = saveFile[1];


  let tPlayer = saveFile[2];
}

class OptionMenu extends MenuTemplate {
  constructor(name, x, y, w, h) {
    super(name, x, y, w, h);
  }
}