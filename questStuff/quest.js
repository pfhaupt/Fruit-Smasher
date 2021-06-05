let QuestType = {
  None: 0,
  Kill: 1,
  Walk: 2
};

let enemyDict = [
  ["Spider", "Spiders"],
  ["Scorpion", "Scorpions"],
  ["Wraith", "Wraiths"],
  ["Octopus", "Octopuses"],
  ["Ghost", "Ghosts"],
  ["Dragon", "Dragons"],
  ["Skeleton Boss", "Skeleton Bosses"],
]

class Quest {
  constructor(par) {
    this.parent = par;
    this.type = QuestType.None;
    this.progress = 0;
    this.goal = this.getGoal();
  }

  verifyQuestType(val) {
    return this.type === val;
  }

  checkProgress(val, extras = null) {
    console.log(val, extras);
    if (!this.verifyQuestType(val)) return;
    this.evaluateProgress(extras);
  }

  evaluateProgress() {
  }

  getGoal() {
    return -1;
  }

  getName() {
    return "";
  }

  getProgress() {
    return "";
  }

  getHint() {
    return "Good luck completing this quest.";
  }
}

class KillQuest extends Quest {
  constructor(par) {
    super(par);
    this.type = QuestType.Kill;
    this.enemyType = ~~(Math.random() * enemyTypeCount + 1);
  }

  evaluateProgress(enemyType) {
    if (this.enemyType !== enemyType) return;
    this.progress++;
    this.checkGoal();
  }

  checkGoal() {
    
  }

  getGoal() {
    return ~~(Math.random() * 5 + 3);
  }

  getName() {
    return "Kill " + pl(enemyDict[this.enemyType - 1][0], this.goal, enemyDict[this.enemyType - 1][1]);
  }

  getProgress() {
    return "Progress: " + this.progress + " / " + this.goal;
  }

  getHint() {
    return "This should be self-explanatory.";
  }
}

class WalkQuest extends Quest {
  constructor(par) {
    super(par);
    this.type = QuestType.Walk;
  }

  evaluateProgress() {
    this.progress = Math.abs(this.goal.x - this.parent.position.x) + Math.abs(this.goal.y - this.parent.position.y);
  }

  getProgress() {
    return "Distance: " + this.progress + " tiles.";
  }

  getGoal() {
    return {x: 10, y: 10};
  }

  getName() {
    return "Move to (" + this.goal.x + "," + this.goal.y + ")";
  }

  getHint() {
    return "Walk to the given coordinates.";
  }
}

