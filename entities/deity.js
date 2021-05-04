function getUniqueID(x, y) {
  return x * 1000 + y;
}

class Deity {
  constructor(h, d, r, s) {
    this.position = {
      x: 0,
      y: 0,
    };

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
      enerpoints: {
        name: "Energy",
        fromLevel: h,
        current: h,
        skillLevel: 0,
        boostPerSkillLevel: 5,
        fromSkill: 0,
        total: 0,
      },
      hitpoints: {
        name: "Hitpoint",
        fromLevel: h,
        current: h,
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
      sight: {
        name: "Sight",
        fromLevel: 15,
        skillLevel: 0,
        boostPerSkillLevel: 0.1,
        fromSkill: 0,
        total: 0,
      },
      moveCount: {
        name: "Move Count",
        fromLevel: 5,
        skillLevel: 0,
        boostPerSkillLevel: 0.05,
        fromSkill: 0,
        current: 0,
        total: 0,
      }
    };

    //Range for dealing damage to an enemy is [Damage*min;Damage*max]
    this.damageRange = {
      min: 0.7,
      max: 1.3,
    };

    //Range for Healing is [Damage*min;Damage*max]
    this.healRange = {
      min: 0.4,
      max: 0.8
    };

    this.calculateTotalAttributes();
    this.attributes.moveCount.current = this.attributes.moveCount.total;
    this.attributes.hitpoints.current = this.attributes.hitpoints.total;
    this.attributes.enerpoints.current = this.attributes.enerpoints.total;
  }

  resetMoveCount() {
    this.attributes.moveCount.current = this.attributes.moveCount.total;
  }

  update(other, dt) {}

  calculateSkillBoost(att) {
    this.attributes[att].fromSkill = this.attributes[att].skillLevel * this.attributes[att].boostPerSkillLevel;
  }

  calculateTotalAttributes() {
    for (var a in this.attributes) {
      this.attributes[a].total = this.attributes[a].fromLevel + this.attributes[a].fromSkill;
      //console.log(a, this.attributes[a].total);
    }
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

  inViewRange(other) {
    let viewRange = this.attributes.sight.total;
    let xPos = this.position.x - floor(viewRange / 2);
    let yPos = this.position.y - floor(viewRange / 2);
    return (other.position.x >= xPos &&
      other.position.x < xPos + viewRange &&
      other.position.y >= yPos &&
      other.position.y < yPos + viewRange);
  }

  checkDeath() {
    return this.attributes.hitpoints.current <= 0;
  }

  addExperience(other) {
    this.experience += other.experience * this.attributes.expBoost.total;
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
    this.experience -= totalXP;
    this.level = r;
    this.expForLvlUp = this.expForLevel1 + this.expIncrease * this.level;
    */
    let c = this.level;
    let r = this.level + 1;
    if (this.experience === this.expForLvlUp) {
      this.experience -= this.expForLvlUp;
      this.level = r;
    } else {
      let e = this.experience;
      let i = this.expIncrease;
      let b = this.expForLevel1;
      //New Level r after calculating e experience at level c (exponential growth)

      let xpForCurrentLevel = b * (1 - pow(i, c)) / (1 - i);
      r = floor(log(1 + (e + xpForCurrentLevel) * (i - 1) / b) / log(i) + 0.001);
      let xpForResultLevel = b * (1 - pow(i, r)) / (1 - i);
      let totalXP = xpForResultLevel - xpForCurrentLevel;
      this.experience -= totalXP;
      this.level = r;
    }
    this.expForLvlUp = this.expForLevel1 * pow(this.expIncrease, this.level);
    this.skillPoints += this.skillPointsPerLevel * (r - c);
    this.attributes.damage.fromLevel = 2 + 1 * this.level;
    this.attributes.maxHP.fromLevel = 100 + 10 * this.level;
    this.attributes.regen.fromLevel = 0.25 * (this.level + 1);
    this.attributes.atkSpeed.fromLevel = Math.ceil(this.level / 10);
    this.attributes.maxHP.fromLevel = 100 + 10 * this.level;

    this.calculateTotalAttributes();
  }

  attack(other) {
    console.log("ATTACK");
    let minDmg = this.attributes.damage.total * this.damageRange.min,
      maxDmg = this.attributes.damage.total * this.damageRange.max;
    let dmg = minDmg + Math.random() * (maxDmg - minDmg);
    console.log(dmg);
    other.updateHP(-dmg);
  }

  heal() {
    console.log("HEAL");
    let minHeal = this.attributes.damage.total * this.healRange.min,
      maxHeal = this.attributes.damage.total * this.healRange.max;
    let heal = minHeal + Math.random() * (maxHeal - minHeal);
    console.log(heal);
    this.updateHP(heal);
  }

  wait() {
    console.log("WAIT");
  }

  flee(other) {
    console.log("FLEE");
    let fleeChance = getFleeChance(player, other);
    if (fleeChance < random()) console.log("HELP");
  }

  updateHP(val) {
    this.attributes.hitpoints.current = constrain(this.attributes.hitpoints.current + val, 0, this.attributes.hitpoints.total);
    if (this.attributes.hitpoints.current === 0) this.die();
  }

}
