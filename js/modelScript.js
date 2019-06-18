let world = {
  hexes : [],
  start : function(){
    //Initialize hexes.
    for (let i=0;i<20;i++){
      this.hexes[i] = [];
      for (let j=0;j<20;j++){
        let data = encyclopedia.hexData(j, i);
        if (!data){
          this.hexes[i][j] = null;
          continue;
        }
        this.hexes[i][j] = new hex('ABCDEFGHIJKLMNOPQRSTUVWXYZ'[i]+("0"+j).slice(-2), j, i);
        this.hexes[i][j].name = data.name;
        this.hexes[i][j].canEnter = data.canEnter;
        this.hexes[i][j].addMushrooms(data.mushrooms);
        if (data.colour) this.hexes[i][j].colour = data.colour;
        else this.hexes[i][j].colour = "#222222";
      }
    }
  },
  tick : function(){
    /*
    for (let i=0;i<this.hexes.length;i++){
      this.hexes[i].tick();
    }
    */
  },
  getHex : function(hx, hy){
    if (!this.hexes[hy]) return null;
    if (!this.hexes[hy][hx]) return null;
    return this.hexes[hy][hx];
  },
  discover : function(hx, hy){
    this.getHex(hx, hy).discovered = true;
  },
  moveItem : function(item, fro, to, num){
    if (!fro.getInv(item) || fro.getInv(item) < num) return false;
    fro.adjInv(item, -1);
    to.adjInv(item, 1);
    return true;
  }
}

