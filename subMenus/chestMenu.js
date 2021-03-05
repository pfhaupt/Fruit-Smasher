class ChestMenu extends MenuTemplate {
  constructor(name, x, y, w, h, col) {
    super(name, x, y, w, h, col);
    this.currentZone = 0;


    //Unten Navigator
    this.children.push(new Button("<--", 0.3, 0.7, 0.1, 0.1, this.previousZone));
    this.children.push(new Text(["Zone: ", "this.currentZone"], 0.4, 0.7, 0.2, 0.1, 'center', false));
    this.children.push(new Button("-->", 0.6, 0.7, 0.1, 0.1, this.nextZone));
  }

  previousZone() {
    this.currentZone = constrain(--this.currentZone, 0, maxZone);
  }

  nextZone() {
    this.currentZone = constrain(++this.currentZone, 0, maxZone);
  }
}
