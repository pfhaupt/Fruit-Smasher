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
  let saveFile = {
    nodes: []
  };

  saveFile.nodes.push([]); //Push Map
  saveFile.nodes.push([]); //Push Enemies
  saveFile.nodes.push([]); //Push Player

  let tMap = saveFile.nodes[nName.Map];
  let tEnemies = saveFile.nodes[nName.Enemies];
  let tPlayer = saveFile.nodes[nName.Player];

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

  for (let i = 0; i < enemies.length; i++) {
    let e = enemies[i];
    let enemyContent = [];
    enemyContent.push(e.level);
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

  saveFile.nodes[nName.Player] = [...playerContent];

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
  getMaxDepth(saveFile.nodes, 0);
  console.log(recordDepth);

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
  let count = 0;
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
      if (depth === 4) console.log(header);
      return header;
    } else {
      //"value" is some number
      // * 10_000 because we have small float numbers
      let val = 10;
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
      count++;
      return data;
    }
  }

  let a = TreeToNumberArray(saveFile.nodes, recordDepth);
  for (let i = 0; i< a.length; i++) 
    if(a[i] === 4) console.log(i);
  console.log(a);

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
  console.log(imageDim);
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
  let saveArr = img.pixels.filter(function(_, i) {
    return (i + 1) % 4;
  });
  console.log(saveArr);

  let getPixelValues = (index, slots) => {
    let total = 0;
    let pow256 = Math.pow(256, slots - 1);
    for (let i = slots - 1; i > 0; i--) {
      let p = getPixelValue(index);
      total += pow256 * p;
      pow256 /= 256;
      index++;
    }
    total += getPixelValue(index);
    return total;
  }

  //Helper function, gets single pixel channel value
  let getPixelValue = (index) => {
    return saveArr[index];
  }

  let getValue = (index) => {
    let val = getPixelValues(index + 1, saveArr[index]);
    return val;
  }

  let getSingleValueAtPointer = () => {
    return getPixelValue(currentPointer);
  }

  let increasePointer = (howMuch) => {
    currentPointer += howMuch;
  }

  let getHeaderLength = () => {
    let prevPointer = currentPointer;
    increasePointer(1);
    let len1 = getSingleValueAtPointer();
    let amt = getValue(currentPointer);
    increasePointer(len1 + 1);
    for (let i = 0; i < amt; i++) {
      let l = getSingleValueAtPointer();
      increasePointer(l + 1);
    }
    let len = currentPointer - prevPointer;
    currentPointer = prevPointer;
    return len;
  }

  let saveTree = [];
  let currDepth = 0;
  let State = {
    STOPPED: -1,
    DEFAULT: 0,
    READING: 1,
    FILLARRAY: 2,
    INCREASEDEPTH: 3,
    DECREASEDEPTH: 4
  };
  let currentState = State.INIT;
  let currentValue = 0;
  let tmpArrays = [];
  let currentPointer = 0;
  let currentDepth = 0;
  let stopped = false;
  while (!stopped) {
    switch (currentState) {
      case State.INCREASEDEPTH:
        currentDepth++;
        currentState = State.DEFAULT;
        break;
      case State.DECREASEDEPTH:
        currentDepth--;
        currentState = State.DEFAULT;
        break;

      case State.INIT:
        let headerLen = getHeaderLength();
        increasePointer(1);
        let len = getSingleValueAtPointer();
        let arrLen = getValue(currentPointer);
        increasePointer(len + 1);

        let startPos = headerLen;

        for (let i = 0; i < arrLen; i++) {
          tmpArrays[i] = [];
          let arr = [];
          len = getSingleValueAtPointer();
          currentValue = getValue(currentPointer);
          increasePointer(len + 1);
          arr[0] = startPos;
          arr[1] = currentValue;
          startPos += currentValue;
          tmpArrays[i].push(arr);
        }
        console.log(arrLen, tmpArrays);

        currentState = State.STOPPED;
        break;
      case State.READING:
        currentValue = getValueAtPointer();
        break;
      case State.FILLARRAY:

        break;
      case State.STOPPED:
        stopped = true;
        break;
    }
  }
}

