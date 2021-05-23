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
    this.lastActionID = 28;

    this.attr = this.defineAttributes();

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
    this.statusEffects = this.defineStatusEffects();

    this.calculateTotalAttributes();
  }

  resetMoveCount() {
    this.attr[AttrIDs.MoveCount].resetCurrent();
  }

  update(other, dt) {}

  updateHP(val) {
    this.attr[AttrIDs.Hitpoint].current = constrain(this.attr[AttrIDs.Hitpoint].current + val, 0, this.attr[AttrIDs.Hitpoint].total);
    if (this.attr[AttrIDs.Hitpoint].current === 0) {
      this.statusEffects[StatEffIDs.Dead].curr = true;
      this.die();
    }
  }

  calculateTotalAttributes() {
    for (let i = 0; i < this.attr.length; i++) {
      let a = this.attr[i];
      a.calculateTotal();
    }
  }

  defineStatusEffects() {
    let sEff = [];
    sEff.push(new StatusEffect(this, "Dead"));
    sEff.push(new StatusEffect(this, "Paralyze"));
    sEff.push(new StatusEffect(this, "Poison"));
    sEff.push(new StatusEffect(this, "Entangle"));
    sEff.push(new StatusEffect(this, "Burn"));
    return sEff;
  }

  defineAttributes() {
    let attr = [];
    attr.push(new Attribute(this, "Damage", 5, 0.2, 0.1));
    attr.push(new Attribute(this, "Energy", 100, 5, 2));
    attr.push(new Attribute(this, "Hitpoint", 100, 10, 5));
    attr.push(new Attribute(this, "Regen", 0.2, 0.1, 0.01));
    attr.push(new Attribute(this, "Speed", 1, 0.1, 0.01));
    attr.push(new Attribute(this, "Accuracy", 1, 0.02, 0.01));
    attr.push(new Attribute(this, "Evasion", 1, 0.015, 0.01));
    attr.push(new Attribute(this, "Experience", 1, 0.0, 0.002));
    attr.push(new Attribute(this, "Sight", 15, 0.0, 0.1));
    attr.push(new Attribute(this, "Move Count", 5, 0.0, 0.05));
    attr.push(new Attribute(this, "Paralyze", 0, 0.0, 0.001));
    attr.push(new Attribute(this, "Poison", 0, 0.0, 0.001));
    attr.push(new Attribute(this, "Entangle", 0, 0.0, 0.001));
    attr.push(new Attribute(this, "Burn", 0, 0.0, 0.001));
    return attr;
  }

  addAttribute(att, count) {
    let possibleLevels = Math.min(count, this.skillPoints);
    this.attr[att].addSkillLevel(possibleLevels);
    this.skillPoints -= possibleLevels;
  }

  removeAttribute(att, count) {
    let possibleLevels = Math.min(count, this.attr[att].skillLevel);
    this.attr[att].addSkillLevel(-possibleLevels);
    this.skillPoints += possibleLevels;
  }

  inViewRange(other) {
    let viewRange = this.attr[AttrIDs.Sight].total;
    let xPos = this.position.x - floor(viewRange / 2);
    let yPos = this.position.y - floor(viewRange / 2);
    return (other.position.x >= xPos &&
      other.position.x < xPos + viewRange &&
      other.position.y >= yPos &&
      other.position.y < yPos + viewRange);
  }

  checkDeath() {
    return this.attr[AttrIDs.Hitpoint].current <= 0;
  }

  activatedTrap() {
    this.attr[AttrIDs.Hitpoint].current *= 0.9;
  }

  hasHitpointsBelow(val) {
    return this.attr[AttrIDs.Hitpoint].current < val * this.attr[AttrIDs.Hitpoint].total;
  }

  hasDodgedAttack(other) {
    if (this.attr[AttrIDs.Evasion].total > other.attr[AttrIDs.Accuracy].total) {
      let r = random() * 100;
      let b = r < GlobalChance.Evade;
      return b;
    }
    return false;
  }

  checkParalyze() {
    if (this.statusEffects[StatEffIDs.Paralyze].curr) {
      this.statusEffects[StatEffIDs.Paralyze].stacks--;
      if (random() < 0.01) this.statusEffects[StatEffIDs.Paralyze].stacks = 0;
      this.statusEffects[StatEffIDs.Paralyze].curr = this.statusEffects[StatEffIDs.Paralyze].stacks > 0;
      return this.statusEffects[StatEffIDs.Paralyze].curr;
    } else {
      this.statusEffects[StatEffIDs.Paralyze].stacks = 0;
      return false;
    }
  }

  applyPoison() {
    this.updateHP(-1 * this.statusEffects[StatEffIDs.Poison].stacks);
    return this.statusEffects[StatEffIDs.Dead].curr;
  }

  checkPoison() {
    if (this.statusEffects[StatEffIDs.Poison].curr) {
      this.statusEffects[StatEffIDs.Poison].stacks--;
      this.statusEffects[StatEffIDs.Poison].curr = this.statusEffects[StatEffIDs.Poison].stacks > 0;
      return this.statusEffects[StatEffIDs.Poison].curr;
    } else {
      this.statusEffects[StatEffIDs.Poison].stacks = 0;
      return false;
    }
  }

  checkEntanglement() {
    if (this.statusEffects[StatEffIDs.Entangle].curr) {
      this.statusEffects[StatEffIDs.Entangle].curr = false;
      return true;
    } else {
      return false;
    }
  }

  applyBurn() {
    this.updateHP(-1 * this.statusEffects[StatEffIDs.Burn].stacks);
    return this.statusEffects[StatEffIDs.Dead].curr;
  }

  checkBurn() {
    if (this.statusEffects[StatEffIDs.Burn].curr) {
      this.statusEffects[StatEffIDs.Burn].stacks--;
      this.statusEffects[StatEffIDs.Burn].curr = this.statusEffects[StatEffIDs.Burn].stacks > 0;
      return this.statusEffects[StatEffIDs.Burn].curr;
    } else {
      this.statusEffects[StatEffIDs.Burn].stacks = 0;
      return false;
    }
  }

  poison() {
    this.statusEffects[StatEffIDs.Poison].curr = true;
    this.statusEffects[StatEffIDs.Poison].stacks++;
    mainWindow.subMenus[SubMenu.Field].ch[1].subActions[ActionScreen.Combat].ch[1].ch[this.lastActionID].setText(["Poisoned"]);
  }

  paralyze() {
    if (this.statusEffects[StatEffIDs.Paralyze].curr) return;
    mainWindow.subMenus[SubMenu.Field].ch[1].subActions[ActionScreen.Combat].ch[1].ch[this.lastActionID].setText(["Paralyzed"]);
    this.statusEffects[StatEffIDs.Paralyze].curr = true;
    this.statusEffects[StatEffIDs.Paralyze].stacks = 5;
  }

  entangle() {
    if (this.statusEffects[StatEffIDs.Entangle].curr) return;
    mainWindow.subMenus[SubMenu.Field].ch[1].subActions[ActionScreen.Combat].ch[1].ch[this.lastActionID].setText(["Entangled"]);
    this.statusEffects[StatEffIDs.Entangle].curr = true;
  }

  burn() {
    mainWindow.subMenus[SubMenu.Field].ch[1].subActions[ActionScreen.Combat].ch[1].ch[this.lastActionID].setText(["Burned"]);
    this.statusEffects[StatEffIDs.Burn].curr = true;
    this.statusEffects[StatEffIDs.Burn].stacks += 3;
  }

  simpleAttack(other) {
    let minDmg = this.attr[AttrIDs.Damage].total * this.damageRange.min,
      maxDmg = this.attr[AttrIDs.Damage].total * this.damageRange.max;
    let dmg = minDmg + Math.random() * (maxDmg - minDmg);
    if (!other.hasHitpointsBelow(0)) {
      console.log("Ouch " + this.constructor.name);
      if (other.hasDodgedAttack(this)) {
        mainWindow.subMenus[SubMenu.Field].ch[1].subActions[ActionScreen.Combat].ch[1].ch[this.lastActionID].setText(["Missed Attack"]);
        return;
      }
      if (this.attr[AttrIDs.Paralyze].total > 0) {
        let r = Math.random();
        if (r < this.attr[AttrIDs.Paralyze].total) {
          other.paralyze();
        }
      }
      if (this.attr[AttrIDs.Poison].total > 0) {
        let r = Math.random();
        if (r < this.attr[AttrIDs.Poison].total) {
          other.poison();
        }
      }
      if (this.attr[AttrIDs.SpiderWeb].total > 0) {
        let r = Math.random();
        if (r < this.attr[AttrIDs.SpiderWeb].total) {
          other.entangle();
        }
      }
      if (this.attr[AttrIDs.Burn].total > 0) {
        let r = Math.random();
        if (r < this.attr[AttrIDs.Burn].total) {
          other.burn();
        }
      }
      other.updateHP(-dmg);
    }
  }

  attack(other) {
    if (this.applyBurn()) return;
    if (this.applyPoison()) return;
    if (this.checkParalyze()) return;
    if (this.checkEntanglement()) return;
    this.attr[AttrIDs.Energy].current = constrain(this.attr[AttrIDs.Energy].current - ActionCost.NormalAction, 0, this.attr[AttrIDs.Energy].total);
    mainWindow.subMenus[SubMenu.Field].ch[1].subActions[ActionScreen.Combat].ch[1].ch[this.lastActionID].setText(["Normal Attack"]);
    this.simpleAttack(other);
  }

  quickAttack(other) {
    if (this.applyBurn()) return;
    if (this.applyPoison()) return;
    if (this.checkParalyze()) return;
    if (this.checkEntanglement()) return;
    this.attr[AttrIDs.Energy].current = constrain(this.attr[AttrIDs.Energy].current - ActionCost.QuickAction, 0, this.attr[AttrIDs.Energy].total);
    mainWindow.subMenus[SubMenu.Field].ch[1].subActions[ActionScreen.Combat].ch[1].ch[this.lastActionID].setText(["Quick Attack"]);
    let r = ~~(Math.random() * 3) + 1;
    for (let i = 0; i < r; i++) {
      if (other.statusEffects[StatEffIDs.Dead].curr) return;
      this.simpleAttack(other);
    }
  }

  heal(other) {
    if (this.applyBurn()) return;
    if (this.checkPoison()) return;
    if (this.checkParalyze()) return;
    this.attr[AttrIDs.Energy].current = constrain(this.attr[AttrIDs.Energy].current - ActionCost.HealAction, 0, this.attr[AttrIDs.Energy].total);
    mainWindow.subMenus[SubMenu.Field].ch[1].subActions[ActionScreen.Combat].ch[1].ch[this.lastActionID].setText(["Heal"]);
    let minHeal = this.attr[AttrIDs.Damage].total * this.healRange.min,
      maxHeal = this.attr[AttrIDs.Damage].total * this.healRange.max;
    let heal = minHeal + Math.random() * (maxHeal - minHeal);
    this.updateHP(heal);
  }

  wait() {
    if (this.applyBurn()) return;
    if (this.checkParalyze()) return;
    if (this.applyPoison()) return;
    this.attr[AttrIDs.Energy].current = constrain(this.attr[AttrIDs.Energy].current - ActionCost.WaitAction, 0, this.attr[AttrIDs.Energy].total);
    mainWindow.subMenus[SubMenu.Field].ch[1].subActions[ActionScreen.Combat].ch[1].ch[this.lastActionID].setText(["Waiting"]);
  }

  addExperience(other) {
    this.experience += other.expReward * this.attr[AttrIDs.Experience].total;
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
}