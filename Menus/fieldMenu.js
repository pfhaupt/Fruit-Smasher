class FieldMenu extends MenuTemplate {
  constructor(name, x, y, w, h) {
    super(name, x, y, w, h);

    /*
    //Unten Navigator
    this.ch.push(new Button("Previous", 0.3, 0.8, 0.1, 0.1, previousZone));
    this.ch.push(new Text(["Zone: ", "currentZone"], 0.4, 0.8, 0.2, 0.1, 'center', false));
    this.ch.push(new Button("Next", 0.6, 0.8, 0.1, 0.1, nextZone));

    //Anzeige Gegner
    this.ch.push(new Image("/images/placeholder.png", 0.65, 0.1, 0.3, 0.3));
    this.ch.push(new Text(["Enemy Lvl: ", "enemy.level"], 0.65, 0.47, 0.3, 0.03, 'center', false));
    this.ch.push(new Text(["Enemy HP: ", "enemy.hp"], 0.65, 0.5, 0.3, 0.03));
    this.ch.push(new Text(["Enemy Dmg: ", "enemy.dmg"], 0.65, 0.53, 0.3, 0.03));
    */

    let mapWidth = 0.6;
    this.ch.push(new MapOverview("Maps", 0, 0, mapWidth, 1));
    this.ch.push(new ActionOverview("Actions", mapWidth, 0, 1 - mapWidth, 1));
  }
}

class StatOverview extends MenuTemplate {
  constructor(n, x, y, w, h) {
    super(n, x, y, w, h);
    //Anzeige Spieler
    this.ch.push(new Text(["Current Zone: ", "currentZone"], 0, 0, 1, 0, 'center', false));
    this.ch.push(new Text(["Zone Size: ", "mainWindow.subMenus[0].ch[0].ch[0].width", " by ", "mainWindow.subMenus[0].ch[0].ch[0].height"], 0, 0, 1, 0, 'center', false));
    this.ch.push(new Text(["Enemy Level: ", "minLevel", "-", "maxLevel"], 0, 0, 1, 0, 'center', false));
    this.ch.push(new Text(["Player Level: ", "player.level", " (", "player.experience", "/", "player.expForLvlUp", "XP)"], 0, 0, 1, 0, 'center', false));
    this.ch.push(new Text(["Player HP: ", "player.attr[AttrIDs.Hitpoint].getCurrent()"], 0, 0, 1, 0));
    this.ch.push(new Text(["Player Moves Left: ", "player.attr[AttrIDs.MoveCount].getCurrent()", "/", "player.attr[AttrIDs.MoveCount].getTotal()"], 0, 0, 1, 0, 'center', false));
    this.ch.push(new Text(["Keys Left: ", "entityCount.object.key.current", "/", "entityCount.object.key.total"], 0, 0, 1, 0, 'center', false));
    this.ch.push(new Text(["Boss Enemies Left: ", "entityCount.enemy.boss.current"], 0, 0, 1, 0, 'center', false));
    this.ch.push(new Text(["Normal Enemies Left: ", "entityCount.enemy.normal.current"], 0, 0, 1, 0, 'center', false));
    this.ch.push(new Text(["Spawners In This World: ", "entityCount.enemy.spawner.current"], 0, 0, 1, 0, 'center', false));
    this.ch.push(new Text(["Chests Left: ", "a lot"], 0, 0, 1, 0, 'center', false));
    this.ch.push(new Text(["Placeholder: ", "42069"], 0, 0, 1, 0, 'center', false));
    //this.ch.push(new Text(["Player Dmg: ", "player.attr.damage.total"], 0.05, 0.53, 0.3, 0.03));

    let h1 = 1 / this.ch.length;
    for (let i = 0; i < this.ch.length; i++) {
      this.ch[i].yRelToParent = h1 * i;
      this.ch[i].hRelToParent = h1;
    }
  }
}

class MapOverview extends MenuTemplate {
  constructor(n, x, y, w, h) {
    super(n, x, y, w, h);

    this.ch.push(new WorldMap(0, 0, 0, 0, 2 / 3, 1));
    this.ch.push(new Minimap(2 / 3, 0, 1 / 3, 0.5));
    this.ch.push(new StatOverview("Stats", 2 / 3, 0.5, 1 / 3, 0.5));
    this.aspectRatio = 1.5;
  }
}