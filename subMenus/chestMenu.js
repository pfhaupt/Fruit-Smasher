let currentChestZone = 0;

class ChestMenu extends MenuTemplate {
  constructor(name, x, y, w, h, col) {
    super(name, x, y, w, h, col);

    //Unten Navigator
    this.children.push(new Button("<---", 0.3, 0.7, 0.1, 0.1, this.previousZone));
    this.children.push(new Text(["Zone: ", "currentChestZone"], 0.4, 0.7, 0.2, 0.1, 'center', false));
    this.children.push(new Button("--->", 0.6, 0.7, 0.1, 0.1, this.nextZone));
  }

  previousZone() {
    currentChestZone = constrain(--currentChestZone, 0, maxZone);
  }

  nextZone() {
    currentChestZone = constrain(++currentChestZone, 0, maxZone);
  }
}
