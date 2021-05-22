let QuestType = {
  Kill: 0,
  BossKill: 1,
  Collect: 2,
  OpenChest: 3,
};

class Quest {
  constructor(par, type) {
    this.parent = par;
    this.type = type;
    this.goal = this.generateGoal(this.type);
    this.current = 0;
  }

  trackProgress(t) {
    if (t === this.type) this.current++;
    if (this.current >= this.goal.amount) {
      mainWindow.subMenus[SubMenu.Field].ch[1].setAction(ActionScreen.Quest);
      let qArr = Object.values(QuestType);
      this.type = qArr[~~(Math.random() * qArr.length)];
      this.goal = this.generateGoal(this.type);
      this.current = 0;
    }
  }

  generateGoal(type) {
    switch (type) {
      case QuestType.Kill:
        return {
          amount: ~~(Math.random() * 50) + 25,
            target: ~~(Math.random() * 5) + 1
        };
      case QuestType.BossKill:
        return {
          amount: ~~(Math.random() * 4) + 2,
            target: ~~(Math.random() * 2) + 6
        };
      case QuestType.Collect:
        return {
          amount: ~~(Math.random() * 50) + 25,
            target: 30,
        };
      case QuestType.OpenChest:
        return {
          amount: ~~(Math.random() * 50) + 25,
            target: 2,
        };
    }
  }

  getName() {
    let qArr = Object.keys(EntityIDs);
    let killTarget = "";
    switch (this.type) {
      case QuestType.Kill:
        if (this.goal.target === EntityIDs.Octopus) killTarget = pl("Octopus", this.goal.amount, "Octopuses");
        else killTarget = pl(qArr[this.goal.target], this.goal.amount);
        return "Kill " + killTarget;
      case QuestType.BossKill:
        if (this.goal.target === EntityIDs.SkeletonBoss) killTarget = pl("Skeleton Boss", this.goal.amount, "Skeleton Bosses");
        else killTarget = pl(qArr[this.goal.target], this.goal.amount);
        return "Kill " + killTarget;
      case QuestType.Collect:
        return "Collect " + pl("item", this.goal.amount);
      case QuestType.OpenChest:
        return "Open " + pl("chest", this.goal.amount);
    }

  }

  getProgress() {
    return this.current + "/" + this.goal.amount;
  }
}