class SkillMenu extends MenuTemplate {
  constructor(name, x, y, w, h, col) {
    super(name, x, y, w, h, col);

    this.children.push(new Text(["Current Skill Points: ", "player.skillPoints"], 0, 0, 1, 0.1, 'center', false));

    let blockCount = Object.keys(player.attributes).length;
    let h1 = (1 - this.children[0].hRelToParent) / (blockCount);

    for (let i = 0; i < blockCount; i++) {
      let att = Object.keys(player.attributes)[i];
      let name = player.attributes[att].name;
      this.children.push(new SkillBlock(name, att, 0, this.children[0].hRelToParent + i * h1, 1, h1, col));
    }
  }
}

class SkillBlock extends MenuTemplate {
  constructor(name, att, x, y, w, h, col) {
    super(name, x, y, w, h, col);
    this.attribute = att;

    this.children.push(new Button("-MAX", 0.01, 0.1, 0.055, 0.8, () => {
      player.removeAttribute(att, 100000);
    }));
    this.children.push(new Button("-100", 0.075, 0.1, 0.055, 0.8, () => {
      player.removeAttribute(att, 100);
    }));
    this.children.push(new Button("-10", 0.14, 0.1, 0.055, 0.8, () => {
      player.removeAttribute(att, 10);
    }));
    this.children.push(new Button("-1", 0.205, 0.1, 0.055, 0.8, () => {
      player.removeAttribute(att, 1);
    }));
    this.children.push(new Text([name + " Boost: +", "player.attributes."+att+".fromSkill"], 0.26, 0, 0.24, 1));
    this.children.push(new Text(["Level: ", "player.attributes."+att+".skillLevel"], 0.5, 0, 0.24, 1, "center", false));
    this.children.push(new Button("+1", 0.74, 0.1, 0.055, 0.8, () => {
      player.addAttribute(att, 1);
    }));
    this.children.push(new Button("+10", 0.805, 0.1, 0.055, 0.8, () => {
      player.addAttribute(att, 10);
    }));
    this.children.push(new Button("+100", 0.87, 0.1, 0.055, 0.8, () => {
      player.addAttribute(att, 100);
    }));
    this.children.push(new Button("+MAX", 0.935, 0.1, 0.055, 0.8, () => {
      player.addAttribute(att, 100000);
    }));
  }
}