let player = {
  start : function(){
    this.x = 1;
    this.y = 2;
    this.action = null;
    this.actionSpeed = 0;
    this.discovered = [];
    this.currentHex().discovered = true; //Delete this when we implement crafting; make them craft a map for it.
    this.i = new container("inv", {
      mushroomKnife : 1,
      pickedblueleaf : 20,
      journal : 1,
      wisdomSandwich : 5,
      vigourShroom : 5
    });
    this.journal = {
      map : true,
    }
    this.equipment = {
      tool : "mushroomKnife",
      hat : "blueleafHat",
      gloves : null,
      shoes : null,
      food : null,
      drink : null,
    }
    this.researched = {};
    this.consumed = {};
  },
  getX : function(){ return this.x; },
  getY : function(){ return this.y; },
  adjX : function(adjust){
    this.x += adjust;
  },
  adjY : function(adjust){
    this.y += adjust;
  },
  currentHex : function(){
    return world.getHex(this.x, this.y);
  },
  hasDiscovered : function(item){
    return this.discovered.includes(item);
  },
  discover : function(item){
    if (encyclopedia.itemData(item) && 
        encyclopedia.itemData(item).type === "living-mushroom" && 
        !this.discovered.includes(item)){
      this.discovered.push(item);
      return true;
    }
    return false;
  },
  getActionSpeed : function(){
    switch(this.action.name){
      //Different actions should have different timers, based on equipment and buffs and terrain.
      case "research":
        return playerStats.researchSpeed;
      case "build":
        return playerStats.buildSpeed;
      case "gather":
        return playerStats.gatherSpeed;
    }
    return 1;
  },
  currentAction : function(){ return this.action; },
  doAction : function(action){
    if (this.action) {
      if (action.name === this.action.name && 
        objectsEqual(action.details, this.action.details)) {
        {
          return;
        }
      }
    }
    this.action = action;
    this.actionSpeed = this.getActionSpeed();
    actionDisplay.redraw();
  },
  completeAction : function(action){
    let thing, buildingData;
    switch(action.name){
      case "travel":
        this.adjX(action.details.x);
        this.adjY(action.details.y);
        world.discover(this.getX(), this.getY());
        map.redraw();
        log.clear();
        log.log("travel");
        locationDisplay.hovering = null;
        locationDisplay.redraw();
        this.action = null;
      break;
      case "gather":
        thing = action.details.thing;
        
        this.i.adjInv("picked"+thing, 1);
        inventoryDisplay.redraw();
        
        if (this.currentHex().i.getInv(thing) <= 0){
          this.action = null;
        }
      break;
      case "build":
        thing = action.details.thing;
        buildingData = encyclopedia.buildingData(thing);
        let materials = buildingData.materials;
        let hex = this.currentHex();
        
        if (!player.i.canAfford(materials)){
          this.action = null;
          break;
        }
        this.i.pay(materials);
        inventoryDisplay.redraw();
        hex.addBuilding(thing);
        log.log("built-"+thing);
        this.action = null;
      break;
      case "craft":
        buildingData = encyclopedia.buildingData(action.details.building);
        let recipe = buildingData.recipes[action.details.thing];
        if (!player.i.canAfford(recipe.materials)){
          this.action = null;
          break;
        }
        player.i.pay(recipe.materials);
        player.i.award(recipe.products);
        inventoryDisplay.redraw();
        if (!player.i.canAfford(recipe.materials)){
          this.action = null;
          break;
        }
      break;
      case "research":
        buildingData = encyclopedia.buildingData(action.details.building);
        let research = buildingData.research[action.details.thing];
        if (!player.i.canAfford(research.materials)){
          this.action = null;
          break;
        }
        player.i.pay(research.materials);
        inventoryDisplay.redraw();
        if (!player.researched[action.details.thing])
          player.researched[action.details.thing] = 0;
        player.researched[action.details.thing] ++;
        if (player.researched[action.details.thing] >= research.limit){
          this.action = null;
          break;
        }
        if (!player.i.canAfford(research.materials)){
          this.action = null;
          break;
        }
    }
    if (action){
      action.progress = 0;
    }
  },
  getEquip : function(slot){
    if (!slot) return this.equipment;
    if (this.equipment.hasOwnProperty(slot)) return this.equipment[slot];
    return null;
  },
  setEquip : function(slot, equip){
    if (this.equipment.hasOwnProperty(slot)) this.equipment[slot] = equip;
    this.recalculateStats();
  },
  recalculateStats : function(){
    playerStats = {gatherSpeed : 1, researchSpeed : 1, craftSpeed : 1, buildSpeed : 1};
    const itemNames = [];
    // Add in equipment for processing
    for (let slot in this.equipment) {
      if (!this.getEquip(slot)) {
        continue;
      }
      itemNames.push(this.getEquip(slot));
    }
    // Add in consumables
    for (let food in this.consumed) {
      itemNames.push(food);
    }
    for (let itemName of itemNames) {
      const itemData = encyclopedia.itemData(itemName);
      if (!itemData) {
        continue;
      }
      const statData = itemData.stats;
      if (!statData) {
        continue;
      }
      for (let stat in statData) {
        if (!playerStats[stat]) {
          playerStats[stat] = 0;
        }
        playerStats[stat] += statData[stat];
      }
    }
    if (this.action) {
      this.actionSpeed = this.getActionSpeed();
    }
  },
  tick : function(){
    // Increases the progress of actions
    if (this.action){
      if (this.action.progress < this.action.required){
        this.action.progress += this.actionSpeed;
      } else {
        this.completeAction(this.action);
      }
      actionDisplay.redraw();
    }
    // Decreases the time remaining for buffs
    let buffExpired = false;
    for (let food of Object.keys(this.consumed)) {
      this.consumed[food]--;
      if (this.consumed[food] <= 0) {
        delete this.consumed[food];
        buffExpired = true;
      }
    }
    if (buffExpired) {
      this.recalculateStats();
    }
  },
}

let playerStats = {
}

let encyclopedia = {
  items : {},
  recipes : {},
  start : function(){
  },
  itemData : function(thing){
    let data = this.items[thing];
    if (!data) return {};
    if (!data.plu && data.sho){
      data.plu = pluralize(data.sho);
    }
    if (!data.bplu && data.bsho){
      data.bplu = pluralize(data.bsho);
    }
    return data;
  },
  buildingData : function(thing){
    return this.buildings[thing];
  },
  hexData : function(x, y){
    return this.hexes["h"+x+"_"+y];
  },
  actionsFor : function(item, data, where){
    let ac = {};
    switch(where){
      case "world":
        ac.look = 'look()';
        ac.build = 'build()';
      break;
      case "loc":
        ac.examine = 'examine("'+where+'","'+item+'")';
        if (data.type === "living-mushroom"){
          if (player.hasDiscovered(item)){
            ac.gather = 'gather("'+item+'")';
          }
        } else {
          ac.get = 'get("'+item+'")';
        }
      break;
      case "inv":
        let itemData = encyclopedia.itemData(item);
        ac.examine = 'examine("'+where+'","'+item+'")';
        if (itemData.type.includes("equipment")) {
          ac.equip = 'equip("'+item+'")';
        }
        ac.drop = 'drop("'+item+'")';
        switch(item){
          case "journal":
            delete ac.drop;
            delete ac.equip;
            ac.read = 'read("journal")';
            ac.map = 'showMap()';
            break;
        }
        if (itemData.type === "picked-mushroom" || itemData.type === "food"){
          ac.eat = 'eat("'+item+'")';
        }
      break;
    }
    
    let bits = [];
    for (a in ac){
      bits.push("<a onclick='"+ac[a]+"'>"+a+"</a>");
    }
    txt = bits.join(", ");
    return "("+txt+")";
  },
}

