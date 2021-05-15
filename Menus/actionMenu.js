let ActionScreen = {
  Idle: 0,
  Combat: 1,
  Victory: 2,
  Defeat: 3,
  Chest: 4,
  PlayedFled: 5,
  EnemyFled: 6,
  Trap: 7
};

let ActionCost = {
  NormalAction: 1,
  QuickAction: 5,
  HealAction: 3,
  WaitAction: 3,
  FleeAction: 1
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
    this.subActions.push(new PlayerFleeAction("PlayerFled", 0, 0, 1, 1));
    this.subActions.push(new EnemyFleeAction("EnemyFled", 0, 0, 1, 1));
    this.subActions.push(new TrapAction("TrapActivated", 0, 0, 1, 1));
    this.currentAction = this.subActions[ActionScreen.Idle];
  }

  hide() {
    this.hidden = true;
    this.currentAction.hide();
  }

  show() {
    this.hidden = false;
    this.currentAction.show();
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
    if (id !== ActionScreen.Combat && id !== ActionScreen.Victory) currentlyFightingEnemy = null;
    this.currentAction.hide();
    this.currentAction = this.subActions[id];
    this.currentAction.show();
    mainWindow.resize();
    mainWindow.displayOnce();
  }

  getCurrentAction() {
    return this.currentAction.name;
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
    this.ch.push(new Text(["Nothing going on here ¯\\_(ツ)_/¯"], 0, 0, 1, 0.1));

    this.ch.push(new UICollection("StatusOverview", 0, 0.1, 1, 0.1, [
      [CustomImage, "images/statusEffects/StatusBurning.png", 1],
      [Text, ["player.statusEffects.burning.stacks", "x"]],
      [CustomImage, "images/statusEffects/StatusParalyzed.png", 1],
      [Text, ["player.statusEffects.paralyzed.stacks", "x"]],
      [CustomImage, "images/statusEffects/StatusEntangled.png", 1],
      [Text, ["player.statusEffects.entangled.curr"]],
      [CustomImage, "images/statusEffects/StatusPoisoned.png", 1],
      [Text, ["player.statusEffects.poisoned.stacks", "x"]]
    ], [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [
        [1],
        [1],
        [1],
        [1],
        [1],
        [1],
        [1],
        [1],
      ]
    ]));
    for (let i = 1; i < this.ch[1].ch.length; i += 2) {
      this.ch[1].ch[i].format = false;
    }

    this.ch.push(new Text(["This leads to the following effects:"], 0, 0.2, 1, 0.025));

    this.ch.push(new UICollection("Legend", 0, 0.225, 1, 0.15, [
      [Text, ["player.statusEffects.burning.stacks", " burn damage received per move."]],
      [SwapableText, [
        ["You are paralyzed! ", "You can't do anything for ", "player.statusEffects.paralyzed.stacks", " moves."],
        ["You are not paralyzed! ", "You can freely move around."]
      ]],
      [SwapableText, [
        ["You are entangled! ", "You can't do anything!"],
        ["You are not entangled! ", " You can freely move around."]
      ]],
      [Text, ["player.statusEffects.poisoned.stacks", " poison damage received per move."]],
      [EmptyElement],
      [Text, ["Note: ", "The effects of Paralyze and Entangle can stack."]]
    ], [
      [1],
      [
        [1, 1, 1, 1, 0.25, 0.75]
      ]
    ]));
    this.ch[3].ch[1].format = false;
    this.ch[3].ch[2].format = false;

    this.ch.push(new Button("End Round", 0.3, 0.8, 0.4, 0.1, endRound));
  }

  displayOnce() {
    this.ch[3].ch[1].setText(1 - int(player.statusEffects.paralyzed.curr));
    this.ch[3].ch[2].setText(1 - int(player.statusEffects.entangled.curr));
    super.displayOnce();
  }
}

