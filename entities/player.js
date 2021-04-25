class Player extends Deity {
  constructor(h = 100, d = 2, r = 0.25, s = 2) {
    super(h, d, r, s);

    this.chestCount = [];
    for (var i = 0; i < 4 * maxZone; i++) this.chestCount[i] = 0;
  }

  checkMovement(keyCode) {
    if (this.attributes.moveCount.current === 0) return;
    let map = mainWindow.currentSubMenu.children[0].children[0];
    let minimap = mainWindow.currentSubMenu.children[0].children[1];
    let action = mainWindow.currentSubMenu.children[1];
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
    if (targetIDs.tID === 2) {
      //Can't move on water
      return;
    } else if (targetIDs.eID !== 0) {
      //Interact with Entity on Target position
      if (targetIDs.eID >= 1 && targetIDs.eID <= 3) {
        //Target contains an enemy
        //Find out which enemy
        let id = (newX * 1000 + newY);
        let targetEnemy = enemies.get(id);
        console.log(targetEnemy);
        if (targetEnemy) {
          action.subActions[ActionScreen.Combat].setEnemy(targetEnemy);
          action.setAction(ActionScreen.Combat);
        }
      } else if (targetIDs.eID === 4) {
        //Target is a key
      } else {
        console.log(targetIDs.eID);
      }
      return;
    }
    this.attributes.moveCount.current--;
    action.setAction(ActionScreen.Idle);

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
    this.position.x = newX;
    this.position.y = newY;
    mainWindow.currentSubMenu.displayOnce();
  }

  die() {
    let action = mainWindow.subMenus[0].children[1];
    console.log("You died");
    action.setAction(ActionScreen.Defeat);
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
