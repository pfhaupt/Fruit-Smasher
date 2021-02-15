class Player extends BaseEntity {
  constructor(h = 100, d = 2, r = 0.25, s = 2) {
    super(0, h, d, r, s);
    this.experience = 0;
    this.expForLevel1 = 100;
    this.expForLvlUp = this.expForLevel1;
    this.expIncrease = 10;
  }

  addExperience(enemyLvl) {
    this.experience += (enemyLvl + 1) * 5;
    if (this.experience >= this.expForLvlUp) this.levelUp();
  }

  levelUp() {
    /*
    while (this.experience >= this.expForLvlUp) {
      this.experience -= this.expForLvlUp;
      this.expForLvlUp += 10;
      this.level++;
    }
    */
    let b = this.expForLevel1;
    let i = this.expIncrease;
    let e = this.experience;
    let c = this.level;
    let r = floor((sqrt(4*b*b+4*b*(2*c-1)*i+i*(pow(1-2*c, 2)*i+8*e))-2*b+i)/(2*i));

    let xpCostCurrent = b*c+i/2*((c-1)*(c-1)+(c-1));
    let xpCostResult = b*r+i/2*((r-1)*(r-1)+(r-1));
    let totalXP = xpCostResult - xpCostCurrent;
    this.experience -= totalXP;
    this.level = r;
    this.expForLvlUp = this.expForLevel1 + this.expIncrease * this.level;
    this.maxHP = 100 + 10 * this.level;
    this.dmg = 2 + 1 * this.level;
    this.regen = 0.25 * (this.level + 1);
    this.atkSpeed = Math.ceil(this.level / 10);
  }

  respawn() {
    this.hp = this.maxHP;
    this.experience = Math.floor(this.experience * 0.9);
    console.log("You died");
  }
}


/*
totalXP=100L+5((L-1)^2+(L-1))
totalXP(lowLevel, highLevel) = (100*highLevel+5*((highLevel-1)^2+(highLevel-1)))
                              -(100*lowLevel+5*((lowLevel-1)^2+(lowLevel-1)))
experience = (baseXP*result+XPincrease/2*((result-1)^2+(result-1)))
            -(baseXP*currentLevel+XPincrease/2*((currentLevel-1)^2+(currentLevel-1)))
baseXP*result+XPincrease/2*((result-1)^2+(result-1))
= experience + (baseXP*currentLevel+XPincrease/2*((currentLevel-1)^2+(currentLevel-1)))

r = (sqrt(4*b^2+4*b*(2*c-1)*i+i*((1-2*c)^2*i+8*e))-2*b+i)((2*i))

*/
