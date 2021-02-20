class SkillMenu extends MenuTemplate {
  constructor(name, x, y, w, h, col) {
    super(name, x, y, w, h, col);

    this.children.push(new Text("Current Skill Points: ", "player.skillPoints", 0, 0, 1, 0.1));

    let blockCount = 5;
    let h = (1 - this.children[0].hRelToParent) / blockCount;

    for (let i = 0; i < blockCount; i++) {
      this.children.push(new Skillblock("", 0, this.children[0].hRelToParent + i * h, 1, h, col));
    }
  }
}

class SkillBlock extends MenuTemplate {
  constructor(name, x, y, w, h, col) {
    super(name, x, y, w, h, col);

    this.children.push(new Button("-MAX", 0, 0, 0.075, 1, () => {
      doStuff(100);
    }));
    this.children.push(new Button("-100", 0.075, 0, 0.075, 1, () => {
      doStuff(10);
    }));
    this.children.push(new Button("-10", 0.15, 0, 0.075, 1, () => {
      doStuff(10);
    }));
    this.children.push(new Button("-1", 0.225, 0, 0.075, 1, () => {
      doStuff(10);
    }));
    this.children.push(new Text("Damage Boost: ", "player.skill[dmg].value", 0.3, 0, 0.2, 1));
    this.children.push(new Text("Level: ", "player.skill[dmg].level", 0.5, 0, 0.2, 1));
    this.children.push(new Button("+1", 0.7, 0, 0.075, 1, () => {
      doStuff(10);
    }));
    this.children.push(new Button("+10", 0.775, 0, 0.075, 1, () => {
      doStuff(10);
    }));
    this.children.push(new Button("+100", 0.85, 0, 0.075, 1, () => {
      doStuff(10);
    }));
    this.children.push(new Button("+MAX", 0.925, 0, 0.075, 1, () => {
      doStuff(10);
    }));
  }

  doStuff(v) {

  }
}
