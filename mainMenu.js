class MainMenu extends MenuTemplate {
  constructor(x, y, w, h, sub) {
    super("Main", x, y, w, h);
    this.hidden = false;
    let len = sub.length;
    let offs = 1 / len;
    for (var i = 0; i < sub.length; i++) {
      this.ch.push(new MainMenuButton(sub[i].name, i * offs, 0.5, offs, 0.5, i));
    }
    /*
    this.ch.push(new Text(["Level: ", "player.level"], 0, 0, 0.5, 0.2, 'left', false));
    this.ch.push(new Text(["Experience: ", "player.experience"], 0, 0.2, 0.5, 0.2, 'left', false));
    this.ch.push(new Text(["Experience needed: ", "player.expForLvlUp"], 0, 0.4, 0.5, 0.2, 'left', false));
*/
  }
}
