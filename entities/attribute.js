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

  getBaseValue() {
    return this.baseValue;
  }

  setStats(arr) {
    if (arr[0]) this.base = arr[0];
    if (arr[1]) this.current = arr[1];
    if (arr[2]) this.total = arr[2];
  }

  getTotal() {
    this.calculateTotal();
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

let StatEffIDs = {
  Dead: 0,
  Paralyze: 1,
  Poison: 2,
  Entangle: 3,
  Burn: 4
}

class StatusEffect {
  constructor(parent, name, immune = false) {
    this.parent = parent;
    this.name = name;
    this.curr = false;
    this.immune = false;
    this.stacks = 0;
  }

  getCurrentAsInt() {
    return int(this.curr);
  }

  getStackCount() {
    return this.stacks;
  }
  
  setStats(arr) {
    
    if (arr[0]) this.curr = boolean(arr[0]);
    if (arr[1]) this.stacks = arr[1];
    if (arr[2]) this.immune = boolean(arr[2]);
  }

  getImmunityAsInt() {
    return int(this.immune);
  }
}
