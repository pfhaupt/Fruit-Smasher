let GlobalChance = {
  Evade: 35,
};

function getUniqueID(x, y) {
  return x * 1000 + y;
}

class Deity {
  constructor() {
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

    this.attributes = this.defineAttributes();

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

    this.lastAction = "None";
    this.statusEffects = {
      isDead: false,
      isParalyzed: false,
      isPoisoned: false,
      isEntangled: false
    };
    this.paralyzedMoves = 0;
    this.poisonStacks = 0;

    this.calculateTotalAttributes();
  }

  resetMoveCount() {
    this.attributes[AttributeIDs.MoveCount].resetCurrent();
  }

  update(other, dt) {}

  calculateTotalAttributes() {
    for (let i = 0; i < this.attributes.length; i++) {
      let a = this.attributes[i];
      a.calculateTotal();
    }
  }

  defineAttributes() {
    let attributes = [];
    attributes.push(new Attribute(this, "Damage", 5, 0.2, 0.1));
    attributes.push(new Attribute(this, "Energy", 100, 5, 2));
    attributes.push(new Attribute(this, "Hitpoint", 100, 10, 5));
    attributes.push(new Attribute(this, "Regen", 0.2, 0.1, 0.01));
    attributes.push(new Attribute(this, "Speed", 1, 0.1, 0.01));
    attributes.push(new Attribute(this, "Accuracy", 1, 0.02, 0.01));
    attributes.push(new Attribute(this, "Evasion", 1, 0.015, 0.01));
    attributes.push(new Attribute(this, "Experience", 1, 0.0, 0.002));
    attributes.push(new Attribute(this, "Sight", 15, 0.0, 0.1));
    attributes.push(new Attribute(this, "Move Count", 5, 0.0, 0.05));
    attributes.push(new Attribute(this, "Paralyze", 0, 0.0, 0.001));
    attributes.push(new Attribute(this, "Poison", 0, 0.0, 0.001));
    attributes.push(new Attribute(this, "Bound", 0, 0.0, 0.001));
    return attributes;
  }

  addAttribute(att, count) {
    let possibleLevels = Math.min(count, this.skillPoints);
    this.attributes[att].addSkillLevel(possibleLevels);
    this.skillPoints -= possibleLevels;
  }

  removeAttribute(att, count) {
    let possibleLevels = Math.min(count, this.attributes[att].skillLevel);
    this.attributes[att].addSkillLevel(-possibleLevels);
    this.skillPoints += possibleLevels;
  }

  inViewRange(other) {
    let viewRange = this.attributes[AttributeIDs.Sight].total;
    let xPos = this.position.x - floor(viewRange / 2);
    let yPos = this.position.y - floor(viewRange / 2);
    return (other.position.x >= xPos &&
      other.position.x < xPos + viewRange &&
      other.position.y >= yPos &&
      other.position.y < yPos + viewRange);
  }

  checkDeath() {
    return this.attributes[AttributeIDs.Hitpoint].current <= 0;
  }

  activatedTrap() {
    this.attributes[AttributeIDs.Hitpoint].current *= 0.9;
  }

  hasHitpointsBelow(val) {
    return this.attributes[AttributeIDs.Hitpoint].current < val * this.attributes[AttributeIDs.Hitpoint].total;
  }

  hasDodgedAttack(other) {
    if (this.attributes[AttributeIDs.Evasion].total > other.attributes[AttributeIDs.Evasion].total) {
      return Math.random(100) < GlobalChance.Evade;
    }
    return false;
  }

  checkParalyze() {
    if (this.statusEffects.isParalyzed) {
      this.paralyzedMoves--;
      if (random() < 0.01) this.paralyzedMoves = 0;
      this.statusEffects.isParalyzed = this.paralyzedMoves > 0;
      return this.statusEffects.isParalyzed;
    } else {
      this.paralyzedMoves = 0;
      return false;
    }
  }

  applyPoison() {
    this.updateHP(-1 * this.poisonStacks);
    return this.statusEffects.isDead;
  }

  checkPoison() {
    if (this.statusEffects.isPoisoned) {
      this.poisonStacks--;
      this.statusEffects.isPoisoned = this.poisonStacks > 0;
      return this.statusEffects.isPoisoned;
    } else {
      this.statusEffects.poisonStacks = 0;
      return false;
    }
  }

  checkEntanglement() {
    if (this.statusEffects.isEntangled) {
      this.statusEffects.isEntangled = false;
      return true;
    } else {
      return false;
    }
  }

