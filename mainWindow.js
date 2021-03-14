class MainWindow {
  constructor() {
    this.xRelToParent = 0;
    this.yRelToParent = 0;
    this.wRelToParent = 1;
    this.hRelToParent = 1;
    this.xAbsToScreen = 0;
    this.yAbsToScreen = 0;
    this.wAbsToScreen = 0;
    this.hAbsToScreen = 0;

    let mainMenuHeight = 0.15;

    this.subMenus = [
      new FieldMenu("Field", 0, mainMenuHeight, 1, 1 - mainMenuHeight, color(255, 163, 0)),
      new SkillMenu("Skills", 0, mainMenuHeight, 1, 1 - mainMenuHeight, color(255, 0, 145)),
      new ChestMenu("Chests", 0, mainMenuHeight, 1, 1 - mainMenuHeight, color(145, 71, 0)),
      new InventoryMenu("Inventory", 0, mainMenuHeight, 1, 1 - mainMenuHeight, color(0, 255, 255)),
      new StatsMenu("Stats", 0, mainMenuHeight, 1, 1 - mainMenuHeight, color(0, 255, 0)),
    ];
    for (var s of this.subMenus) s.hide();
    this.mainMenu = new MainMenu(0, 0, 1, mainMenuHeight, this.subMenus);
    this.currentSubMenu = this.subMenus[3];
    this.currentSubMenu.show();
  }

  display() {
    this.mainMenu.display();
    this.currentSubMenu.display();
  }

  resize() {
    this.xAbsToScreen = 0;
    this.yAbsToScreen = 0;
    this.wAbsToScreen = windowWidth;
    this.hAbsToScreen = windowHeight;

    this.mainMenu.resize(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
    this.currentSubMenu.resize(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
  }

  showMenu(id) {
    this.currentSubMenu.hide();
    this.currentSubMenu = this.subMenus[id];
    this.currentSubMenu.show();
  }
}
