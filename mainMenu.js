class MainMenu extends MenuTemplate {
  constructor(x, y, w, h, sub) {
    super("Main", x, y, w, h, color(255, 163, 0));
    this.hidden = false;
    let len = sub.length;
    let offs = 1 / len;
    console.log(offs);
    for (var i = 0; i < sub.length; i++) {
      this.children.push(new MainMenuButton(sub[i].name, i * offs, 0.6, offs, 0.4, i));
    }
    this.children.push(new Text("player.level", "Level: ", 0, 0, 0.5, 0.225, 20, TOP, LEFT));
    this.children.push(new Text("player.experience", "Experience: ", 0, 0.2, 0.5, 0.25, 20, TOP, LEFT));
    this.children.push(new Text("player.expForLvlUp", "Experience needed: ", 0, 0.4, 0.5, 0.25, 20, TOP, LEFT));
  }
}