let currentlyFightingEnemy;
class CombatAction extends Action {
  constructor(n, x, y, w, h) {
    super(n, x, y, w, h);
    //Title
    this.ch.push(new Text(["Currently Fighting ", "\"", "currentlyFightingEnemy.name", "\""], 0, 0, 1, 0.1, 'center', false));

    //All that display stuff
    let emptySpace = 0.15;
    this.ch.push(new UICollection("CombatDisplay", 0, 0.1, 1, 0.4, [
        [CustomImage, entityList[EntityIDs.Player], 1],
        [EmptyElement],
        [ProgressBar, "player.attr[AttrIDs.Hitpoint].current", "player.attr[AttrIDs.Hitpoint].total", color(34, 204, 0)],
        [EmptyElement],
        [ProgressBar, "player.attr[AttrIDs.Energy].current", "player.attr[AttrIDs.Energy].total", color(102, 102, 255)],
        [EmptyElement],
        [Text, ["player.attr[AttrIDs.Damage].total"]],
        [EmptyElement],
        [Text, ["player.lastAction"]],
        [EmptyElement],
        [Text, ["vs."]],
        [EmptyElement],
        [Text, ["HP"]],
        [EmptyElement],
        [Text, ["EP"]],
        [EmptyElement],
        [Text, ["AVG DMG"]],
        [EmptyElement],
        [Text, ["Last Action"]],
        [EmptyElement],
        [CustomImage, entityList[3]],
        [EmptyElement],
        [ProgressBar, "currentlyFightingEnemy.attr[AttrIDs.Hitpoint].current", "currentlyFightingEnemy.attr[AttrIDs.Hitpoint].total", color(34, 204, 0)],
        [EmptyElement],
        [ProgressBar, "currentlyFightingEnemy.attr[AttrIDs.Energy].current", "currentlyFightingEnemy.attr[AttrIDs.Energy].total", color(102, 102, 255)],
        [EmptyElement],
        [Text, ["currentlyFightingEnemy.attr[AttrIDs.Damage].total"]],
        [EmptyElement],
        [Text, ["currentlyFightingEnemy.lastAction"]],
        [EmptyElement]
      ],
      [
        [3, 1.5, 3],
        [
          [5, emptySpace, 1, emptySpace, 1, emptySpace, 1, emptySpace, 1, emptySpace],
          [5, emptySpace, 1, emptySpace, 1, emptySpace, 1, emptySpace, 1, emptySpace],
          [5, emptySpace, 1, emptySpace, 1, emptySpace, 1, emptySpace, 1, emptySpace]
        ]
      ],
      [0.0, 0.0]));
    //Actions
    this.ch.push(new ActionBlockGroup("FightGroup", 0, 0.5, 1, 0.5));
  }