  poison() {
    this.statusEffects.isPoisoned = true;
    this.poisonStacks++;
    this.lastAction = "Poisoned (" + pl("Stack", this.poisonStacks) + ")";
  }

  paralyze() {
    if (this.statusEffects.isParalyzed) return;
    this.lastAction = "Paralyzed";
    this.statusEffects.isParalyzed = true;
    this.paralyzedMoves = 5;
  }

  entangle() {
    if (this.statusEffects.isEntangled) return;
    this.lastAction = "Entangled";
    this.statusEffects.isEntangled = true;
  }

  addExperience(other) {
    this.experience += other.expReward * this.attributes[AttributeIDs.Experience].total;
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

    this.calculateTotalAttributes();
  }

  attack(other) {
    if (this.applyPoison()) return;
    if (this.checkParalyze()) return;
    if (this.checkEntanglement()) return;
    console.log("ATTACK");
    this.attributes[AttributeIDs.Energy].current = constrain(this.attributes[AttributeIDs.Energy].current - ActionCost.NormalAction, 0, this.attributes[AttributeIDs.Energy].total);
    this.lastAction = "Normal Attack";
    let minDmg = this.attributes[AttributeIDs.Damage].total * this.damageRange.min,
      maxDmg = this.attributes[AttributeIDs.Damage].total * this.damageRange.max;
    let dmg = minDmg + Math.random() * (maxDmg - minDmg);
    if (other.hp !== 0) {
      if (other.hasDodgedAttack(this)) {
        this.lastAction = "Missed Attack";
        return;
      }
      if (this.attributes[AttributeIDs.Paralyze].total > 0) {
        let r = Math.random();
        if (r < this.attributes[AttributeIDs.Paralyze].total) {
          other.paralyze();
        }
      }
      if (this.attributes[AttributeIDs.Poison].total > 0) {
        let r = Math.random();
        if (r < this.attributes[AttributeIDs.Poison].total) {
          other.poison();
        }
      }
      if (this.attributes[AttributeIDs.SpiderWeb].total > 0) {
        let r = Math.random();
        if (r < this.attributes[AttributeIDs.SpiderWeb].total) {
          other.entangle();
        }
      }
      other.updateHP(-dmg);
    }
  }

  quickAttack(other) {
    if (this.applyPoison()) return;
    if (this.checkParalyze()) return;
    if (this.checkEntanglement()) return;
    console.log("QUICK ATTACK");
    this.attributes[AttributeIDs.Energy].current = constrain(this.attributes[AttributeIDs.Energy].current - ActionCost.QuickAction, 0, this.attributes[AttributeIDs.Energy].total);
    this.lastAction = "Quick Attack";
    let r = ~~(Math.random() * 3) + 1;
    for (let i = 0; i < r; i++) {
      if (other.isDead) return;
      let minDmg = this.attributes[AttributeIDs.Damage].total * this.damageRange.min,
        maxDmg = this.attributes[AttributeIDs.Damage].total * this.damageRange.max;
      let dmg = minDmg + Math.random() * (maxDmg - minDmg);
      if (other.hp !== 0)
        other.updateHP(-dmg);
    }
  }

  heal(other) {
    if (this.checkPoison()) return;
    if (this.checkParalyze()) return;
    console.log("HEAL");
    this.attributes[AttributeIDs.Energy].current = constrain(this.attributes[AttributeIDs.Energy].current - ActionCost.HealAction, 0, this.attributes[AttributeIDs.Energy].total);
    this.lastAction = "Heal";
    let minHeal = this.attributes[AttributeIDs.Damage].total * this.healRange.min,
      maxHeal = this.attributes[AttributeIDs.Damage].total * this.healRange.max;
    let heal = minHeal + Math.random() * (maxHeal - minHeal);
    this.updateHP(heal);
  }

  wait() {
    if (this.checkParalyze()) return;
    if (this.applyPoison()) return;
    console.log("WAIT");
    this.attributes[AttributeIDs.Energy].current = constrain(this.attributes[AttributeIDs.Energy].current - ActionCost.WaitAction, 0, this.attributes[AttributeIDs.Energy].total);
    this.lastAction = "Waiting";
  }

  updateHP(val) {
    this.attributes[AttributeIDs.Hitpoint].current = constrain(this.attributes[AttributeIDs.Hitpoint].current + val, 0, this.attributes[AttributeIDs.Hitpoint].total);
    if (this.attributes[AttributeIDs.Hitpoint].current === 0) {
      this.statusEffects.isDead = true;
      this.die();
    }
  }
}
