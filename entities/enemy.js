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
};

function getExpReward(level) {
  return (level + 1) ** 2;
}

class Enemy extends Deity {
  constructor(x, y) {
    super();
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

    this.possibleActions = this.defineActions();
    this.normalizeActions();
  }

  //Default Actions
  //NormalAttack f.e. happens 10 times as often as QuickAttack
  //And 3.33 times as often as Heal
  //Overload in enemy classes for individual behavior
  defineActions() {
    return {
      NormalAttack: {
        chance: 10,
        trigger(from, to) {
          from.attack(to);
        }
      },
      QuickAttack: {
        chance: 1,
        trigger(from, to) {
          from.quickAttack(to);
        }
      },
      Heal: {
        chance: 3,
        trigger(from, to) {
          from.heal(to);
        }
      },
      Flee: {
        chance: 1,
        trigger(from, to) {
          from.flee(to);
        }
      }
    }
  }

  normalizeActions() {
    let actionChanceSum = 0;
    let actionArr = Object.values(this.possibleActions);
    for (let action of actionArr) {
      actionChanceSum += action.chance;
    }
    for (let i = 0; i < actionArr.length; i++) {
      let prevAction = actionArr[i - 1] || null;
      let currAction = actionArr[i];
      currAction.chance = currAction.chance * 100 / actionChanceSum;
      if (prevAction) {
        currAction.chance += prevAction.chance;
      }
    }
  }

  resetMoveCount() {
    this.attr[AttrIDs.MoveCount].current = this.attr[AttrIDs.MoveCount].total;
    this.moveChances = this.init.moveChances;
  }

  initMove() {
    this.resetMoveCount();
    if (this.applyPoison()) return;
    return new Promise((resolve, reject) => {
      let interval = setInterval(() => {
        this.attr[AttrIDs.MoveCount].current--;
        this.moveChances = this.init.moveChances;
        this.move();
        if (this.attr[AttrIDs.MoveCount].current <= 0) {
          // resolve promise
          clearInterval(interval);
          resolve();
        }
      }, 250);
    });
  }

  move() {
    if (this.checkParalyze()) return;

    let prevX = this.position.x;
    let prevY = this.position.y;

    let dir = this.getDirection();

    if (!this.legalMove(prevX + dir.x, prevY + dir.y)) {
      //For some reason we can't move where we want to
      //Please try again
      this.moveChances--;
      if (this.moveChances >= 0) {
        this.move();
      }
      return;
    }

    this.position.x += dir.x;
    this.position.y += dir.y;

    this.updatePositions(prevX, prevY);

    if (player.inViewRange(this)) {}
  }

  initPositions() {
    this.updatePositions(this.position.x, this.position.y);
    mainWindow.subMenus[SubMenu.Field].displayOnce();
  }

  //Default: Legal Move if not water and empty space
  //Overload in enemy classes for individual behavior
  //like only moving on Sand
  legalMove(newX, newY) {
    let targetIDs = mainWindow.subMenus[0].ch[0].ch[0].getIDs(newX, newY);
    return (targetIDs.eID === EntityIDs.None && targetIDs.tID !== TextureIDs.Water);
  }

  //Default: Just move randomly wherever you want
  //Overload in enemy classes for individual behavior
  //like following the player around
  getDirection() {
    let dir = {
      x: 0,
      y: 0
    };
    let r = ~~random(4); //Fast flooring a random float
    switch (r) {
      case 0:
        dir.x = -1;
        break;
      case 1:
        dir.x = 1;
        break;
      case 2:
        dir.y = -1;
        break;
      case 3:
        dir.y = 1;
        break;
    }
    return dir;
  }

  //Default: Update Minimap, Map, Tiles, etc.
  //Overload in enemy classes for individual behavior
  //like being invisible unless you're close to the player
  updatePositions(prevX, prevY) {
    let map = mainWindow.subMenus[0].ch[0].ch[0];
    let minimap = mainWindow.subMenus[0].ch[0].ch[1];
    map.updateEverything(this.position.x, this.position.y, prevX, prevY, EntityIDs[this.constructor.name], this.placeInMap);
    minimap.updatePixels(prevX, prevY);
    minimap.updatePixels(this.position.x, this.position.y);
  }

  performRandomAction(other) {
    let r = Math.random() * 100;
    for (let action of Object.values(this.possibleActions)) {
      if (r < action.chance) {
        action.trigger(this, other);
        return true;
      }
    }
    return false;
  }