  setEnemy(enemy) {
    currentlyFightingEnemy = enemy;
    //Set the new Enemy Image
    let enemyImageID = 20;
    let enemyImg = this.ch[1].ch[enemyImageID];
    this.ch[1].ch[enemyImageID].content.elt.remove();
    this.ch[1].ch[enemyImageID] = new CustomImage(entityList[EntityIDs[currentlyFightingEnemy.constructor.name]],
      enemyImg.xRelToParent, enemyImg.yRelToParent, enemyImg.wRelToParent, enemyImg.hRelToParent);
    this.ch[1].ch[enemyImageID].resize(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
    this.ch[1].ch[enemyImageID].show();
  }
}

class ActionBlockGroup extends MenuTemplate {
  constructor(n, x, y, w, h) {
    super(n, x, y, w, h);
    let space = 0.1;
    this.ch.push(new UICollection("NormalAction", 0, 0, 1, 0,
      [
        [Button, "Attack (" + ActionCost.NormalAction + " EP)", () => {
          if (player.attr[AttrIDs.Energy].current < ActionCost.NormalAction) {
            return;
          }
          player.attack(currentlyFightingEnemy);
          mainWindow.subMenus[SubMenu.Field].ch[1].displayOnce();
          if (currentlyFightingEnemy)
            currentlyFightingEnemy.performRandomAction(player);
          mainWindow.subMenus[SubMenu.Field].ch[1].displayOnce();
        }],
        [Text, ["Attack the enemy for ", "player.attr[AttrIDs.Damage].total * player.damageRange.min", " to ", "player.attr[AttrIDs.Damage].total * player.damageRange.max", " damage points"]],
        [Text, ["This is another text!"]],
      ],
      [
        [1, 3],
        [
          [1],
          [1, 1]
        ]
      ], [0.0, space]));
    this.ch.push(new UICollection("QuickAction", 0, 0, 1, 0,
      [
        [Button, "Quick Attack (" + ActionCost.QuickAction + " EP)", () => {
          if (player.attr[AttrIDs.Energy].current < ActionCost.QuickAction) {
            return;
          }
          player.quickAttack(currentlyFightingEnemy);
          mainWindow.subMenus[SubMenu.Field].ch[1].displayOnce();
          if (currentlyFightingEnemy)
            currentlyFightingEnemy.performRandomAction(player);
          mainWindow.subMenus[SubMenu.Field].ch[1].displayOnce();
        }],
        [Text, ["Attack the enemy up to 3 times at once!"]],
        [Text, ["This is another text!"]]
      ],
      [
        [1, 3],
        [
          [1],
          [1, 1]
        ]
      ], [0.0, space]));
    this.ch.push(new UICollection("HealAction", 0, 0, 1, 0,
      [
        [Button, "Heal (" + ActionCost.HealAction + " EP)", () => {
          if (player.attr[AttrIDs.Energy].current < ActionCost.HealAction) {
            return;
          }
          player.heal();
          mainWindow.subMenus[SubMenu.Field].ch[1].displayOnce();
          if (currentlyFightingEnemy)
            currentlyFightingEnemy.performRandomAction(player);
          mainWindow.subMenus[SubMenu.Field].ch[1].displayOnce();
        }],
        [Text, ["Heal yourself for ", "player.attr[AttrIDs.Damage].total * player.healRange.min", " to ", "player.attr[AttrIDs.Damage].total * player.healRange.max", " hitpoints"]],
        [Text, ["This is another text!"]]
      ],
      [
        [1, 3],
        [
          [1],
          [1, 1]
        ]
      ], [0.0, space]));
    this.ch.push(new UICollection("WaitAction", 0, 0, 1, 0,
      [
        [Button, "Wait (" + ActionCost.WaitAction + " EP)", () => {
          if (player.attr[AttrIDs.Energy].current < ActionCost.WaitAction) {
            return;
          }
          player.wait();
          mainWindow.subMenus[SubMenu.Field].ch[1].displayOnce();
          if (currentlyFightingEnemy)
            currentlyFightingEnemy.performRandomAction(player);
          mainWindow.subMenus[SubMenu.Field].ch[1].displayOnce();
        }],
        [Text, ["Wait a round and deal ", "50%", " more damage in the next turn!"]],
        [Text, ["This is another text!"]]
      ],
      [
        [1, 3],
        [
          [1],
          [1, 1]
        ]
      ], [0.0, space]));
    this.ch.push(new UICollection("FleeAction", 0, 0, 1, 0,
      [
        [Button, "Run away (" + ActionCost.FleeAction + " EP)", () => {
          if (player.attr[AttrIDs.Energy].current < ActionCost.FleeAction) {
            return;
          }
          player.flee(currentlyFightingEnemy);
          mainWindow.subMenus[SubMenu.Field].ch[1].displayOnce();
          if (currentlyFightingEnemy)
            currentlyFightingEnemy.performRandomAction(player);
          mainWindow.subMenus[SubMenu.Field].ch[1].displayOnce();
        }],
        [Text, ["Attempt to flee the battle. Chance to flee: ", "getFleeChance(player, currentlyFightingEnemy) / (1 + int(player.statusEffects.paralyzed.curr)) * (1 - int(player.statusEffects.entangled.curr)) * 100", "%"]],
        [Text, ["This is based on your HP and the Damage of the Enemy."]],
      ],
      [
        [1, 3],
        [
          [1],
          [1, 1]
        ]
      ], [0.0, space]));

    let h1 = 1 / this.ch.length;
    for (let i = 0; i < this.ch.length; i++) {
      this.ch[i].yRelToParent = h1 * i;
      this.ch[i].hRelToParent = h1;
    }
  }
}

class VictoryAction extends Action {
  constructor(n, x, y, w, h) {
    super(n, x, y, w, h);
    this.ch.push(new CustomImage("images/victory.png", 0, 0, 1, 0.5, 1));
    this.ch.push(new Text(["Hello, you defeated a ", "currentlyFightingEnemy.constructor.name"], 0, 0.5, 1, 0.1));
    this.ch.push(new Text(["You got ", "currentlyFightingEnemy.level", " gold!"], 0, 0.6, 1, 0.1));
  }
}

class DefeatAction extends Action {
  constructor(n, x, y, w, h) {
    super(n, x, y, w, h);
    this.ch.push(new CustomImage("images/PlayerDead.png", 0, 0, 1, 0.5));
    this.ch.push(new UICollection("", 0, 0.5, 1, 0.15, [
      [Text, ["You died!"]],
      [Text, ["How could this happen?"]],
      [Text, ["If you have problems surviving,"]],
      [Text, ["check your equipment loadout or your skills."]],
    ], [
      [1],
      [
        [1, 1, 1, 1]
      ]
    ], [0.0, 0.0]));
    this.ch.push(new Button("Dismiss", 0.3, 0.7, 0.4, 0.1, () => {
      mainWindow.subMenus[SubMenu.Field].ch[1].setAction(ActionScreen.Idle);
      player.revive();
    }));
  }
}

class ChestAction extends Action {
  constructor(n, x, y, w, h) {
    super(n, x, y, w, h);
  }
}

class PlayerFleeAction extends Action {
  constructor(n, x, y, w, h) {
    super(n, x, y, w, h);
    this.ch.push(new CustomImage("images/PlayerEscaped.png", 0, 0, 1, 0.5));
    this.ch.push(new UICollection("", 0, 0.5, 1, 0.15, [
      [Text, ["You escaped the battle!"]],
      [Text, ["You are a disgrace."]],
      [Text, ["If you have problems defeating enemies,"]],
      [Text, ["check your equipment loadout or your skills."]],
    ], [
      [1],
      [
        [1, 1, 1, 1]
      ]
    ], [0.0, 0.0]));
    this.ch.push(new Button("Dismiss", 0.3, 0.7, 0.4, 0.1, () => {
      mainWindow.subMenus[SubMenu.Field].ch[1].setAction(ActionScreen.Idle);
    }));
  }
}

class EnemyFleeAction extends Action {
  constructor(n, x, y, w, h) {
    super(n, x, y, w, h);
    this.ch.push(new CustomImage("images/EnemyEscaped.png", 0, 0, 1, 0.5));
    this.ch.push(new UICollection("", 0, 0.5, 1, 0.15, [
      [Text, ["Your Enemy escaped the battle!"]],
      [Text, ["You must be very intimidating."]],
      [Text, ["Increasing your damage reduces"]],
      [Text, ["their chance to flee!"]],
    ], [
      [1],
      [
        [1, 1, 1, 1]
      ]
    ], [0.0, 0.0]));
    this.ch.push(new Button("Dismiss", 0.3, 0.7, 0.4, 0.1, () => {
      mainWindow.subMenus[SubMenu.Field].ch[1].setAction(ActionScreen.Idle);
    }));
  }
}

class TrapAction extends Action {
  constructor(n, x, y, w, h) {
    super(n, x, y, w, h);
    this.ch.push(new Text(["IF YOU CAN READ THIS THE TRAP DIED!"], 0, 0, 1, 1));
  }
}