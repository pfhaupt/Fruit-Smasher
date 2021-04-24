class ActionOverview extends MenuTemplate {
  constructor(n, x, y, w, h, col) {
    super(n, x, y, w, h, col);
    this.subActions = [];
    this.subActions.push(new CombatAction("Combat", 0, 0, 1, 1, col));
    this.subActions.push(new ChestAction("Looting", 0, 0, 1, 1, col));
    this.currentAction = this.subActions[0];
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
let currentlyFightingEnemy;
class CombatAction extends Action {
  constructor(n, x, y, w, h) {
    super(n, x, y, w, h);
    //Title
    this.children.push(new Text(["Currently Fighting ", "currentlyFightingEnemy.typeID"], 0, 0, 1, 0.1, 'center', false));
    //Player Stuff
    this.children.push(new CustomImage(entityList[7], 0.125, 0.1, 0.25, 0.25, 1));
    this.children.push(new ProgressBar("player.hp", "player.attributes.maxHP.total", color(34, 204, 0), 0.05, 0.37, 0.4, 0.03));
    this.children.push(new ProgressBar("player.ep", "player.attributes.maxEP.total", color(102, 102, 255), 0.05, 0.4, 0.4, 0.03));
    //General Stuff
    this.children.push(new Text(["vs."], 0.4, 0.175, 0.2, 0.1, 'center', false));
    this.children.push(new Text(["HP"], 0.45, 0.37, 0.1, 0.03));
    this.children.push(new Text(["EP"], 0.45, 0.4, 0.1, 0.03));

    //Enemy Stuff
    this.children.push(new CustomImage(entityList[1], 0.625, 0.1, 0.25, 0.25, 1));
    this.children.push(new ProgressBar("currentlyFightingEnemy.hp", "currentlyFightingEnemy.maxHP", color(34, 204, 0), 0.55, 0.37, 0.4, 0.03));
    this.children.push(new ProgressBar("currentlyFightingEnemy.ep", "currentlyFightingEnemy.maxEP", color(102, 102, 255), 0.55, 0.4, 0.4, 0.03));

    this.children.push(new Button("Attack Enemy", 0.05, 0.5, 0.3, 0.05, () => {
      console.log("EY")
    }));
    this.children.push(new Text(["This Button will do some fancy things in the future!"], 0.35, 0.5, 0.65, 0.05));
    this.children.push(new Button("Heal yourself", 0.05, 0.6, 0.3, 0.05, () => {
      console.log("EY")
    }));
    this.children.push(new Text(["This Button will do some fancy things in the future!"], 0.35, 0.6, 0.65, 0.05));
    this.children.push(new Button("Do nothing", 0.05, 0.7, 0.3, 0.05, () => {
      console.log("EY")
    }));
    this.children.push(new Text(["This Button will do some fancy things in the future!"], 0.35, 0.7, 0.65, 0.05));
    this.children.push(new Button("Attempt to flee", 0.05, 0.8, 0.3, 0.05, () => {
      console.log("EY")
    }));
    this.children.push(new Text(["This Button will do some fancy things in the future!"], 0.35, 0.8, 0.65, 0.05));
  }
}

class ChestAction extends Action {
  constructor(n, x, y, w, h) {
    super(n, x, y, w, h);
  }
}
