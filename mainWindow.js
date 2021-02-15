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

    let mainMenuHeight = 0.1;

    this.subMenus = [
      new FieldMenu("Field", 0, mainMenuHeight, 1, 1, color(255, 163, 0)),
      new StatsMenu("Stats", 0, mainMenuHeight, 1, 1, color(0, 255, 0)),
      new LootMenu("Loot", 0, mainMenuHeight, 1, 1, color(255, 0, 255)),

    ];
    this.mainMenu = new MainMenu(0, 0, 1, mainMenuHeight, this.subMenus);
    this.currentSubMenu = this.subMenus[0];
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
