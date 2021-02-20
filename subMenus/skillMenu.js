class SkillMenu extends MenuTemplate {
  constructor(name, x, y, w, h, col) {
    super(name, x, y, w, h, col);

    this.children.push(new Text("Current Skills", "player.skillPoints", 0, 0, 1, 0.1));
  }
}
