let mainWindow;
let drawing = true;

let currentlySelectedSlotID = -1;
let currentlySelectedItemID = -1;

function enableDraw() {
  drawing = true;
  drawStuff();
}

function disableDraw() {
  drawing = false;
}

function preload() {
  loadImages();
}

function setup() {
  noiseSeed(70273982107398);
  noiseDetail(4, 0.4);
  textSize(defaultFontSize);
  createCanvas(windowWidth, windowHeight);
  generateItems();
  mainWindow = new MainWindow();
  let ratio = Math.min(windowHeight / windowWidth, windowWidth / windowHeight);
  defaultFontSize = realDefaultFontSize * ratio;
  mainWindow.resize();
  requestAnimationFrame(drawStuff);

  loadMap(4);

  //loadImages();
  //map = loadMap(currentZone);
  //generateMinimap();

  mainWindow.displayOnce();
  noLoop();
}

function drawStuff() {
  if (drawing) requestAnimationFrame(drawStuff);
  mainWindow.displayEveryFrame();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  let ratio = Math.min(windowHeight / windowWidth, windowWidth / windowHeight);
  defaultFontSize = realDefaultFontSize * ratio;
  mainWindow.resize();
  mainWindow.displayOnce();
}


function mouseReleased() {
  if (mainWindow.currentSubMenu.name === "Inventory") {
    let inv = mainWindow.currentSubMenu;
    let part = 1;
    let end = itemCount;
    if (mouseX < inv.children[1].xAbsToScreen) {
      part = 0;
      end = equipSlotCount;
    }
    for (let i = 0; i < end; i++) {
      let itemSlot = inv.children[part].children[i];
      if (mouseX > itemSlot.xAbsToScreen && mouseX < itemSlot.xAbsToScreen + itemSlot.wAbsToScreen &&
        mouseY > itemSlot.yAbsToScreen && mouseY < itemSlot.yAbsToScreen + itemSlot.hAbsToScreen) {
        let slotID = part * equipSlotCount + i;
        swapItems(currentlySelectedSlotID, slotID);
        currentlySelectedSlotID = -1;
        currentlySelectedItemID = -1;
        return;
      }
    }
    inv.displayOnce();
  }
  currentlySelectedSlotID = -1;
  currentlySelectedItemID = -1;
}

function keyPressed() {
  if (mainWindow.currentSubMenu.name === "Field") {
    let map = mainWindow.currentSubMenu.children[0].children[0];
    let prevX = player.position.x;
    let prevY = player.position.y;
    let dir = {
      x: 0,
      y: 0
    };
    switch (keyCode) {
      case 37: //LEFT ARROW
        dir.x--;
        break;
      case 38: //UP ARROW
        dir.y--;
        break;
      case 39: //RIGHT ARROW
        dir.x++;
        break;
      case 40: //DOWN ARROW
        dir.y++;
        break;
    }
    //Set Player on Map
    let newX = prevX + dir.x;
    let newY = prevY + dir.y;

    map.tiles[prevX][prevY].setEntity(0);
    map.tiles[newX][newY].setEntity(7);

    //Set Player on Minimap
    mainWindow.currentSubMenu.children[0].children[1].updatePixels(prevX, prevY);
    mainWindow.currentSubMenu.children[0].children[1].updatePixels(newX, newY);
    //Set Player in Cache
    let middleX = floor(player.attributes.sight.total / 2);
    let middleY = floor(player.attributes.sight.total / 2);
    let offs = 1 / player.attributes.sight.total;
    map.cachedTiles[middleX][middleY].entity.content.elt.remove();
    if (map.cachedTiles[middleX + dir.x][middleY + dir.y].entity) map.cachedTiles[middleX + dir.x][middleY + dir.y].entity.content.elt.remove();
    map.cachedTiles[middleX][middleY].entity = null;
    map.cachedTiles[middleX + dir.x][middleY + dir.y].entity = new CustomImage(entityList[7], 0, 0, offs, offs);
    //Update Cache
    map.updateImages(dir.x, dir.y);
    //Update real Player pos
    player.position.x = prevX + dir.x;
    player.position.y = prevY + dir.y;
    mainWindow.currentSubMenu.displayOnce();
  }
}
