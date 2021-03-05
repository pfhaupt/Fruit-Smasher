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
    this.children.push(new Text(["Level: ", "player.level"], 0, 0, 0.5, 0.2, 'left', false));
    this.children.push(new Text(["Experience: ", "player.experience"], 0, 0.2, 0.5, 0.2, 'left', false));
    this.children.push(new Text(["Experience needed: ", "player.expForLvlUp"], 0, 0.4, 0.5, 0.2, 'left', false));
  }
}
