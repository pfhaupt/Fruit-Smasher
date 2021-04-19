let enemies = [];

class Enemy {
  constructor(x, y, id) {
    this.position = {
      x: x,
      y: y,
    };
    this.typeID = id;
    let r = 2 + Math.random() * 4;
    r = ~~r;
    this.init = {
      moveCount: r,
      moveChances: 3
    };
    this.moveCount = this.init.moveCount;
    this.maxHP = 100;
    this.hp = 100;
    this.maxEP = 100;
    this.ep = 100;
  }

  resetMoveCount() {
    this.moveCount = this.init.moveCount;
    this.moveChances = this.init.moveChances;
  }

  initMove() {
    this.resetMoveCount();
    return new Promise((resolve, reject) => {
      let interval = setInterval(() => {
        this.moveCount--;
        this.moveChances = this.init.moveChances;
        this.move();
        if (this.moveCount <= 0) {
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

    if (player.inViewRange(this)) {
    }
  }

  checkDeath() {
    return this.hp <= 0;
  }

  update(other, dt) {
    this.attack(other, dt);
    this.regenerate(dt);
  }

  attack(other, dt) {
    other.hp -= this.dmg * this.atkSpeed * dt;
  }

  regenerate(dt) {
    this.hp = constrain(this.hp + this.regen * dt, 0, this.maxHP);
  }
}
