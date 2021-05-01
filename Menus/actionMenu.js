let ActionScreen = {
  Idle: 0,
  Combat: 1,
  Victory: 2,
  Defeat: 3,
  Chest: 4
};

class ActionOverview extends MenuTemplate {
  constructor(n, x, y, w, h) {
    super(n, x, y, w, h);
    this.subActions = [];
    this.subActions.push(new IdleAction("Idle", 0, 0, 1, 1));
    this.subActions.push(new CombatAction("Combat", 0, 0, 1, 1));
    this.subActions.push(new VictoryAction("Victory", 0, 0, 1, 1));
    this.subActions.push(new DefeatAction("Defeat", 0, 0, 1, 1));
    this.subActions.push(new ChestAction("Looting", 0, 0, 1, 1));
    this.currentAction = this.subActions[ActionScreen.Idle];
  }

  displayEveryFrame() {
    this.currentAction.displayEveryFrame();
  }

  displayOnce() {
    this.currentAction.displayOnce();
  }

  resize(parentXAbs, parentYAbs, parentWAbs, parentHAbs) {
    super.resize(parentXAbs, parentYAbs, parentWAbs, parentHAbs);
    this.currentAction.resize(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
  }

  setAction(id) {
    this.currentAction.hide();
    this.currentAction = this.subActions[id];
    this.currentAction.show();
    mainWindow.resize();
    mainWindow.displayOnce();
  }

  show() {
    this.currentAction.show();
  }

  hide() {
    this.currentAction.hide();
  }
}

class Action extends MenuTemplate {
  constructor(n, x, y, w, h) {
    super(n, x, y, w, h);
  }
}

class IdleAction extends Action {
  constructor(n, x, y, w, h) {
    super(n, x, y, w, h);
    this.children.push(new Text(["Nothing going on here ¯\\_(ツ)_/¯"], 0, 0, 1, 1));
  }
}

let currentlyFightingEnemy;
class CombatAction extends Action {
  constructor(n, x, y, w, h) {
    super(n, x, y, w, h);
    //Title
    this.children.push(new Text(["Currently Fighting ", "\"", "currentlyFightingEnemy.name", "\""], 0, 0, 1, 0.1, 'center', false));
    //Player Stuff
    this.children.push(new CustomImage(entityList[7], 0.125, 0.1, 0.25, 0.25, 1));
    this.children.push(new ProgressBar("player.attributes.hitpoints.current", "player.attributes.hitpoints.total", color(34, 204, 0), 0.05, 0.37, 0.4, 0.03));
    this.children.push(new ProgressBar("player.attributes.enerpoints.current", "player.attributes.enerpoints.total", color(102, 102, 255), 0.05, 0.4, 0.4, 0.03));
    this.children.push(new Text(["player.attributes.damage.total"], 0.05, 0.45, 0.4, 0.03));
    //General Stuff
    this.children.push(new Text(["vs."], 0.4, 0.175, 0.2, 0.1, 'center', false));
    this.children.push(new Text(["HP"], 0.45, 0.37, 0.1, 0.03));
    this.children.push(new Text(["EP"], 0.45, 0.4, 0.1, 0.03));
    this.children.push(new Text(["AVG DMG"], 0.45, 0.45, 0.1, 0.03));

    //Enemy Stuff
    this.children.push(new CustomImage(entityList[3], 0.625, 0.1, 0.25, 0.25, 1));
    this.children.push(new ProgressBar("currentlyFightingEnemy.attributes.hitpoints.current", "currentlyFightingEnemy.attributes.hitpoints.total", color(34, 204, 0), 0.55, 0.37, 0.4, 0.03));
    this.children.push(new ProgressBar("currentlyFightingEnemy.attributes.enerpoints.current", "currentlyFightingEnemy.attributes.enerpoints.total", color(102, 102, 255), 0.55, 0.4, 0.4, 0.03));
    this.children.push(new Text(["currentlyFightingEnemy.attributes.damage.total"], 0.55, 0.45, 0.4, 0.03));


    //Actions
    this.children.push(new ActionBlockGroup("FightGroup", 0, 0.5, 1, 0.5));
  }

