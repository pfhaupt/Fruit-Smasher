class BaseEntity {
  constructor(l = 1, h = 10, d = 1, r = 0.1, s = 1) {
    this.level = l;
    this.maxHP = h;
    this.hp = h;
    this.dmg = d;
    this.regen = r;
    this.atkSpeed = s;
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
