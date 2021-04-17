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
  //defaultFontSize = realDefaultFontSize * ratio;
  mainWindow.resize();
  requestAnimationFrame(drawStuff);

  loadMap(0);

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
  //defaultFontSize = realDefaultFontSize * ratio;
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
    player.checkMovement(keyCode);
  }
}
