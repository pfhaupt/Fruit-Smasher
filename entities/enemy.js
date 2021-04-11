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
      moveCount: ~~r,
    };
    this.moveCount = this.init.moveCount;
  }

  resetMoveCount() {
    this.moveCount = this.init.moveCount;
  }

  initMove() {
    this.resetMoveCount();
    return new Promise((resolve, reject) => {
      let interval = setInterval(() => {
        this.moveCount--;
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
    let r = ~~random(4); //Fast flooring a random float
    let prevX = this.position.x;
    let prevY = this.position.y;

    switch (r) {
      case 0:
        this.position.x--;
        break;
      case 1:
        this.position.x++;
        break;
      case 2:
        this.position.y--;
        break;
      case 3:
        this.position.y++;
        break;
    }
    let map = mainWindow.subMenus[0].children[0].children[0];
    let minimap = mainWindow.subMenus[0].children[0].children[1];
    map.updateTileMap(prevX, prevY, 0);
    map.updateTileMap(this.position.x, this.position.y, this.typeID);
    minimap.updatePixels(prevX, prevY);
    minimap.updatePixels(this.position.x, this.position.y);

    if (player.inViewRange(this)) {
      map.forceUpdate();
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
