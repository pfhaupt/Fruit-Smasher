class InventoryMenu extends MenuTemplate {
  constructor(name, x, y, w, h, col) {
    super(name, x, y, w, h, col);
    this.children.push(new Inventory("Inventory", 0.5, 0, 0.5, 1, color(255, 0, 255)));
    this.children.push(new Equipment("Equipment", 0, 0, 0.5, 1, color(0, 0, 255)));
  }
}
