class Player {
  constructor(h = 100, d = 2, r = 0.25, s = 2) {
    this.level = 0;
    this.experience = 0;
    this.expForLevel1 = 100;
    this.expForLvlUp = this.expForLevel1;
    this.expIncrease = 1.05;
    this.skillPoints = 0;
    this.skillPointsPerLevel = 5;

    this.attributes = {
      damage: {
        name: "Damage",
        fromLevel: d,
        skillLevel: 0,
        boostPerSkillLevel: 0.1,
        fromSkill: 0,
        total: 0,
      },
      maxHP: {
        name: "Hitpoint",
        fromLevel: h,
        skillLevel: 0,
        boostPerSkillLevel: 5,
        fromSkill: 0,
        total: 0,
      },
      regen: {
        name: "Regen",
        fromLevel: r,
        skillLevel: 0,
        boostPerSkillLevel: 0.02,
        fromSkill: 0,
        total: 0,
      },
      atkSpeed: {
        name: "Speed",
        fromLevel: s,
        skillLevel: 0,
        boostPerSkillLevel: 0.01,
        fromSkill: 0,
        total: 0,
      },
      expBoost: {
        name: "Experience",
        fromLevel: 1,
        skillLevel: 0,
        boostPerSkillLevel: 0.002,
        fromSkill: 0,
        total: 0,
      },
    }

    this.hp = h;
    this.calculateTotalAttributes();
  }

  checkDeath() {
    return this.hp <= 0;
  }

  update(other, dt) {
    this.attack(other, dt);
    this.regenerate(dt);
  }

  attack(other, dt) {
    other.hp -= this.attributes.damage.total * this.attributes.atkSpeed.total * dt;
  }

  regenerate(dt) {
    this.hp = constrain(this.hp + this.attributes.regen.total * dt, 0, this.attributes.maxHP.total);
  }

  calculateSkillBoost(att) {
    this.attributes[att].fromSkill = this.attributes[att].skillLevel * this.attributes[att].boostPerSkillLevel;
  }

  calculateTotalAttributes() {
    for (var a in this.attributes) {
      this.attributes[a].total = this.attributes[a].fromLevel + this.attributes[a].fromSkill;
      //console.log(a, this.attributes[a].total);
    }
  }

  addExperience(enemyLvl) {
    this.experience += (enemyLvl + 1) * 5 * this.attributes.expBoost.total;
    if (this.experience >= this.expForLvlUp) this.levelUp();
  }

  levelUp() {

    /*
    let b = this.expForLevel1;
    let i = this.expIncrease;
    let e = this.experience;
    let c = this.level;
    //New Level r after calculating e experience at level c (linear growth)
    let r = floor((sqrt(4 * b * b + 4 * b * (2 * c - 1) * i + i * (pow(1 - 2 * c, 2) * i + 8 * e)) - 2 * b + i) / (2 * i));

    //Getting XP cost for a given Level l
    //totalXP=BaseXP*l+IncreasePerLevel/2((l-1)^2+(l-1))
    let xpCostCurrent = b * c + i / 2 * ((c - 1) * (c - 1) + (c - 1));
    let xpCostResult = b * r + i / 2 * ((r - 1) * (r - 1) + (r - 1));
    //Experience cost to get from current level to new level
    let totalXP = xpCostResult - xpCostCurrent;
    */
    let e = this.experience;
    let i = this.expIncrease;
    let b = this.expForLevel1;
    let c = this.level;
    //New Level r after calculating e experience at level c (exponential growth)
    let r = floor(log(xp * log(i) / b + pow(i, c)) / log(i));
    let xpCostCurrent = b / log(i) * (pow(i, c) - 1);
    let xpCostResult = b / log(i) * (pow(i, r) - 1);
    let totalXP = xpCostResult - xpCostCurrent;
    this.experience -= totalXP;
    this.level = r;
    this.expForLvlUp = this.expForLevel1 + this.expIncrease * this.level;
    this.skillPoints += this.skillPointsPerLevel * (r - c);
    this.attributes.damage.fromLevel = 2 + 1 * this.level;
    this.attributes.maxHP.fromLevel = 100 + 10 * this.level;
    this.attributes.regen.fromLevel = 0.25 * (this.level + 1);
    this.attributes.atkSpeed.fromLevel = Math.ceil(this.level / 10);
    this.attributes.maxHP.fromLevel = 100 + 10 * this.level;

    this.calculateTotalAttributes();
  }

  respawn() {
    this.hp = this.attributes.maxHP.total;
    this.experience = Math.floor(this.experience * 0.9);
    console.log("You died");
  }

  addAttribute(att, count) {
    let possibleLevels = Math.min(count, this.skillPoints);

    this.attributes[att].skillLevel += possibleLevels;
    this.skillPoints -= possibleLevels;
    this.calculateSkillBoost(att);
    this.calculateTotalAttributes();
  }

  removeAttribute(att, count) {
    let possibleLevels = Math.min(count, this.attributes[att].skillLevel);
    this.attributes[att].skillLevel -= possibleLevels;
    this.skillPoints += possibleLevels;
    this.calculateSkillBoost(att);
    this.calculateTotalAttributes();
  }
}


/*
linear exp increase per level
-----------------------------
totalXP=100L+5((L-1)^2+(L-1))
totalXP(lowLevel, highLevel) = (100*highLevel+5*((highLevel-1)^2+(highLevel-1)))
                              -(100*lowLevel+5*((lowLevel-1)^2+(lowLevel-1)))
experience = (baseXP*result+XPincrease/2*((result-1)^2+(result-1)))
            -(baseXP*currentLevel+XPincrease/2*((currentLevel-1)^2+(currentLevel-1)))
baseXP*result+XPincrease/2*((result-1)^2+(result-1))
= experience + (baseXP*currentLevel+XPincrease/2*((currentLevel-1)^2+(currentLevel-1)))

r = (sqrt(4*b^2+4*b*(2*c-1)*i+i*((1-2*c)^2*i+8*e))-2*b+i)((2*i))

exponential exp increase per level
----------------------------------
function levelsFromGivenXP(xp, currentLevel) {
  var bruch = xp * log(i) / b;
  var expr = bruch + pow(i, currentLevel);
  return floor(log(expr)/log(i));
}
*/
