let mainWindow;
let drawing = true;

function enableDraw() {
  drawing = true;
  drawStuff();
}

function disableDraw() {
  drawing = false;
}

function setup() {
  textSize(defaultFontSize);
  createCanvas(windowWidth, windowHeight);
  mainWindow = new MainWindow();
  let ratio = Math.min(windowHeight / windowWidth, windowWidth / windowHeight);
  defaultFontSize = realDefaultFontSize * ratio;
  mainWindow.resize();
  requestAnimationFrame(drawStuff);
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
