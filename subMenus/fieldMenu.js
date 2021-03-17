class FieldMenu extends MenuTemplate {
  constructor(name, x, y, w, h, col) {
    super(name, x, y, w, h, col);

    //Unten Navigator
    this.children.push(new Button("Previous", 0.3, 0.8, 0.1, 0.1, previousZone));
    this.children.push(new Text(["Zone: ", "currentZone"], 0.4, 0.8, 0.2, 0.1, 'center', false));
    this.children.push(new Button("Next", 0.6, 0.8, 0.1, 0.1, nextZone));

    //Anzeige Gegner
    this.children.push(new Image("/Fruit-Smasher/images/placeholder.png", 0.65, 0.1, 0.3, 0.3));
    this.children.push(new Text(["Enemy Lvl: ", "enemy.level"], 0.65, 0.47, 0.3, 0.03, 'center', false));
    this.children.push(new Text(["Enemy HP: ", "enemy.hp"], 0.65, 0.5, 0.3, 0.03));
    this.children.push(new Text(["Enemy Dmg: ", "enemy.dmg"], 0.65, 0.53, 0.3, 0.03));

    //Anzeige Spieler
    this.children.push(new Text(["Player Lvl: ", "player.level"], 0.05, 0.47, 0.3, 0.03, 'center', false));
    this.children.push(new Text(["Player HP: ", "player.hp"], 0.05, 0.5, 0.3, 0.03));
    this.children.push(new Text(["Player Dmg: ", "player.attributes.damage.total"], 0.05, 0.53, 0.3, 0.03));
  }
}
