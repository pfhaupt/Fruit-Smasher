class FieldMenu extends MenuTemplate {
  constructor(name, x, y, w, h, col) {
    super(name, x, y, w, h, col);
    this.resize();

    //Unten Navigator
    this.children.push(new Button("Previous", 0.3, 0.6, 0.1, 0.1, previousEnemy));
    this.children.push(new Text("Level: ", "enemyLevel", 0.4, 0.6, 0.2, 0.1, 30));
    this.children.push(new Button("Next", 0.6, 0.6, 0.1, 0.1, nextEnemy));

    //Anzeige Gegner
    this.children.push(new Image("boss.png", 0.65, 0.1, 0.2, 0.2));
    this.children.push(new Text("Enemy HP: ", "enemy.hp", 0.65, 0.40, 0.2, 0.2));
    this.children.push(new Text("Enemy Dmg: ", "enemy.dmg", 0.65, 0.42, 0.2, 0.2));

    //Anzeige Spieler
    this.children.push(new Text("Player HP: ", "player.hp", 0.15, 0.40, 0.2, 0.2));
    this.children.push(new Text("Player Dmg: ", "player.dmg", 0.15, 0.42, 0.2, 0.2));
  }
}