  setEnemy(enemy) {
    currentlyFightingEnemy = enemy;
    //Set the new Enemy Image
    let enemyImageID = 9;
    let enemyImg = this.children[enemyImageID];
    this.children[enemyImageID].content.elt.remove();
    this.children[enemyImageID] = new CustomImage(entityList[currentlyFightingEnemy.typeID],
      enemyImg.xRelToParent, enemyImg.yRelToParent, enemyImg.wRelToParent, enemyImg.hRelToParent);
    this.children[enemyImageID].resize(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
    this.children[enemyImageID].show();
  }
}

class ActionBlockGroup extends MenuTemplate {
  constructor(n, x, y, w, h) {
    super(n, x, y, w, h);
    this.children.push(new UICollection("NormalAction", 0, 0, 1, 0,
      [
        [Button, "Attack (1 EP)", () => {
          player.attack(currentlyFightingEnemy);
          mainWindow.currentSubMenu.children[1].displayOnce();
          enemy.performRandomAction(player);
          mainWindow.currentSubMenu.children[1].displayOnce();
        }],
        [Text, ["Attack the enemy for ", "player.attributes.damage.total * player.damageRange.min", " to ", "player.attributes.damage.total * player.damageRange.max", " damage points"]],
        [Text, ["This is another text!"]]
      ],
      [
        [1, 3],
        [1, 2]
      ], 0.025));
    this.children.push(new UICollection("QuickAction", 0, 0, 1, 0,
      [
        [Button, "Quick Tap (20 EP)", () => {
          let r = ~~(Math.random() * 3) + 1;
          console.log(r);
          for (let i = 0; i < r; i++) player.attack(currentlyFightingEnemy);
          mainWindow.currentSubMenu.children[1].displayOnce();
          enemy.performRandomAction(player);
          mainWindow.currentSubMenu.children[1].displayOnce();
        }],
        [Text, ["Attack the enemy up to 3 times at once!"]],
        [Text, ["This is another text!"]]
      ],
      [
        [1, 3],
        [1, 2]
      ], 0.025));
    this.children.push(new UICollection("HealAction", 0, 0, 1, 0,
      [
        [Button, "Heal (2 EP)", () => {
          player.heal();
          mainWindow.currentSubMenu.children[1].displayOnce();
          enemy.performRandomAction(player);
          mainWindow.currentSubMenu.children[1].displayOnce();
        }],
        [Text, ["Heal yourself for ", "player.attributes.damage.total * player.healRange.min", " to ", "player.attributes.damage.total * player.healRange.max", " hitpoints"]],
        [Text, ["This is another text!"]]
      ],
      [
        [1, 3],
        [1, 2]
      ], 0.025));
      /*
    this.children.push(new ActionBlock("WaitAction", 0, 0, 1, 0,
      "Wait (5 EP)", () => {
        player.wait();
        mainWindow.currentSubMenu.children[1].displayOnce();
        enemy.performRandomAction(player);
        mainWindow.currentSubMenu.children[1].displayOnce();
      },
      ["Wait a round and deal ", "50%", " more damage in the next turn!"],
      []
    ));
    this.children.push(new ActionBlock("FleeAction", 0, 0, 1, 0,
      "Run away (1 EP)", () => {
        player.flee(currentlyFightingEnemy);
        mainWindow.currentSubMenu.children[1].displayOnce();
        enemy.performRandomAction(player);
        mainWindow.currentSubMenu.children[1].displayOnce();
      },
      ["Attempt to flee the battle. Chance to flee: ", "getFleeChance(player, currentlyFightingEnemy) * 100", "%"],
      []
    ));
    */
    let h1 = 1 / this.children.length;
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].yRelToParent = h1 * i;
      this.children[i].hRelToParent = h1;
    }
  }
}

class VictoryAction extends Action {
  constructor(n, x, y, w, h) {
    super(n, x, y, w, h);
  }
}

class DefeatAction extends Action {
  constructor(n, x, y, w, h) {
    super(n, x, y, w, h);
    this.children.push(new Text(["LMAO you suck, get good"], 0, 0, 1, 1));
  }
}

class ChestAction extends Action {
  constructor(n, x, y, w, h) {
    super(n, x, y, w, h);
  }
}
