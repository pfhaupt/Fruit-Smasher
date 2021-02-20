var lastUpdate = Date.now();

var updatesPerSecond = 20,
  refreshTime = 1000 / updatesPerSecond;

var looping = true;
var mainLoop = setTimeout(gameLoop, refreshTime);

var currentZone = 0;
var maxZone = 7;

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

  update(dt / 1000);

  if (looping) {
    refreshTime = 1000 / updatesPerSecond;
    setTimeout(gameLoop, refreshTime);
  }
}

var player = new Player();
var enemy = new Enemy();

function update(dt) {
  player.update(enemy, dt);
  enemy.update(player, dt);
  if (enemy.checkDeath()) {
    player.addExperience(enemy.level);
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

function spawnEnemy() {
  let minLevel = currentZone * 10;
  let maxLevel = minLevel + 9;
  let enemyLevel = Math.floor(random(minLevel, Math.max(minLevel, Math.min(player.level, maxLevel))+1));
  let hp = 20 + 5 * enemyLevel;
  let dmg = 1 + 1 * enemyLevel;
  let regen = 0.1 * enemyLevel;
  let atkSpeed = 1 + Math.floor(enemyLevel / 10);
  enemy = new Enemy(enemyLevel, hp, dmg, regen, atkSpeed);
}
