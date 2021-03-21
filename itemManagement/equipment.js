/*
TODO LIST:
Equipment soll funktionieren (DRAG N DROP)
Items sollen funktionieren (Item Stats -> Player Stats)
Item Weights sollen funktionieren (Einige Items sollen häufiger droppen als andere, siehe itemWeight in item.js)
*/

class Equipment extends MenuTemplate {
  constructor(name, x, y, w, h, col) {
    super(name, x, y, w, h, col);
    this.aspectRatio = 10. / 13.;
    this.createSlots();
  }

  createSlots() {
    let w = 0.1;
    let h = w * this.aspectRatio;
    this.children.push(new ItemSlot(4 * w, h, w * 2, h * 2, null));
    this.children.push(new ItemSlot(4.5 * w, 3 * h, w, h, null));
    this.children.push(new ItemSlot(w, 4.5 * h, w, h, null));
    this.children.push(new ItemSlot(2 * w, 4 * h, 2 * w, 2 * h, null));
    this.children.push(new ItemSlot(4 * w, 4 * h, 2 * w, 2 * h, null));
    this.children.push(new ItemSlot(6 * w, 4 * h, 2 * w, 2 * h, null));
    this.children.push(new ItemSlot(8 * w, 4.5 * h, w, h, null));
    this.children.push(new ItemSlot(4 * w, 6 * h, 2 * w, 2 * h, null));
    this.children.push(new ItemSlot(4 * w, 8 * h, 2 * w, 2 * h, null));

    for (let i = 0; i < 8; i++) {
      this.children.push(new ItemSlot(w*(i+1), 11 * h, w, h, null));
    }
  }
}
