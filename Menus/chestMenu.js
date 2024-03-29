let currentChestZone = 0;

class ChestMenu extends MenuTemplate {
  constructor(name, x, y, w, h) {
    super(name, x, y, w, h);

    //Unten Navigator
    this.ch.push(new Button("<---", 0.3, 0.8, 0.1, 0.1, this.previousZone));
    this.ch.push(new Text(["Zone: ", "currentChestZone"], 0.4, 0.8, 0.2, 0.1, 'center', false));
    this.ch.push(new Button("--->", 0.6, 0.8, 0.1, 0.1, this.nextZone));

    this.ch.push(new CustomImage("images/stonedChest.png", 0.2, 0.1, 0.15, 0.15));
    this.ch.push(new CustomImage("images/goldenChest.png", 0.2, 0.55, 0.15, 0.15));

    this.ch.push(new Text(["Stoned Chests: ", "player.chestCount[4 * currentChestZone]"], 0.35, 0.1, 0.2, 0.15, 'center', false));
    this.ch.push(new Text(["Bronze Chests: ", "player.chestCount[4 * currentChestZone + 1]"], 0.35, 0.25, 0.2, 0.15, 'center', false));
    this.ch.push(new Text(["Silver Chests: ", "player.chestCount[4 * currentChestZone + 2]"], 0.35, 0.4, 0.2, 0.15, 'center', false));
    this.ch.push(new Text(["Golden Chests: ", "player.chestCount[4 * currentChestZone + 3]"], 0.35, 0.55, 0.2, 0.15, 'center', false));

    this.ch.push(new Button("Open", 0.55, 0.125, 0.2, 0.1, () => {
      player.openChests(0);
    }));
    this.ch.push(new Button("Open", 0.55, 0.275, 0.2, 0.1, () => {
      player.openChests(1);
    }));
    this.ch.push(new Button("Open", 0.55, 0.425, 0.2, 0.1, () => {
      player.openChests(2);
    }));
    this.ch.push(new Button("Open", 0.55, 0.575, 0.2, 0.1, () => {
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
