class InventoryMenu extends MenuTemplate {
  constructor(name, x, y, w, h) {
    super(name, x, y, w, h);
    this.children.push(new Equipment("Equipment", 0, 0, 0.4, 1));
    this.children.push(new Inventory("Inventory", 0.4, 0, 0.6, 1));
  }
}
