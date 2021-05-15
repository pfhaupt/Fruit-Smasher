class Player extends Deity {
  constructor() {
    super();
    this.lastActionID = 8;
    this.chestCount = [];
    for (var i = 0; i < 4 * maxZone; i++) this.chestCount[i] = 0;
  }

  checkMovement(keyCode) {
    if (this.attr[AttrIDs.MoveCount].current === 0) return;
    let map = mainWindow.subMenus[SubMenu.Field].ch[0].ch[0];
    let minimap = mainWindow.subMenus[SubMenu.Field].ch[0].ch[1];
    let action = mainWindow.subMenus[SubMenu.Field].ch[1];
    if (action.getCurrentAction() === "Combat") return;

    if (this.applyBurn()) {
      this.die();
      return;
    }

    let prevX = this.position.x;
    let prevY = this.position.y;
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
    if (targetIDs.tID === TextureIDs.Water) {
      //Can't move on water
      return;
    } else if (targetIDs.eID !== EntityIDs.None) {
      //Interact with Entity on Target position

      if (targetIDs.eID >= 1 && targetIDs.eID <= 7) {
        //Target contains an enemy
        //Find out which enemy

        let targetEnemy = map.getEnemyAtPosition(newX, newY);

        //console.log(targetEnemy);
        if (targetEnemy) {
          action.subActions[ActionScreen.Combat].setEnemy(targetEnemy);
          action.setAction(ActionScreen.Combat);
        }
      } else if (targetIDs.eID === EntityIDs.Key) {
        //Target is a key
      } else if (targetIDs.eID === EntityIDs.Trap) {
        //You just walked on top of a trap, nice.
        let targetEnemy = map.getEnemyAtPosition(newX, newY);
        console.log(targetEnemy);
        if (targetEnemy) {
          player.activatedTrap();
          targetEnemy.die();
        }
      } else {
        console.log(targetIDs.eID);
      }
      return;
    }
    this.attr[AttrIDs.MoveCount].current--;
    action.setAction(ActionScreen.Idle);

    //Set Player on Map
    map.tiles[prevX][prevY].setEntity(EntityIDs.None);
    map.tiles[newX][newY].setEntity(EntityIDs.Player);
    //Set Player on Minimap
    minimap.updatePixels(prevX, prevY);
    minimap.updatePixels(newX, newY);
    //Set Player in Cache
    map.updateCacheMap(prevX, prevY, EntityIDs.None);
    map.updateCacheMap(newX, newY, EntityIDs.Player);
    //Update Cache
    map.updateImages(dir.x, dir.y);
    //Update real Player pos
    this.position.x = newX;
    this.position.y = newY;
    mainWindow.currentSubMenu.displayOnce();
  }

  die() {
    let action = mainWindow.subMenus[SubMenu.Field].ch[1];
    action.setAction(ActionScreen.Defeat);
  }

  revive() {
    for (let att of this.attr) {
      att.calculateTotal();
      att.resetCurrent();
    }
    this.statusEffects.dead.curr = false;
    mainWindow.displayOnce();
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

  flee(other) {
    if (this.applyBurn()) return;
    if (this.applyPoison()) return;
    this.attr[AttrIDs.Energy].current = constrain(this.attr[AttrIDs.Energy].current - ActionCost.FleeAction, 0, this.attr[AttrIDs.Energy].total);
    mainWindow.subMenus[SubMenu.Field].ch[1].subActions[ActionScreen.Combat].ch[1].ch[this.lastActionID].setText(["Attempted to flee."]);
    let fleeChance = getFleeChance(player, other);
    if (this.checkParalyze()) fleeChance *= 0.5;
    if (this.checkEntanglement()) fleeChance = 0.0;
    if (random() < fleeChance) mainWindow.subMenus[SubMenu.Field].ch[1].setAction(ActionScreen.PlayedFled);
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
