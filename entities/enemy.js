let enemies = [];

let enemyNames = [
  "The Goblin King",
  "Agamemnon",
  "The Truly Drunken Centaur",
  "Lonely Hector",
  "Otherworldly Idiot",
  "Spinning Butterfly",
  "Psychofrog",
  "Grilled Turkey",
  "Modern Venus Fly Trap",
  "Graduated Bug"
];

let entityCount = {
  enemy: {
    normal: {
      current: 0,
      total: 0
    },
    boss: {
      current: 0,
      total: 0
    },
    spawner: {
      current: 0,
      total: 0
    }
  },
  object: {
    key: {
      current: 0,
      total: 0
    }
  }
}

function getExpReward(level) {
  return (level + 1) ** 2;
}

class Enemy extends Deity {
  constructor(x, y) {
    super(100, 10, 3, 2);
    this.position = {
      x: x,
      y: y,
    };
    this.name = enemyNames[~~(Math.random() * enemyNames.length)];
    let r = 2 + Math.random() * 4;
    r = ~~r;
    this.init = {
      moveChances: 3
    };
    this.placeInMap = enemies.length;
    this.expReward = getExpReward(this.level);
  }

  resetMoveCount() {
    this.attributes.moveCount.current = this.attributes.moveCount.total;
    this.moveChances = this.init.moveChances;
  }

  initMove() {
    this.resetMoveCount();
    return new Promise((resolve, reject) => {
      let interval = setInterval(() => {
        this.attributes.moveCount.current--;
        this.moveChances = this.init.moveChances;
        this.move();
        if (this.attributes.moveCount.current <= 0) {
          // resolve promise
          clearInterval(interval);
          resolve();
        }
      }, 250);
    });
  }

  move() {
    let map = mainWindow.subMenus[0].children[0].children[0];
    let minimap = mainWindow.subMenus[0].children[0].children[1];

    let r = ~~random(4); //Fast flooring a random float
    let prevX = this.position.x;
    let prevY = this.position.y;
    let dirX = 0,
      dirY = 0;
    switch (r) {
      case 0:
        dirX = -1;
        break;
      case 1:
        dirX = 1;
        break;
      case 2:
        dirY = -1;
        break;
      case 3:
        dirY = 1;
        break;
    }

    let targetIDs = map.getIDs(prevX + dirX, prevY + dirY);
    if (targetIDs.eID !== EntityIDs.None || targetIDs.tID === 2) {
      //Entity already at target pos, or water at target pos
      this.moveChances--;
      if (this.moveChances >= 0) {
        this.move();
      }
      return;
    }

    this.position.x += dirX;
    this.position.y += dirY;
    map.updateTileMap(prevX, prevY, EntityIDs.None);
    map.updateTileMap(this.position.x, this.position.y, EntityIDs[this.constructor.name]);
    map.updateEnemyPos(prevX, prevY, -1);
    map.updateEnemyPos(this.position.x, this.position.y, this.placeInMap);
    map.updateCacheMap(prevX, prevY, EntityIDs.None);
    map.updateCacheMap(this.position.x, this.position.y, EntityIDs[this.constructor.name]);
    minimap.updatePixels(prevX, prevY);
    minimap.updatePixels(this.position.x, this.position.y);

    if (player.inViewRange(this)) {}
  }

  performRandomAction(other) {
    let r = Math.random() * 100;
    if (r < 70) this.attack(other);
    else if (r < 88) this.heal();
    else if (r < 95) this.wait();
    else this.flee(other);
  }

  flee(other) {
    console.log("FLEE");
    this.attributes.enerpoints.current = constrain(this.attributes.enerpoints.current - ActionCost.FleeAction, 0, this.attributes.enerpoints.total);
    this.lastAction = "Attempted to flee.";
    let fleeChance = getFleeChance(player, other);
    if (fleeChance < random()) mainWindow.subMenus[SubMenu.Field].children[1].setAction(ActionScreen.EnemyFled);
  }

  die() {
    //Do stuff on the tile map, enemy list, player stats....
    console.log("THIS ENEMY IS NOW OFFICIALLY DEAD");
    let map = mainWindow.subMenus[SubMenu.Field].children[0].children[0];
    let minimap = mainWindow.subMenus[SubMenu.Field].children[0].children[1];
    let action = mainWindow.subMenus[SubMenu.Field].children[1];
    let x = this.position.x,
      y = this.position.y;
    //Remove Enemy From World Map
    map.updateTileMap(x, y, EntityIDs.None);
    //Remove Enemy From Visible Tiles
    map.updateCacheMap(x, y, EntityIDs.None);
    //Remove Pointer on Tilemap to Enemy in Array
    map.updateEnemyPos(x, y, -1);
    //Remove Enemy From Minimap
    minimap.updatePixels(x, y);
    //Remove Enemy From Enemy List
    enemies.splice(this.placeInMap, 1);
    for (let i = this.placeInMap; i < enemies.length; i++) {
      let e = enemies[i];
      e.placeInMap--;
      map.updateEnemyPos(e.position.x, e.position.y, e.placeInMap);
    }
    //Player gets some stuff for successfully killing an enemy
    player.addExperience(this);
    //We completed the action, show Victory Screen
    action.setAction(ActionScreen.Victory);
    //Refresh everything
    mainWindow.displayOnce();
  }
}

class Boss extends Enemy {
  constructor(x, y) {
    super(x, y);
  }
}

class Spider extends Enemy {
  constructor(x, y) {
    super(x, y);
  }
}

class Scorpion extends Enemy {
  constructor(x, y) {
    super(x, y);
  }

  attack(other) {

  }
}

class Ghost extends Enemy {
  constructor(x, y) {
    super(x, y);
  }
}

class Wraith extends Enemy {
  constructor(x, y) {
    super(x, y);
  }
}

class Octopus extends Enemy {
  constructor(x, y) {
    super(x, y);
  }
}

class Dragon extends Boss {
  constructor(x, y) {
    super(x, y);
  }
}

class SkeletonBoss extends Boss {
  constructor(x, y) {
    super(x, y);
  }
}

class Trap {
  constructor(x, y) {
    this.position = {
      x: x,
      y: y,
    };
  }
}
