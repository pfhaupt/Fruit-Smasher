class Player {
  constructor(h = 100, d = 2, r = 0.25, s = 2) {
    this.position = {
      x: 5,
      y: 5,
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
      maxEP: {
        name: "Energy",
        fromLevel: h,
        skillLevel: 0,
        boostPerSkillLevel: 5,
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
      sight: {
        name: "Sight",
        fromLevel: 15,
        skillLevel: 0,
        boostPerSkillLevel: 0.1,
        fromSkill: 0,
        total: 0,
      },
    };

    this.chestCount = [];
    for (var i = 0; i < 4 * maxZone; i++) this.chestCount[i] = 0;

    this.hp = h;
    this.ep = this.attributes.maxEP.total;
    this.calculateTotalAttributes();
  }

  checkDeath() {
    return this.hp <= 0;
  }

  inViewRange(enemy) {
    let viewRange = this.attributes.sight.total;
    let xPos = this.position.x - floor(viewRange / 2);
    let yPos = this.position.y - floor(viewRange / 2);
    return (enemy.position.x >= xPos &&
      enemy.position.x < xPos + viewRange &&
      enemy.position.y >= yPos &&
      enemy.position.y < yPos + viewRange);
  }

  checkMovement(keyCode) {
    let map = mainWindow.currentSubMenu.children[0].children[0];
    let minimap = mainWindow.currentSubMenu.children[0].children[1];
    let prevX = player.position.x;
    let prevY = player.position.y;
    let dir = {
      x: 0,
      y: 0
    };
    switch (keyCode) {
      case 37: //LEFT ARROW
        dir.x--;
        break;
      case 38: //UP ARROW
        dir.y--;
        break;
      case 39: //RIGHT ARROW
        dir.x++;
        break;
      case 40: //DOWN ARROW
        dir.y++;
        break;
      default:
        return;
    }
    //Calculate target position
    let newX = prevX + dir.x;
    let newY = prevY + dir.y;

    //Can we move there?
    let targetIDs = map.getIDs(newX, newY);
    if (targetIDs.tID === 2) {
      //Can't move on water
      return;
    } else if (targetIDs.eID !== 0) {
      //Interact with Entity on Target position
      return;
    }
    //Set Player on Map
    map.tiles[prevX][prevY].setEntity(0);
    map.tiles[newX][newY].setEntity(7);
    //Set Player on Minimap
    minimap.updatePixels(prevX, prevY);
    minimap.updatePixels(newX, newY);
    //Set Player in Cache
    map.updateCacheMap(prevX, prevY, 0);
    map.updateCacheMap(newX, newY, 7);
    //Update Cache
    map.updateImages(dir.x, dir.y);
    //Update real Player pos
    player.position.x = newX;
    player.position.y = newY;
    mainWindow.currentSubMenu.displayOnce();
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

  addExperience(enemy) {
    this.experience += enemy.experience * this.attributes.expBoost.total;
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

  checkChestDrop(enemy) {
    if (random(1) < 0.25) {
      let z = floor(enemy.level / 10);
      let l = floor(enemy.level % 10);
      this.addChest(z, l);
    }
  }

  addChest(zone, level) {
    let chestLevel = floor(level / 2) - 1;
    if (chestLevel === -1) return;
    this.chestCount[4 * zone + chestLevel]++;
  }

  openChests(chestLevel) {
    console.log(chestLevel);
  }
}


/*
linear exp increase per level
-----------------------------

a(n+1) = a(n) + d

von level 5 bis level 7 = total(7) - total(5)

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

a(n+1) = a(n) * q

function levelsFromGivenXP(xp, currentLevel) {
  var bruch = xp * log(i) / b;
  var expr = bruch + pow(i, currentLevel);
  return floor(log(expr)/log(i));
}
*/
