class SkillMenu extends MenuTemplate {
  constructor(name, x, y, w, h, col) {
    super(name, x, y, w, h, col);

    this.children.push(new Text("Current Skill Points: ", "player.skillPoints", 0, 0, 1, 0.1));
  }
}
