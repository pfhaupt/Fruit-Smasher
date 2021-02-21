class SkillMenu extends MenuTemplate {
  constructor(name, x, y, w, h, col) {
    super(name, x, y, w, h, col);

    this.children.push(new Text("Current Skill Points: ", "player.skillPoints", 0, 0, 1, 0.1, 'center', false));

    let blockCount = Object.keys(player.attributes).length;
    let h1 = (1 - this.children[0].hRelToParent) / (blockCount);

    for (let i = 0; i < blockCount; i++) {
      this.children.push(new SkillBlock(Object.keys(player.attributes)[i], 0, this.children[0].hRelToParent + i * h1, 1, h1, col));
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
    this.children.push(new Text("Damage Boost: ", "player.attributes."+name+".fromSkill", 0.3, 0, 0.2, 1));
    this.children.push(new Text("Level: ", "player.attributes."+name+".skillLevel", 0.5, 0, 0.2, 1));
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
}

function doStuff(v) {

}