function saveMap() {
  //Following SavingAMap.png
  //Our own definition on how to save the map
  let map = mainWindow.subMenus[SubMenu.Field].ch[0].ch[0];

  let saveName = "map" + currentZone + "_played.png";
  let tmpDeity = new Deity();
  let slotsForGeneralEnemyStuff = 3;
  let slotsForEachAttribute = 2;
  let attributeLength = tmpDeity.attr.length;
  let statusLength = tmpDeity.statusEffects.length;
  let dimLength = 2;

  let slotsPerEnemy = 0;
  //One Slot Per Enemy Per Level
  slotsPerEnemy += slotsForGeneralEnemyStuff;
  //Saving every attribute base, perLevel
  //two slots so max is 65535 base, 65535 perLevel
  //or 255^3 base, 255 perLevel
  slotsPerEnemy += tmpDeity.attr.length * 2 * slotsForEachAttribute;
  //Saving every status effect
  slotsPerEnemy += Object.keys(tmpDeity.statusEffects).length * 2;
  //Save all enemies, plus the player
  let totalEntitiesToSave = enemies.length + 1;
  //How many slots do we actually need?
  let totalSlotsForEntities = totalEntitiesToSave * slotsPerEnemy;
  //1 pixel per tile, 4 slots per pixel
  let mapSizeTotal = map.width * map.height * 4;
  let versionSpace = 4; //Last 4 slots for version number

  let totalSlotSize = totalSlotsForEntities + mapSizeTotal + versionSpace;
  //3 because 2 slots for entity count, 1 for enemy length
  totalSlotSize += 3;
  //Then another 4 slots for map width and map height
  //-> Max Height for map is now 65535x65535
  totalSlotSize += 4;
  console.log(totalSlotSize);

  //We can't use the Alpha Channel
  totalSlotSize *= 4 / 3;

  //The area of our "rectangle" (our image) is just the sqrt of how many
  //slots we want to save divided by 4
  //Divide by 4 because p5js has 4 slots per pixel (RGBA)
  let minDim = sqrt(totalSlotSize / 4);

  //Giving us a bit of free Space to work with
  let actualDim = ceil(minDim);
  actualD += 1;

  console.log("Our image is " + actualDim + " pixels wide and high");
  //The actual save file
  let saveImg = createImage(actualDim, actualDim);

  let currentPixelPointer = 0;
  saveImg.loadPixels();

  //Helper function for setting multiple pixel channels at once
  //For that it divides the value in steps of 256, because channels are 8bit
  //Example:
  //(1000, 2):
  //slot1 = floor(1000 / 256) = 3
  //slot2 = 1000 % 256 = 232
  //(85000, 3):
  //slot1 = floor(85000 / 256^2) % 256 = 1
  //slot2 = floor(85000 / 256) % 256 = 76
  //slot3 = 85000 % 256 = 8
  //Function saves [1, 76, 8] at corresponding index
  let setPixels = (value, slots) => {
    let pow256 = Math.pow(256, slots - 1);
    for (let i = slots - 1; i > 0; i--) {
      setPixel(floor(value / pow256) % 256);
      pow256 /= 256;
    }
    setPixel(value % 256);
  }

  //Helper function for setting a single pixel channel
  let setPixel = (value) => {
    if ((currentPixelPointer + 1) % 4 === 0) {
      saveImg.pixels[currentPixelPointer] = 255;
      currentPixelPointer++;
    }
    saveImg.pixels[currentPixelPointer] = value;
    currentPixelPointer++;
  }

  let getSlotLength = (value) => {
    return ceil(log(value) / log(256));
  }

  //Set version
  setPixel(version.a);
  setPixel(version.b);
  setPixel(version.c);
  setPixel(version.d);

  //Save Map dimensions
  setPixel(dimLength);
  setPixels(map.width, dimLength);
  setPixels(map.height, dimLength);
  //setPixel(floor(map.width / 256));
  //setPixel(map.width % 256);
  //setPixel(floor(map.height / 256));
  //setPixel(map.height % 256);
  for (let x = 0; x < map.width; x++) {
    for (let y = 0; y < map.height; y++) {
      let t = map.getIDs(x, y);
      setPixel(t.tID);
      setPixel(t.eID);
      setPixel(t.sID);
      //Default is -1 (no enemy), but PNG can't handle that
      setPixel(t.enID + 1);
    }
  }
  console.log("Setting length and slots at ", currentPixelPointer);
  //How many slots do I need for my enemies?
  let enemyLength = getSlotLength(enemies.length);
  setPixel(enemyLength);
  setPixels(enemies.length, enemyLength);
  //Max Level 256^maxLevelSlotCount-1
  let maxLevelSlotCount = 2;
  setPixel(maxLevelSlotCount);
  setPixel(slotsPerEnemy);
  setPixel(slotsForGeneralEnemyStuff);
  setPixel(slotsForEachAttribute);
  setPixel(attributeLength);
  setPixel(statusLength);

  //Save all enemies
  console.log("Enemies start at ", currentPixelPointer);
  for (let i = 0; i < enemies.length; i++) {
    setPixels(enemies[i].level, maxLevelSlotCount);
    setPixel(enemyNames.indexOf(enemies[i].name));
    for (let j = 0; j < enemies[i].attr.length; j++) {
      let a = enemies[i].attr[j];
      let curr = a.getCurrent();
      let total = a.getTotal();
      //Each attribute gets [slotsForEachAttribute] channels for their
      //current and total value
      //So max is 256^slotsForEachAttribute-1 HP, for example
      setPixels(curr, slotsForEachAttribute);
      setPixels(total, slotsForEachAttribute);
    }
    for (let j = 0; j < enemies[i].statusEffects.length; j++) {
      //Save each status effect
      //Has Effect = 1, Has Not Effect = 0
      //Max Stacks of eny Effect = 255
      //To be fair I don't expect anyone to have more than 255 burn or poison stacks
      //If this ever gets possible, change accordingly
      let s = enemies[i].statusEffects[j];
      setPixel(int(s.curr));
      setPixel(s.stacks);
    }
  }

  //Save Player similar to enemies
  //Store Attributes and Status Effects
  console.log("Player starts at ", currentPixelPointer);
  setPixels(player.level, maxLevelSlotCount);
  for (let i = 0; i < player.attr.length; i++) {
    let a = player.attr[i];
    let curr = a.getCurrent();
    let total = a.getTotal();
    setPixels(curr, slotsForEachAttribute);
    setPixels(total, slotsForEachAttribute);
  }

  for (let j = 0; j < player.statusEffects.length; j++) {
    //Save each status effect
    let s = player.statusEffects[j];
    setPixel(int(s.curr));
    setPixel(s.stacks);
  }

  saveImg.updatePixels();
  saveImg.loadPixels();

  //Safety Check Number 1
  //Divide all stuff before this line into [blockAmount] segments
  //Take sum of each segment
  //Store that sum
  //When loading, calculate sum again, compare to stored sum
  //If just one block fails, something went wrong
  //Possible "Somethings":
  //-Block Calculation upon Saving
  //-Corrupted Block Storing in Save
  //-Block Calculation upon Loading
  //-Corrupted Block Accessing in Loading
  console.log("Blocking starts at ", currentPixelPointer);
  let blockAmount = 10;
  let totalBlockSize = floor(currentPixelPointer / blockAmount) * blockAmount;
  let blockSize = totalBlockSize / blockAmount;
  //Set important stuff so we can later get it back in loading
  setPixel(blockAmount);
  setPixel(getSlotLength(blockSize));
  setPixels(blockSize, getSlotLength(blockSize));

  //Create Sum of Blocks
  let blockSum = new Array(blockAmount);
  blockSum.fill(0);
  let currentBlockPointer = 0;
  for (let i = 0; i < blockAmount; i++) {
    for (let j = 0; j < blockSize; j++) {
      blockSum[i] += saveImg.pixels[currentBlockPointer];
      currentBlockPointer++;
    }

    //Set Each Sum of Blocks in Save Image
    let blockSlotLength = getSlotLength(blockSum[i]);
    setPixel(blockSlotLength);
    setPixels(blockSum[i], blockSlotLength);
  }

  console.log("Saving Pixel Pointer at ", currentPixelPointer);
  //Safety Check Number 3
  //Last entry saves currentPixelPointer
  //So that the save can see if everything went correct
  let pointerLength = getSlotLength(currentPixelPointer);
  setPixel(pointerLength);
  setPixels(currentPixelPointer, pointerLength);

  //Make sure to fill the last pixel transparency for whatever we're setting
  while ((currentPixelPointer + 1) % 4 !== 0) setPixel(0);
  setPixel(0);

  saveImg.updatePixels();
  console.log(saveImg.pixels);

  save(saveImg, saveName);
  /*
   let map = mainWindow.subMenus[SubMenu.Field].ch[0].ch[0];
   let saveName1 = "map" + currentZone + "_played.json";
   let saveImg1 = createImage(map.width, map.height);
   saveImg1.loadPixels();
   for (let x = 0; x < saveImg1.width; x++) {
     for (let y = 0; y < saveImg1.height; y++) {
       saveImg1.pixels[(y * saveImg1.width + x) * 4] = map.tiles[x][y].tileID;
       saveImg1.pixels[(y * saveImg1.width + x) * 4 + 1] = map.tiles[x][y].entityID;
       saveImg1.pixels[(y * saveImg1.width + x) * 4 + 2] = map.tiles[x][y].subTexID;
       saveImg1.pixels[(y * saveImg1.width + x) * 4 + 3] = map.tiles[x][y].enemyID + 1;
     }
   }
   saveImg1.updatePixels();
   //save(saveImg, saveName0);

   let saveObj = {
     player: player,
     enemies: enemies,
     entityCount: entityCount,
     map: saveImg1,
   };
   saveObj = JSON.decycle(saveObj);
   //let txt = JSON.stringify(saveObj);
   save(atob(txt), saveName1);
   */

}

class OptionMenu extends MenuTemplate {
  constructor(name, x, y, w, h) {
    super(name, x, y, w, h);
  }
}