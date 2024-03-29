let lastUpdate = Date.now();

let updatesPerSecond = 20,
  refreshTime = 1000 / updatesPerSecond;

let looping = true;
let mainLoop = setTimeout(gameLoop, refreshTime);

let currentZone = 0;

let player = new Player();

function enableGameLoop() {
  looping = true;
  gameLoop();
}

function disableGameLoop() {
  looping = false;
}

function initEnemyMove() {
  enemyTurn = true;
  player.attr[AttrIDs.MoveCount].current = 0;
  player.applyPoison();
  enemyMove();
}

function endRound() {
  if (enemyTurn) return;
  initEnemyMove();
  mainWindow.displayOnce();
}

let enemiesMoved = 0;
let enemyTurn = false;

function enemyMove() {
  enemiesMoved = 0;
  for (let e of enemies) {
    e.initMove().then(() => {
      enemiesMoved++;
      if (enemiesMoved === enemies.length) {
        // Here we're done
        //mainWindow.subMenus[0].ch[0].ch[0].forceUpdate();
        player.resetMoveCount();
        mainWindow.displayOnce();
        enemyTurn = false;
      }
    });
  }
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

function getEstimatedRoundsTillDeath(from, to) {
  if (to.attr[AttrIDs.Damage].total === 0) return 1000;
  return (from.attr[AttrIDs.Hitpoint].getCurrent() / to.attr[AttrIDs.Damage].getTotal());
}

function getFleeChance(from, to) {
  /*
  Fancy way of calculating flee chance based on from.hp and to.dmg
  Calculates the ratio of from.hp to to.dmg
  Low ratio (like 2, 3, 4) means you're going to die very fast
  ->Intimidating enemy, low chance to flee
  High ratio (like 14, 15, 16) means you're not going to die soon
  ->Easy enemy, high chance to flee
  This ratio is constrained between 2 values minHeur, maxHeur
  minFleeChance, maxFleeChance are the chances to flee at minHeur, maxHeur
  everything in between is mapped with the cosine of said ratio
  scaled to nicely fit one half of a period in the interval minHeur, maxHeur
  */
  let minFleeChance = 0.15,
    maxFleeChance = 0.85,
    minHeur = 3,
    maxHeur = 20;
  let mul = -(maxFleeChance - minFleeChance) / 2;
  let off = (maxFleeChance + minFleeChance) / 2;
  let str = (PI / (maxHeur - minHeur));
  let eta = getEstimatedRoundsTillDeath(from, to);
  let x = constrain(eta, minHeur, maxHeur);
  let res = mul * cos(str * (x - minHeur)) + off;
  return res;
}

function update(dt) {
  //console.log("running");
}

function previousZone() {
  currentZone = Math.max(0, --currentZone);
  spawnEnemy();
}

function nextZone() {
  currentZone = Math.min(++currentZone, maxZone);
  spawnEnemy();
}
let minLevel = currentZone * 10,
  maxLevel = minLevel + 9;

function simulateFight(from, to) {
  let fromHP = from.attr[AttrIDs.Hitpoint].getTotal();
  let fromDmg = from.attr[AttrIDs.Damage].getTotal();
  let toHP = to.attr[AttrIDs.Hitpoint].getTotal();
  let toDmg = to.attr[AttrIDs.Damage].getTotal();
  let tillFromDies = fromHP / toDmg;
  let tillToDies = toHP / fromDmg;
  
  let r = tillFromDies / tillToDies;

  return r;
}
