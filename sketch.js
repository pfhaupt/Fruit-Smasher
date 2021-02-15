var mainWindow;
var drawing = true;

function enableDraw() {
  drawing = true;
  drawStuff();
}

function disableDraw() {
  drawing = false;
}

var img;

function preload() {
  let name = "images/boss.png";
  console.log(name);
  img = loadImage(name);
  //let img = loadImage("http://localhost:8000/images/boss.png")
  //var test = new Image("boss.png", 0, 0, 0, 0);
}

function setup() {
  textSize(defaultFontSize);
  createCanvas(windowWidth, windowHeight);
  mainWindow = new MainWindow();
  requestAnimationFrame(drawStuff);
}

function drawStuff() {
  if (drawing) requestAnimationFrame(drawStuff);
  resizeEverything();
  background(255);
  mainWindow.display();
}

function resizeEverything() {
  resizeCanvas(windowWidth, windowHeight);
  mainWindow.resize();
}
