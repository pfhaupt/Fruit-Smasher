class SkillMenu extends MenuTemplate {
  constructor(name, x, y, w, h) {
    super(name, x, y, w, h);

    this.ch.push(new Text(["Current Skill Points: ", "player.skillPoints"], 0, 0, 1, 0.1, 'center', false));

    let blockCount = player.attr.length;
    let h1 = (1 - this.ch[0].hRelToParent) / (blockCount);

    for (let i = 0; i < blockCount; i++) {
      let name = player.attr[i].name;
      this.ch.push(new SkillBlock(name, i, 0, this.ch[0].hRelToParent + i * h1, 1, h1));
    }
  }
}

class SkillBlock extends MenuTemplate {
  constructor(name, att, x, y, w, h) {
    super(name, x, y, w, h);
    this.attribute = att;

    this.ch.push(new Button("-MAX", 0.01, 0.1, 0.055, 0.8, () => {
      player.removeAttribute(att, 100000);
      windowResized();
    }));
    this.ch.push(new Button("-100", 0.075, 0.1, 0.055, 0.8, () => {
      player.removeAttribute(att, 100);
      windowResized();
    }));
    this.ch.push(new Button("-10", 0.14, 0.1, 0.055, 0.8, () => {
      player.removeAttribute(att, 10);
      windowResized();
    }));
    this.ch.push(new Button("-1", 0.205, 0.1, 0.055, 0.8, () => {
      player.removeAttribute(att, 1);
      windowResized();
    }));
    this.ch.push(new Text([name + " Boost: +", "player.attr["+att+"].fromSkill"], 0.26, 0, 0.24, 1));
    this.ch.push(new Text(["Level: ", "player.attr["+att+"].skillLevel"], 0.5, 0, 0.24, 1, "center", false));
    this.ch.push(new Button("+1", 0.74, 0.1, 0.055, 0.8, () => {
      player.addAttribute(att, 1);
      windowResized();
    }));
    this.ch.push(new Button("+10", 0.805, 0.1, 0.055, 0.8, () => {
      player.addAttribute(att, 10);
      windowResized();
    }));
    this.ch.push(new Button("+100", 0.87, 0.1, 0.055, 0.8, () => {
      player.addAttribute(att, 100);
      windowResized();
    }));
    this.ch.push(new Button("+MAX", 0.935, 0.1, 0.055, 0.8, () => {
      player.addAttribute(att, 100000);
      windowResized();
    }));
  }
}
