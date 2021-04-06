let lastUpdate = Date.now();

let updatesPerSecond = 20,
  refreshTime = 1000 / updatesPerSecond;

let looping = true;
let mainLoop = setTimeout(gameLoop, refreshTime);;

let currentZone = 0;

function enableGameLoop() {
  looping = true;
  gameLoop();
}

function disableGameLoop() {
  looping = false;
}

function gameLoop() {
  var now = Date.now();
  var dt = now - lastUpdate;
  lastUpdate = now;

  //update(dt / 1000);

  if (looping) {
    refreshTime = 1000 / updatesPerSecond;
    setTimeout(gameLoop, refreshTime);
  }
}

var player = new Player();
var enemy = new Enemy();

function update(dt) {
  player.attack(enemy, dt);
  enemy.attack(player, dt);
  player.regenerate(dt);
  enemy.regenerate(dt);
  if (enemy.checkDeath()) {
    player.addExperience(enemy);
    player.checkChestDrop(enemy);
    spawnEnemy();
  }
  if (player.checkDeath()) {
    player.respawn();
    spawnEnemy();
  }
}

function previousZone() {
  currentZone = Math.max(0, --currentZone);
  spawnEnemy();
}

function nextZone() {
  currentZone = Math.min(++currentZone, maxZone);
  spawnEnemy();
}
let minLevel = currentZone * 10, maxLevel = minLevel + 9;
function spawnEnemy() {
  minLevel = currentZone * 10;
  maxLevel = minLevel + 9;
  let enemyLevel = Math.floor(random(minLevel, Math.max(minLevel, Math.min(player.level, maxLevel)) + 1));
  let hp = 20 + 5 * enemyLevel;
  let dmg = 1 + 1 * enemyLevel;
  let regen = 0.1 * enemyLevel;
  let atkSpeed = 1 + Math.floor(enemyLevel / 10);
  enemy = new Enemy(enemyLevel, hp, dmg, regen, atkSpeed);
}