  flee(other) {
    if (this.checkParalyze()) return;
    if (this.applyPoison()) return;
    this.attr[AttrIDs.Energy].current = constrain(this.attr[AttrIDs.Energy].current - ActionCost.FleeAction, 0, this.attr[AttrIDs.Energy].total);
    mainWindow.subMenus[SubMenu.Field].ch[1].subActions[ActionScreen.Combat].ch[1].ch[this.lastActionID].setText(["Attempted to flee."]);
    let fleeChance = getFleeChance(player, other);
    if (fleeChance < random()) mainWindow.subMenus[SubMenu.Field].ch[1].setAction(ActionScreen.EnemyFled);
    //else console.log("It attempted to flee, but failed.");
  }

  die() {
    //Do stuff on the tile map, enemy list, player stats....
    let map = mainWindow.subMenus[SubMenu.Field].ch[0].ch[0];
    let minimap = mainWindow.subMenus[SubMenu.Field].ch[0].ch[1];
    let action = mainWindow.subMenus[SubMenu.Field].ch[1];
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

  defineActions() {
    return {
      NormalAttack: {
        chance: 17,
        trigger(from, to) {
          from.attack(to);
        }
      },
      Heal: {
        chance: 2,
        trigger(from, to) {
          from.heal(to);
        }
      },
      Flee: {
        chance: 1,
        trigger(from, to) {
          from.flee(to);
        }
      }
    }
  }

  legalMove(newX, newY) {
    let targetIDs = mainWindow.subMenus[0].ch[0].ch[0].getIDs(newX, newY);
    return targetIDs.tID === TextureIDs.Grass && targetIDs.eID === EntityIDs.None;
  }

  defineAttributes() {
    let attr = super.defineAttributes();
    attr[AttrIDs.SpiderWeb] = new Attribute(this, "Entangle", 0.05, 0.0, 0.0);
    return attr;
  }
}

class Scorpion extends Enemy {
  constructor(x, y) {
    super(x, y);
  }

  defineActions() {
    return {
      NormalAttack: {
        chance: 10,
        trigger(from, to) {
          from.attack(to);
        }
      },
      Heal: {
        chance: 3,
        trigger(from, to) {
          from.heal(to);
        }
      },
      Flee: {
        chance: 2,
        trigger(from, to) {
          from.flee(to);
        }
      }
    }
  }

  defineAttributes() {
    let attr = super.defineAttributes();
    attr[AttrIDs.Poison] = new Attribute(this, "Poison", 0.3, 0.0, 0.001);
    return attr;
  }
}

class Ghost extends Enemy {
  constructor(x, y) {
    super(x, y);
  }

  getDirection() {
    let dir = {
      x: 0,
      y: 0
    };
    if (player.hasHitpointsBelow(0.2) && this.inViewRange(player)) {
      let distX = player.position.x - this.position.x;
      let distY = player.position.y - this.position.y;
      if (abs(distX) > abs(distY)) {
        //Player closer in regards to x direction, should move there first
        dir.x = Math.sign(distX);
      } else {
        //Player closer in regards to y direction, should move there first
        dir.y = Math.sign(distY);
      }
    } else {
      return super.getDirection();
    }
    return dir;
  }

  defineAttributes() {
    let attr = super.defineAttributes();
    attr[AttrIDs.Damage] = new Attribute(this, "Damage", 1, 0.03, 0.1);
    attr[AttrIDs.Hitpoint] = new Attribute(this, "Hitpoint", 10, 1, 1);
    attr[AttrIDs.Evasion] = new Attribute(this, "Evasion", 5, 0.03, 0.01);
    attr[AttrIDs.Sight] = new Attribute(this, "Sight", 9, 0.0, 0.1);
    return attr;
  }
}

class Wraith extends Enemy {
  constructor(x, y) {
    super(x, y);
  }

  defineActions() {
    return {
      Attack: {
        chance: 10,
        trigger(from, to) {
          from.attack(to);
        }
      },
      QuickAttack: {
        chance: 2,
        trigger(from, to) {
          from.quickAttack(to);
        }
      },
      Heal: {
        chance: 3,
        trigger(from, to) {
          from.heal(to);
        }
      }
    }
  }

