class FieldMenu extends MenuTemplate {
  constructor(name, x, y, w, h, col) {
    super(name, x, y, w, h, col);

    /*
    //Unten Navigator
    this.children.push(new Button("Previous", 0.3, 0.8, 0.1, 0.1, previousZone));
    this.children.push(new Text(["Zone: ", "currentZone"], 0.4, 0.8, 0.2, 0.1, 'center', false));
    this.children.push(new Button("Next", 0.6, 0.8, 0.1, 0.1, nextZone));

    //Anzeige Gegner
    this.children.push(new Image("/images/placeholder.png", 0.65, 0.1, 0.3, 0.3));
    this.children.push(new Text(["Enemy Lvl: ", "enemy.level"], 0.65, 0.47, 0.3, 0.03, 'center', false));
    this.children.push(new Text(["Enemy HP: ", "enemy.hp"], 0.65, 0.5, 0.3, 0.03));
    this.children.push(new Text(["Enemy Dmg: ", "enemy.dmg"], 0.65, 0.53, 0.3, 0.03));

    */

    this.children.push(new MapOverview("Maps", 0, 0, 0.6, 1, col));
  }
}

class StatOverview extends MenuTemplate {
  constructor(n, x, y, w, h, col) {
    super(n, x, y, w, h, col);
    //Anzeige Spieler
    this.children.push(new Text(["Current Zone: ", "currentZone"], 0, 0, 1, 0, 'center', false));
    this.children.push(new Text(["Zone Size: ", "dim", " by ", "dim"], 0, 0, 1, 0, 'center', false));
    this.children.push(new Text(["Enemy Level: ", "minLevel", "-", "maxLevel"], 0, 0, 1, 0, 'center', false));
    this.children.push(new Text(["Player Level: ", "player.level"], 0, 0, 1, 0, 'center', false));
    this.children.push(new Text(["Player HP: ", "player.hp"], 0, 0, 1, 0));
    this.children.push(new Text(["Keys Left: ", "player.hp"], 0, 0, 1, 0, 'center', false));
    this.children.push(new Text(["Boss Enemies Left: ", "player.hp"], 0, 0, 1, 0, 'center', false));
    this.children.push(new Text(["Normal Enemies Left: ", "player.hp"], 0, 0, 1, 0, 'center', false));
    this.children.push(new Text(["Chests Left: ", "player.hp"], 0, 0, 1, 0, 'center', false));
    this.children.push(new Text(["Placeholder: ", "42069"], 0, 0, 1, 0, 'center', false));
    //this.children.push(new Text(["Player Dmg: ", "player.attributes.damage.total"], 0.05, 0.53, 0.3, 0.03));

    let h1 = 1 / this.children.length;
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].yRelToParent = h1 * i;
      this.children[i].hRelToParent = h1;
    }
  }
}

class MapOverview extends MenuTemplate {
  constructor(n, x, y, w, h, col) {
    super(n, x, y, w, h, col);

    this.children.push(new Map(0, 0, 0, 0, 2 / 3, 1));
    this.children.push(new Minimap(2 / 3, 0, 1 / 3, 0.5));
    this.children.push(new StatOverview("Stats", 2 / 3, 0.5, 1 / 3, 0.5, col));
    this.aspectRatio = 1.5;
  }
}
