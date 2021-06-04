/*
Collection of functions that aren't used/needed anymore
But could someday be useful again
*/

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