  getDirection() {
    let dir = {
      x: 0,
      y: 0
    };
    if (this.inViewRange(player)) {
      let distX = player.position.x - this.position.x;
      let distY = player.position.y - this.position.y;
      if (abs(distX) > abs(distY)) {
        //Player closer in regards to x direction, should move there first
        dir.x = Math.sign(distX);
      } else {
        //Player closer in regards to y direction, should move there first
        dir.y = Math.sign(distY);
      }
    } else {
      return super.getDirection();
    }
    return dir;
  }

  updatePositions(prevX, prevY) {
    let map = mainWindow.subMenus[0].ch[0].ch[0];
    let minimap = mainWindow.subMenus[0].ch[0].ch[1];

    map.updateTileMap(prevX, prevY, EntityIDs.None);
    map.updateTileMap(this.position.x, this.position.y, EntityIDs[this.constructor.name]);
    map.updateEnemyPos(prevX, prevY, -1);
    map.updateEnemyPos(this.position.x, this.position.y, this.placeInMap);
    map.updateCacheMap(prevX, prevY, EntityIDs.None);
    if (this.inViewRange(player))
      map.updateCacheMap(this.position.x, this.position.y, EntityIDs[this.constructor.name]);
    else
      map.updateCacheMap(this.position.x, this.position.y, EntityIDs.None);
    minimap.updatePixels(prevX, prevY);
    minimap.updatePixels(this.position.x, this.position.y);
  }

  defineAttributes() {
    let attr = super.defineAttributes();
    attr[AttrIDs.Damage] = new Attribute(this, "Damage", 1, 0.2, 0.1);
    attr[AttrIDs.Hitpoint] = new Attribute(this, "Hitpoint", 50, 10, 5);
    attr[AttrIDs.Evasion] = new Attribute(this, "Evasion", 5, 0.03, 0.01);
    attr[AttrIDs.Sight] = new Attribute(this, "Sight", 9, 0.0, 0.1);
    attr[AttrIDs.Paralyze] = new Attribute(this, "Paralyze", 0.1, 0.0, 0.0);
    return attr;
  }
}

class Octopus extends Enemy {
  constructor(x, y) {
    super(x, y);
  }

  defineActions() {
    return {
      QuickAttack: {
        chance: 2,
        trigger(from, to) {
          let currHP = from.attr[AttrIDs.Hitpoint].current;
          let totHP = from.attr[AttrIDs.Hitpoint].total;
          let ratioHP = currHP / totHP;
          let attacks = ~~(ratioHP * 4) + 1;
          //5 attacks at 100% HP
          //4 attacks above 75% HP
          //3 attacks above 50% HP
          //2 attacks above 25% HP
          for (let i = 0; i < attacks; i++) {
            from.attack(to);
            if (to.isDead) break;
          }
        }
      },
      Heal: {
        chance: 3,
        trigger(from, to) {
          from.heal(to);
        }
      },
      Flee: {
        chance: 10,
        trigger(from, to) {
          from.flee(to);
        }
      }
    }
  }

  legalMove(newX, newY) {
    let targetIDs = mainWindow.subMenus[0].ch[0].ch[0].getIDs(newX, newY);
    return targetIDs.tID === TextureIDs.Water && targetIDs.eID === EntityIDs.None;
  }
}

class Dragon extends Boss {
  constructor(x, y) {
    super(x, y);
  }

  defineAttributes() {
    let attr = super.defineAttributes();
    attr[AttrIDs.Damage] = new Attribute(this, "Damage", 10, 1, 0.1);
    attr[AttrIDs.Hitpoint] = new Attribute(this, "Hitpoint", 150, 10, 5);
    attr[AttrIDs.Evasion] = new Attribute(this, "Evasion", 5, 0.03, 0.01);
    attr[AttrIDs.Sight] = new Attribute(this, "Sight", 9, 0.0, 0.1);
    //attr[AttrIDs.Paralyze] = new Attribute(this, "Paralyze", 0.1, 0.0, 0.0);
    attr[AttrIDs.Burn] = new Attribute(this, "Burn", 0.5, 0.0, 0.0);
    return attr;
  }

