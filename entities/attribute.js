let AttrIDs = {
  Damage: 0,
  Energy: 1,
  Hitpoint: 2,
  Regen: 3,
  Speed: 4,
  Accuracy: 5,
  Evasion: 6,
  Experience: 7,
  Sight: 8,
  MoveCount: 9,
  Paralyze: 10,
  Poison: 11,
  SpiderWeb: 12,
  Burn: 13,
};

class Attribute {
  constructor(par, name, def, perLevel, perSkill) {
    this.parent = par;
    this.name = name;
    this.baseValue = def;
    this.boostPerLevel = perLevel;
    this.fromLevel = 0;
    this.skillLevel = 0;
    this.boostPerSkillLevel = perSkill;
    this.fromSkill = 0;
    this.current = 0;
    this.total = 0;
    this.calculateTotal(0);
    this.resetCurrent();
  }

  getTotal() {
    return this.total;
  }

  getCurrent() {
    return this.current;
  }

  calculateTotal() {
    this.calculateLevelBoost();
    this.calculateSkillBoost();
    this.total = this.baseValue + this.fromLevel + this.fromSkill;
  }

  resetCurrent() {
    this.current = this.total;
  }

  addSkillLevel(level) {
    this.skillLevel += level;
    this.calculateTotal();
  }

  calculateLevelBoost() {
    this.fromLevel = this.boostPerLevel * this.parent.level;
  }

  calculateSkillBoost() {
    this.fromSkill = this.boostPerSkillLevel * this.skillLevel;
  }
}
