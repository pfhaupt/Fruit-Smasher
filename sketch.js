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
  textSize(defaultFontSize);
  createCanvas(windowWidth, windowHeight);
  generateItems();
  mainWindow = new MainWindow();
  let ratio = Math.min(windowHeight / windowWidth, windowWidth / windowHeight);
  defaultFontSize = realDefaultFontSize * ratio;
  mainWindow.resize();
  requestAnimationFrame(drawStuff);

  loadMap(1);

  //loadImages();
  //map = loadMap(currentZone);
  //generateMinimap();
}

function drawStuff() {
  if (drawing) requestAnimationFrame(drawStuff);
  background(255);
  mainWindow.display();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  let ratio = Math.min(windowHeight / windowWidth, windowWidth / windowHeight);
  defaultFontSize = realDefaultFontSize * ratio;
  mainWindow.resize();
}


function mouseReleased() {
  if (mainWindow.currentSubMenu.name === "Inventory") {
    let inv = mainWindow.currentSubMenu;
    let part = 0;
    let end = itemCount;
    if (mouseX < inv.children[0].xAbsToScreen) {
      part = 1;
      end = 17;
    }
    for (let i = 0; i < end; i++) {
      let itemSlot = inv.children[part].children[i];
      if (mouseX > itemSlot.xAbsToScreen && mouseX < itemSlot.xAbsToScreen + itemSlot.wAbsToScreen &&
        mouseY > itemSlot.yAbsToScreen && mouseY < itemSlot.yAbsToScreen + itemSlot.hAbsToScreen) {
        let slotID = part * itemCount + i;
        swapItems(currentlySelectedSlotID, slotID);
        currentlySelectedSlotID = -1;
        currentlySelectedItemID = -1;
        return;
      }
    }
  }
  currentlySelectedSlotID = -1;
  currentlySelectedItemID = -1;
}

function keyPressed() {
  if (mainWindow.currentSubMenu.name === "Field") {
    let map = mainWindow.currentSubMenu.children[0];
    switch (keyCode) {
      case 37: //LEFT ARROW
        player.position.x--;
        map.updateImages(1, 0);
        break;
      case 38: //UP ARROW
        player.position.y--;
        map.updateImages(0, 1);
        break;
      case 39: //RIGHT ARROW
        player.position.x++;
        map.updateImages(-1, 0);
        break;
      case 40: //DOWN ARROW
        player.position.y++;
        map.updateImages(0, -1);
        break;
    }
  }
}
