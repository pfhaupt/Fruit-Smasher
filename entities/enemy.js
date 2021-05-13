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

  defineActions() {
    //Default Actions
    //NormalAttack f.e. happens 10 times as often as QuickAttack
    //And 3.33 times as often as Heal
    //Overload in enemy classes for individual behavior
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
    this.attributes[AttributeIDs.MoveCount].current = this.attributes[AttributeIDs.MoveCount].total;
    this.moveChances = this.init.moveChances;
  }

  initMove() {
    this.resetMoveCount();
    if (this.applyPoison()) return;
    return new Promise((resolve, reject) => {
      let interval = setInterval(() => {
        this.attributes[AttributeIDs.MoveCount].current--;
        this.moveChances = this.init.moveChances;
        this.move();
        if (this.attributes[AttributeIDs.MoveCount].current <= 0) {
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

    let dir = this.getRandomDirection();

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

  //Default: Legal Move if not water and empty space
  //Overload in enemy classes for individual behavior
  legalMove(newX, newY) {
    let targetIDs = mainWindow.subMenus[0].children[0].children[0].getIDs(newX, newY);
    return (targetIDs.eID === EntityIDs.None && targetIDs.tID !== TextureIDs.Water);
  }

  //Default: Just move randomly wherever you want
  //Overload in enemy classes for individual behavior
  //like following the player around
  getRandomDirection() {
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
    let map = mainWindow.subMenus[0].children[0].children[0];
    let minimap = mainWindow.subMenus[0].children[0].children[1];
    map.updateEverything(this.position.x, this.position.y, prevX, prevY, EntityIDs[this.constructor.name], this.placeInMap);
    minimap.updatePixels(this.position.x, this.position.y);
    minimap.updatePixels(prevX, prevY);
  }

  performRandomAction(other) {
    let r = Math.random() * 100;
    /*
    if (r < this.ActionChance.Attack) this.attack(other);
    else if (r < this.ActionChance.Heal) this.heal();
    else if (r < this.ActionChance.Wait) this.wait();
    else this.flee(other);
    */
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
    console.log("FLEE");
    this.attributes[AttributeIDs.Energy].current = constrain(this.attributes[AttributeIDs.Energy].current - ActionCost.FleeAction, 0, this.attributes[AttributeIDs.Energy].total);
    this.lastAction = "Attempted to flee.";
    let fleeChance = getFleeChance(player, other);
    if (fleeChance < random()) mainWindow.subMenus[SubMenu.Field].children[1].setAction(ActionScreen.EnemyFled);
    else console.log("It attempted to flee, but failed.");
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
    let targetIDs = mainWindow.subMenus[0].children[0].children[0].getIDs(newX, newY);
    return targetIDs.tID === TextureIDs.Grass && targetIDs.eID === EntityIDs.None;
  }

  defineAttributes() {
    let attributes = super.defineAttributes();
    attributes[AttributeIDs.SpiderWeb] = new Attribute(this, "Bound", 0.05, 0.0, 0.0);
    return attributes;
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
    let attributes = super.defineAttributes();
    attributes[AttributeIDs.Poison] = new Attribute(this, "Poison", 0.3, 0.0, 0.001);
    return attributes;
  }
}

class Ghost extends Enemy {
  constructor(x, y) {
    super(x, y);
  }

  getRandomDirection() {
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
      return super.getRandomDirection();
    }
    return dir;
  }

  defineAttributes() {
    let attributes = super.defineAttributes();
    attributes[AttributeIDs.Damage] = new Attribute(this, "Damage", 1, 0.03, 0.1);
    attributes[AttributeIDs.Hitpoint] = new Attribute(this, "Hitpoint", 10, 1, 1);
    attributes[AttributeIDs.Evasion] = new Attribute(this, "Evasion", 5, 0.03, 0.01);
    attributes[AttributeIDs.Sight] = new Attribute(this, "Sight", 9, 0.0, 0.1);
    return attributes;
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

  getRandomDirection() {
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
      return super.getRandomDirection();
    }
    return dir;
  }

  updatePositions(prevX, prevY) {
    let map = mainWindow.subMenus[0].children[0].children[0];
    let minimap = mainWindow.subMenus[0].children[0].children[1];

    map.updateTileMap(prevX, prevY, EntityIDs.None);
    map.updateTileMap(this.position.x, this.position.y, EntityIDs[this.constructor.name]);
    map.updateEnemyPos(prevX, prevY, -1);
    map.updateEnemyPos(this.position.x, this.position.y, this.placeInMap);
    map.updateCacheMap(prevX, prevY, EntityIDs.None);
    if (this.inViewRange(player))
      map.updateCacheMap(this.position.x, this.position.y, EntityIDs[this.constructor.name]);
    else
      map.updateCacheMap(this.position.x, this.position.y, EntityIDs.None);
    minimap.updatePixels(this.position.x, this.position.y);
    minimap.updatePixels(prevX, prevY);
  }

  defineAttributes() {
    let attributes = super.defineAttributes();
    attributes[AttributeIDs.Damage] = new Attribute(this, "Damage", 1, 0.2, 0.1);
    attributes[AttributeIDs.Hitpoint] = new Attribute(this, "Hitpoint", 50, 10, 5);
    attributes[AttributeIDs.Evasion] = new Attribute(this, "Evasion", 5, 0.03, 0.01);
    attributes[AttributeIDs.Sight] = new Attribute(this, "Sight", 9, 0.0, 0.1);
    attributes[AttributeIDs.Paralyze] = new Attribute(this, "Paralyze", 0.1, 0.0, 0.0);
    return attributes;
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
          let currHP = from.attributes[AttributeIDs.Hitpoint].current;
          let totHP = from.attributes[AttributeIDs.Hitpoint].total;
          let ratioHP = currHP / totHP;
          let attacks = ~~(ratioHP * 5);
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
    let targetIDs = mainWindow.subMenus[0].children[0].children[0].getIDs(newX, newY);
    return targetIDs.tID === TextureIDs.Water && targetIDs.eID === EntityIDs.None;
  }
}

class Dragon extends Boss {
  constructor(x, y) {
    super(x, y);
  }

  defineAttributes() {
    let attributes = super.defineAttributes();
    attributes[AttributeIDs.Damage] = new Attribute(this, "Damage", 10, 1, 0.1);
    attributes[AttributeIDs.Hitpoint] = new Attribute(this, "Hitpoint", 150, 10, 5);
    attributes[AttributeIDs.Evasion] = new Attribute(this, "Evasion", 5, 0.03, 0.01);
    attributes[AttributeIDs.Sight] = new Attribute(this, "Sight", 9, 0.0, 0.1);
    attributes[AttributeIDs.Paralyze] = new Attribute(this, "Paralyze", 0.1, 0.0, 0.0);
    return attributes;
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
          from.attributes[AttributeIDs.Damage].total *= 20;
          from.attack(to);
          from.attributes[AttributeIDs.Damage].total /= 20;
          from.heal(to);
        }
      },
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
      let map = mainWindow.subMenus[0].children[0].children[0];

      map.updateTileMap(this.position.x, this.position.y, EntityIDs[this.constructor.name]);
      map.updateEnemyPos(this.position.x, this.position.y, this.placeInMap);
      map.updateCacheMap(this.position.x, this.position.y, EntityIDs.None);
    }

    die() {
      //Do stuff on the tile map, enemy list, player stats....
      console.log("THIS TRAP IS NOW OFFICIALLY DEAD");
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
      action.setAction(ActionScreen.Trap);
      //Refresh everything
      mainWindow.displayOnce();
    }
  }