//Constructor for container class
function container(name, startinv){
  this.name = name;
  this.inventory = startinv;
  
  this.getInv = function(item){
    if (!item) return this.inventory;
    if (!this.inventory[item]) return 0;
    return this.inventory[item];
  }
  this.adjInv = function(item, amount){
    if (!this.inventory[item]) this.inventory[item] = 0;
    this.inventory[item] += amount;
    if (this.inventory[item] === 0) delete this.inventory[item];
  }
  this.canAfford = function(materials){
    for (let material in materials){
      if (this.getInv(material) < materials[material]){
        return false;
      }
    }
    return true;
  }
  this.award = function(materials){
    for (let material in materials){
      this.adjInv(material, materials[material]);
    }
  }
  this.pay = function(materials){
    for (let material in materials){
      this.adjInv(material, -materials[material]);
    }
  }
}

//Constructor for hex class.
function hex(id, x, y){
  this.id = id;
  this.x = x;
  this.y = y;
  //In the future, colours should probably signify something.
  this.colour = "#"+(100+Math.floor(100*Math.random())).toString(16)+
                    (100+Math.floor(100*Math.random())).toString(16)+
                    (100+Math.floor(100*Math.random())).toString(16);
  this.tick = function(){
    //Nothing yet.
  }
  this.getName = function(){
    if (this.name) return this.name;
    return this.id;
  }
  let encyc = encyclopedia[x+"_"+y];
  if (encyc){
    this.name = encyc.name;
  }
  this.buildings = {};
  this.addBuilding = function(building){
    if (!this.buildings[building]) this.buildings[building] = 0;
    this.buildings[building] ++;
  }
  this.getBuilding = function(building){
    if (building) return this.buildings[building];
    return this.buildings;
  }
  this.canBuild = function(build, nearly){
    if (!build){
      let canbuilds = [];
      for (let build2 in encyclopedia.buildings){
        if (this.canBuild(build2, nearly)){
          canbuilds.push(build2);
        }
      }
      return canbuilds;
    }
    let buildData = encyclopedia.buildingData(build);
    if (this.buildings[build]){
      //Already exists.
      return false;
    }
    if (buildData.canBuild && 
       !buildData.canBuild(player, this)){
      //Doesn't meet requirements.
      return false;
    }
    
    if (player.i.canAfford(buildData.materials)){
      return true;
    } else if (!nearly) return false;
    
    let mats = 0;
    for (let material in buildData.materials){
      if (player.i.getInv(material)){
        mats ++;
      }
    }
    //Show the button but greyed out if we have at least one of the materials.
    if (mats) return true;
    else return false;
  }
  this.addMushrooms = function(mushrooms){
    for (let i=0;i<mushrooms.length;i++){
      this.i.adjInv(mushrooms[i], 5);
    }
  }
  
  this.i = new container(id, {});
}

//Constructor for the action object.
function action(name, details){
  this.name = name;
  this.details = details;
  this.progress = 0;
  this.required = fps;
  // Extracts the timer from the encyclopedia
  switch (name) {
    case "gather":
      this.required *= 10;
      break;
    case "build": {
      let timer = encyclopedia.buildingData(details.thing).timer;
      if (!timer) {
        timer = 10;
      }
      this.required *= timer; 
      break;
    }
    case "craft": {
      const buildingData = encyclopedia.buildingData(building);
      const recipe = buildingData.recipes[thing];
      let timer = recipe.timer;
      if (!timer) {
        timer = 10;
      }
      this.required *= timer;
      break;
    }
    case "research": {
      const buildingData = encyclopedia.buildingData(building);
      const recipe = buildingData.research[thing];
      let timer = recipe.timer;
      if (!timer) {
        timer = 10;
      }
      this.required *= timer;
      break;
    }
    case "travel": {
      break;
    }
    default:
      break;
  }
  console.log(this.required);
}

function setup(){
  fps = 10;
  world.start();
  player.start();
  player.recalculateStats();
  drawingSetup();
  setInterval(tick, 100);
}

function tick(){
  world.tick();
  player.tick();
}
