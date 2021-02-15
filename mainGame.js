var lastUpdate = Date.now();

var updatesPerSecond = 20,
  refreshTime = 1000 / updatesPerSecond;

var looping = true;
var mainLoop = setTimeout(gameLoop, refreshTime);

var enemyLevel = 0;

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
    player.addExperience(enemyLevel);
    spawnEnemy(enemyLevel);
  }
  if (player.checkDeath()) {
    player.respawn();
    spawnEnemy(enemyLevel);
  }
}

function previousEnemy() {
  enemyLevel = Math.max(0, --enemyLevel);
  spawnEnemy(enemyLevel);
}

function nextEnemy() {
  enemyLevel = Math.min(++enemyLevel, 100);
  spawnEnemy(enemyLevel);
}

function spawnEnemy(lvl) {
  let hp = 20 + 5 * lvl;
  let dmg = 1 + 1 * lvl;
  let regen = 0.1 * lvl;
  let atkSpeed = 1 + Math.floor(lvl / 10);
  enemy = new Enemy(lvl, hp, dmg, regen, atkSpeed);
}
