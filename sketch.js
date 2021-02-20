var mainWindow;
var drawing = true;

function enableDraw() {
  drawing = true;
  drawStuff();
}

function disableDraw() {
  drawing = false;
}

/* Testing Image Loading

var img;
function preload() {
  let name = "/Fruit-Smasher/images/boss.png";
  console.log(name);
  img = createImg(name, "Blergh");
  //let img = loadImage("http://localhost:8000/images/boss.png")
  //var test = new Image("boss.png", 0, 0, 0, 0);
}
*/

function setup() {
  textSize(defaultFontSize);
  createCanvas(windowWidth, windowHeight);
  mainWindow = new MainWindow();
  let ratio = Math.min(windowHeight / windowWidth, windowWidth / windowHeight);
  defaultFontSize = realDefaultFontSize * ratio;
  mainWindow.resize(true);
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