  defineActions() {
    return {
      NormalAttack: {
        chance: 90,
        trigger(from, to) {
          from.attack(to);
        }
      },
      SpecialAttack: {
        chance: 10,
        trigger(from, to) {
          from.attr[AttrIDs.Damage].total *= 20;
          from.attack(to);
          from.attr[AttrIDs.Damage].total /= 20;
          from.heal(to);
        }
      },
    }
  }
}

class SkeletonBoss extends Boss {
  constructor(x, y) {
    super(x, y);
    //The SkeletonBoss can now spawn Scorpions :eyes:
    //Well, he can spawn whatever we want!
    this.spawnerHandler = new Spawner(this, x, y, EntityIDs.Scorpion);
  }

  legalMove(newX, newY) {
    let targetIDs = mainWindow.subMenus[0].ch[0].ch[0].getIDs(newX, newY);
    return (targetIDs.eID === EntityIDs.None &&
      targetIDs.tID === TextureIDs.Sand &&
      (targetIDs.sID === SubTextureIDs.VeryDark || targetIDs.sID === SubTextureIDs.Dark));
  }

  defineAttributes() {
    let attr = super.defineAttributes();
    attr[AttrIDs.Hitpoint] = new Attribute(this, "Hitpoint", 1000, 0.0, 0.0);
    attr[AttrIDs.MoveCount] = new Attribute(this, "Move Count", 3, 0.0, 0.05);
    attr[AttrIDs.Sight] = new Attribute(this, "Sight", 7, 0.0, 0.1);
    attr[AttrIDs.Damage] = new Attribute(this, "Damage", 0, 0.0, 0.0);
    return attr;
  }

  defineActions() {
    return {
      Attack: {
        chance: 1,
        trigger(from, to) {
          from.attack(to);
          from.updateHP(from.attr[AttrIDs.Hitpoint].total * 0.01);
          from.checkSpawn();
        }
      }
    }
  }

  checkSpawn() {
    this.spawnerHandler.checkSpawn();
  }

}

class Spawner extends Enemy {
  constructor(par, x, y, enemyID) {
    super(x, y);
    //We don't want to have the Spawner in the List
    //enemies.splice(enemies.length - 1, 1);
    this.owner = par;
    this.timeTillSpawn = 3;
    this.enemyToSpawn = enemyID;
  }

  checkSpawn() {
    this.timeTillSpawn--;
    if (this.timeTillSpawn === 0) {
      this.spawnEnemy(EntityIDs.Scorpion);
      this.timeTillSpawn = 2 + ~~random(2); //2 or 3 rounds, based on random
    }
  }

  spawnEnemy() {
    let map = mainWindow.subMenus[SubMenu.Field].ch[0].ch[0];
    let viewRange = this.owner.attr[AttrIDs.Sight].total;
    let xPos = this.owner.position.x - floor(viewRange / 2);
    let yPos = this.owner.position.y - floor(viewRange / 2);
    let attemptsToSpawn = 3;
    do {
      attemptsToSpawn--;
      let xOffset = ~~random(viewRange);
      let yOffset = ~~random(viewRange);
      if (map.checkIfLocationFree(xPos + xOffset, yPos + yOffset, null, EntityIDs.None, null)) {
        map.addEnemyToLocation(xPos + xOffset, yPos + yOffset, this.enemyToSpawn);
        return true;
      }
    } while (attemptsToSpawn > 0);
    return false;
  }
}

class Trap {
  constructor(x, y) {
    this.position = {
      x: x,
      y: y,
    };
    this.placeInMap = enemies.length;
  }

  initMove() {
    return new Promise((resolve, reject) => {
      let interval = setInterval(() => {
        this.move();
        clearInterval(interval);
        resolve();
      }, 250);
    });
  }

  move() {
    this.updatePositions();
  }

  updatePositions() {
    let map = mainWindow.subMenus[0].ch[0].ch[0];

    map.updateTileMap(this.position.x, this.position.y, EntityIDs[this.constructor.name]);
    map.updateEnemyPos(this.position.x, this.position.y, this.placeInMap);
    map.updateCacheMap(this.position.x, this.position.y, EntityIDs.None);
  }

  die() {
    //Do stuff on the tile map, enemy list, player stats....
    console.log("THIS TRAP IS NOW OFFICIALLY DEAD");
    let map = mainWindow.subMenus[SubMenu.Field].ch[0].ch[0];
    let minimap = mainWindow.subMenus[SubMenu.Field].ch[0].ch[1];
    let action = mainWindow.subMenus[SubMenu.Field].ch[1];
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
    action.setAction(ActionScreen.Trap);
    //Refresh everything
    mainWindow.displayOnce();
  }
}