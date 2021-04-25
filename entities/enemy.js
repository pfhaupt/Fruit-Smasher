let enemies = new Map();

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

class Enemy extends Deity {
  constructor(x, y, id) {
    super(100, 10, 3, 2);
    this.position = {
      x: x,
      y: y,
    };
    this.typeID = id;
    this.name = enemyNames[~~(Math.random() * enemyNames.length)];
    let r = 2 + Math.random() * 4;
    r = ~~r;
    this.init = {
      moveChances: 3
    }
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
      }, 100);
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
    if (targetIDs.eID !== 0 || targetIDs.tID === 2) {
      //Entity already at target pos, or water at target pos
      this.moveChances--;
      if (this.moveChances >= 0) {
        this.move();
      }
      return;
    }

    this.position.x += dirX;
    this.position.y += dirY;
    map.updateTileMap(prevX, prevY, 0);
    map.updateTileMap(this.position.x, this.position.y, this.typeID);
    map.updateCacheMap(prevX, prevY, 0);
    map.updateCacheMap(this.position.x, this.position.y, this.typeID);
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

  die() {
    //Do stuff on the tile map, enemy list, player stats....
    console.log("THIS ENEMY IS NOW OFFICIALLY DEAD");
    let map = mainWindow.subMenus[0].children[0].children[0];
    let minimap = mainWindow.subMenus[0].children[0].children[1];
    let action = mainWindow.subMenus[0].children[1];
    let x = this.position.x,
      y = this.position.y;
    //Remove Enemy From World Map
    map.updateTileMap(x, y, 0);
    //Remove Enemy From Visible Tiles
    map.updateCacheMap(x, y, 0);
    //Remove Enemy From Minimap
    minimap.updatePixels(x, y);
    //Remove Enemy From Enemy List
    enemies.delete((x * 1000 + y));
    //We completed the action, show default
    action.setAction(ActionScreen.Victory);
    //Refresh everything
    mainWindow.displayOnce();
  }
}
