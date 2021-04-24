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
      new FieldMenu("Field", 0, mainMenuHeight, 1, 1 - mainMenuHeight), //  0  0.15  1  0.85
      new SkillMenu("Skills", 0, mainMenuHeight, 1, 1 - mainMenuHeight),
      new ChestMenu("Chests", 0, mainMenuHeight, 1, 1 - mainMenuHeight),
      new InventoryMenu("Inventory", 0, mainMenuHeight, 1, 1 - mainMenuHeight),
      new StatsMenu("Stats", 0, mainMenuHeight, 1, 1 - mainMenuHeight),
      new OptionMenu("Options", 0, mainMenuHeight, 1, 1 - mainMenuHeight),
    ];
    for (var s of this.subMenus) s.hide();
    this.mainMenu = new MainMenu(0, 0, 1, mainMenuHeight, this.subMenus);
    this.currentSubMenu = this.subMenus[0];
    this.currentSubMenu.show();
    this.image = loadImage("images/backgrounds/fieldMenuBackground.png", () => {this.displayOnce()});
  }

  displayEveryFrame() {
    this.mainMenu.displayEveryFrame();
    this.currentSubMenu.displayEveryFrame();
  }

  displayOnce() {
    image(this.image, this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
    this.mainMenu.displayOnce();
    this.currentSubMenu.displayOnce();
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
    windowResized();
  }
}
