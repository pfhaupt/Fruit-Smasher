class InventoryMenu extends MenuTemplate {
  constructor(name, x, y, w, h, col) {
    super(name, x, y, w, h, col);
    this.children.push(new Inventory("Inventory", 0.4, 0, 0.6, 1, color(255, 255, 255)));
    this.children.push(new Equipment("Equipment", 0, 0, 0.4, 1, color(0, 0, 255)));
  }
}
