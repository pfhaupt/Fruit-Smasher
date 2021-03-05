let currentChestZone = 0;

class ChestMenu extends MenuTemplate {
  constructor(name, x, y, w, h, col) {
    super(name, x, y, w, h, col);

    //Unten Navigator
    this.children.push(new Button("<---", 0.3, 0.7, 0.1, 0.1, this.previousZone));
    this.children.push(new Text(["Zone: ", "currentChestZone"], 0.4, 0.7, 0.2, 0.1, 'center', false));
    this.children.push(new Button("--->", 0.6, 0.7, 0.1, 0.1, this.nextZone));

    this.children.push(new Text(["Stoned Chests: ", "player.chestCount[4 * currentChestZone]"], 0.35, 0.15, 0.4, 0.15, 'center', false));
    this.children.push(new Text(["Bronze Chests: ", "player.chestCount[4 * currentChestZone + 1]"], 0.35, 0.3, 0.4, 0.15, 'center', false));
    this.children.push(new Text(["Silver Chests: ", "player.chestCount[4 * currentChestZone + 2]"], 0.35, 0.45, 0.4, 0.15, 'center', false));
    this.children.push(new Text(["Golden Chests: ", "player.chestCount[4 * currentChestZone + 3]"], 0.35, 0.6, 0.4, 0.15, 'center', false));

    this.children.push(new Button("Open", 0.75, 0.15, 0.2, 0.15, () => {
      player.openChests(0);
    }));
    this.children.push(new Button("Open", 0.75, 0.3, 0.2, 0.15, () => {
      player.openChests(1);
    }));
    this.children.push(new Button("Open", 0.75, 0.45, 0.2, 0.15, () => {
      player.openChests(2);
    }));
    this.children.push(new Button("Open", 0.75, 0.6, 0.2, 0.15, () => {
      player.openChests(3);
    }));
  }

  previousZone() {
    currentChestZone = constrain(currentChestZone - 1, 0, maxZone);
  }

  nextZone() {
    currentChestZone = constrain(currentChestZone + 1, 0, maxZone);
  }
}
