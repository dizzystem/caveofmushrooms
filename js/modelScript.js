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
        this.hexes[i][j].fallback = data.fallback;
        this.hexes[i][j].addMushrooms(data.mushrooms);
        if (data.items){
          this.hexes[i][j].i.award(data.items);
        }
        if (data.colour) this.hexes[i][j].colour = data.colour;
        else this.hexes[i][j].colour = "#222222";
      }
    }
    
    this.data = {
      worldTime : 0
    }
  },
  gameLoad : function(worldData){
    for (let i=0;i<20;i++){
      for (let j=0;j<20;j++){
        if (worldData.hexData[i][j] && this.hexes[i][j]){
          this.hexes[i][j].gameLoad(worldData.hexData[i][j]);
        }
      }
    }
  },
  gameSave : function(){
    let worldData = this.data;
    
    worldData.hexData = {};
    for (let i=0;i<20;i++){
      worldData.hexData[i] = [];
      for (let j=0;j<20;j++){
        if (this.hexes[i][j]){
          worldData.hexData[i][j] = this.hexes[i][j].gameSave();
        } else {
          worldData.hexData[i][j] = null;
        }
      }
    }
    
    return worldData;
  },
  tick : function(){
    for (let i=0;i<this.hexes.length;i++){
      for (let j=0; j<this.hexes[0].length;j++) {
        if (this.hexes[i][j] !== null) {
              this.hexes[i][j].tick();
        }
      }
    }
    
    this.data.worldTime ++;
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
    this.data = {
      x : 1,
      y : 2,
      action : null,
      actionSpeed : 0,
      discovered : [],
      durability : {},
      equipment : {
        tool : null,
        hat : null,
        gloves : null,
        shoes : null,
        food : null,
        drink : null,
      },
      researched : {},
      consumed : {},
    }
    this.i = new container("inv", {
      journal : 1,
    }),
    
    this.currentHex().discovered = true; //Delete this when we implement crafting; make them craft a map for it.
  },
  gameLoad : function(playerData){
    this.data = playerData;
    
    this.i = new container("inv", this.data.i);
  },
  gameSave : function(){
    let playerData = this.data;
    
    playerData.i = this.i.inventory;
    
    return playerData;
  },
  getX : function(){ return this.data.x; },
  getY : function(){ return this.data.y; },
  adjX : function(adjust){
    this.data.x += adjust;
  },
  adjY : function(adjust){
    this.data.y += adjust;
  },
  currentHex : function(){
    return world.getHex(this.data.x, this.data.y);
  },
  hasDiscovered : function(item){
    return this.data.discovered.includes(item);
  },
  discover : function(item){
    if (encyclopedia.itemData(item) && 
        encyclopedia.itemData(item).type === "living-mushroom" && 
        !this.data.discovered.includes(item)){
      this.data.discovered.push(item);
      return true;
    }
    return false;
  },
  getActionSpeed : function(){
    switch(this.data.action.name){
      //Different actions should have different timers, based on equipment and buffs and terrain.
      case "research":
        return playerStats.researchSpeed;
      case "build":
        return playerStats.buildSpeed;
      case "gather":
        return playerStats.gatherSpeed;
      case "craft":
        return playerStats.craftSpeed;
    }
    return 1;
  },
  currentAction : function(){ return this.data.action; },
  doAction : function(action){
    if (this.data.action) {
      if (action.name === this.data.action.name && 
        objectsEqual(action.details, this.data.action.details)) {
        {
          return;
        }
      }
    }
    this.data.action = action;
    this.data.actionSpeed = this.getActionSpeed();
    actionDisplay.redraw();
  },
  completeAction : function(action){
    let thing, buildingData;
    switch(action.name){
      case "travel":
        this.adjX(action.details.x);
        this.adjY(action.details.y);
        world.discover(this.getX(), this.getY());
        map.redraw(true);
        log.clear();
        log.log("travel");
        locationDisplay.hovering = null;
        locationDisplay.redraw(true);
        this.data.action = null;
        break;
      case "gather":
        thing = action.details.thing;
        this.i.adjInv("picked"+thing, 1);
        this.currentHex().i.adjInv(thing, -1);
        inventoryDisplay.redraw();
        if (this.currentHex().i.getInv(thing) <= 0){
          this.data.action = null;
          log.log("depleted", {mushroom:thing});
          locationDisplay.redraw(true);
        }
        break;
      case "build":
        thing = action.details.thing;
        buildingData = encyclopedia.buildingData(thing);
        let materials = buildingData.materials;
        let hex = this.currentHex();
        
        if (!player.i.canAfford(materials)){
          this.data.action = null;
          break;
        }
        this.i.pay(materials);
        inventoryDisplay.redraw(true);
        hex.addBuilding(thing);
        log.log("built", {building:thing});
        this.data.action = null;
        break;
      case "craft":
        buildingData = encyclopedia.buildingData(action.details.building);
        let recipe = encyclopedia.crafting[action.details.thing];
        if (!player.i.canAfford(recipe.materials)){
          this.data.action = null;
          break;
        }
        player.i.pay(recipe.materials);
        player.i.award(recipe.products);
        inventoryDisplay.redraw();
        if (!player.i.canAfford(recipe.materials)){
          this.data.action = null;
          break;
        }
        break;
      case "research":
        buildingData = encyclopedia.buildingData(action.details.building);
        let research = encyclopedia.research[action.details.thing];
        if (player.data.researched[action.details.thing] >= research.limit){
          this.data.action = null;
          break;
        }
        if (!player.i.canAfford(research.materials)){
          this.data.action = null;
          break;
        }
        player.i.pay(research.materials);
        inventoryDisplay.redraw();
        if (!player.data.researched[action.details.thing])
          player.data.researched[action.details.thing] = 0;
        player.data.researched[action.details.thing] ++;
        log.log("research", {research:action.details.thing});
        if (player.data.researched[action.details.thing] >= research.limit){
          this.data.action = null;
          break;
        }
        if (!player.i.canAfford(research.materials)){
          this.data.action = null;
          break;
        }
    }
    if (action){
      action.progress = 0;
    }
  },
  getEquip : function(slot){
    if (!slot){
      return this.data.equipment;
    }
    if (this.data.equipment.hasOwnProperty(slot)){
      return this.data.equipment[slot];
    }
    return null;
  },
  setEquip : function(slot, equip){
    if (this.data.equipment.hasOwnProperty(slot)){
      this.data.equipment[slot] = equip;
    }
    this.recalculateStats();
  },
  getActiveItems : function() {
    const itemNames = [];
    // Add in equipment for processing
    for (let slot in this.data.equipment) {
      let equip = this.getEquip(slot);
      let isBroken = this.data.durability.hasOwnProperty(equip) && (this.data.durability[equip] <= 0);
      if (!equip || isBroken) {
        continue;
      }
      itemNames.push(this.getEquip(slot));
    }
    // Add in consumables
    for (let food in this.data.consumed) {
      itemNames.push(food);
    }
    return itemNames;
  },
  parseSkill : function(skillStr) {
    let ind1 = skillStr.indexOf("_");
    let ind2 = skillStr.lastIndexOf("_");
    if (ind1 == -1 || ind2 == -1 || ind1 == ind2)
      throw("Invalid skill: "+skillStr+".")
    return {
      op: skillStr.slice(0, ind1),
      from: skillStr.slice(ind1+1, ind2),
      to: skillStr.slice(ind2+1)
    }
  },
  generateSkillMetadata : function() {
    let metadata = {}
    // Add in all items that are equipped or consumed. 
    for (let itemName of this.getActiveItems()) {
      const itemData = encyclopedia.itemData(itemName);
      if (!itemData) {
        continue;
      }
      const statData = itemData.stats;
      if (!statData) {
        continue;
      }
      // Here we parse all the strings and convert them into a nested object.
      // metadata[the stat to be affected][add/multiply][the stat that affects, or "constant"]
      for (let stat in statData) {
        let data = this.parseSkill(stat);
        let amt = statData[stat];
        if (metadata[data.to] === undefined)
          metadata[data.to] = {};
        if (metadata[data.to][data.op] === undefined)
          metadata[data.to][data.op] = {};
        if (metadata[data.to][data.op][data.from] === undefined)
          metadata[data.to][data.op][data.from] = 0;
        metadata[data.to][data.op][data.from] += amt;
      }
    }
    return metadata;
  },
  recalculateStats : function(){
    playerStats = {constant : 1, gatherSpeed : 1, researchSpeed : 1, craftSpeed : 1, buildSpeed : 1}
    let metadata = this.generateSkillMetadata();
    for (let stat in metadata){
      if (metadata[stat] === undefined)
        continue;
      let base = 0;
      let multiplier = 1;
      //Do in order: addition then multiplication.
      for (let i=0;i<2;i++){
        let op = ["add", "mult"][i];
        if (metadata[stat][op] === undefined)
          continue;
        for (let bonus in metadata[stat][op]){
          if (playerStats[bonus] === undefined)
            continue;
          let amt = metadata[stat][op][bonus];
          if (playerStats[stat] === undefined)
            playerStats[stat] = 0;
          if (op == "add")
            base += playerStats[bonus] * amt;
          if (op == "mult")
            multiplier += playerStats[bonus] * amt;
        }
      }
      playerStats[stat] += base 
      playerStats[stat] *= multiplier;
    }
    delete playerStats.constant;
    if (this.data.action) {
      this.data.actionSpeed = this.getActionSpeed();
    }
    if (this.currentHex().canEnter !== undefined) {
      if (!this.currentHex().canEnter()) {
        this.moveToFallback();
      };
    }
  },
  handleDurability : function() {
    if (!this.data.equipment["tool"] || this.data.durability[this.data.equipment["tool"]] <= 0) {
      return;
    }
    if (this.data.action) {
      if (this.data.action.name == "gather") {
        this.data.durability[this.data.equipment["tool"]]--;
        if (this.data.durability[this.data.equipment["tool"]] <= 0) {
          this.recalculateStats();
          log.log("break", {item:this.data.equipment["tool"]});
        }
        equipmentDisplay.redraw();
      }
    }
  },
  moveToFallback : function() {
    let details = this.currentHex().fallback;
    this.data.x = details.hex[0];
    this.data.y = details.hex[1];
    world.discover(this.getX(), this.getY());
    map.redraw(true);
    log.clear();
    log.log("fallback", details);
    locationDisplay.hovering = null;
    locationDisplay.redraw(true);
    this.data.action = null;
    actionDisplay.redraw(true);
  },
  tick : function(){
    // Increases the progress of actions
    if (this.data.action){
      if (this.data.action.progress < this.data.action.required){
        this.data.action.progress += this.data.actionSpeed;
      } else {
        this.completeAction(this.data.action);
      }
      this.handleDurability();
      actionDisplay.redraw(true);
    }
    // Decreases the time remaining for buffs
    let buffExpired = false;
    for (let food of Object.keys(this.data.consumed)) {
      this.data.consumed[food]--;
      if (this.data.consumed[food] <= 0) {
        log.log("expire", {item:food});
        delete this.data.consumed[food];
        buffExpired = true;
      } else if (this.data.consumed[food] == 150) {
        log.log("expire", {item:food, soon:true});
      }
    }
    if (buffExpired) {
      this.recalculateStats();
      equipmentDisplay.redraw(true);
    } else if (Object.keys(this.data.consumed).length > 0) {
      equipmentDisplay.redraw();
    }
  },
}

let story = {
  start : function(){
    this.storiesDone = [];
    this.lastCheck = 0;
  },
  gameLoad : function(storyData){
    this.storiesDone = storyData;
  },
  gameSave : function(){
    return this.storiesDone;
  },
  tick : function(){
    let now = world.data.worldTime;
    
    //Only check for stories every 20 ticks (2 seconds).
    if (now - this.lastCheck < 20)
      return;
    
    this.lastCheck = now;
    
    let stories = encyclopedia.stories;
    for (const storyName in stories){
      if (this.storiesDone.indexOf(storyName) != -1){
        continue;
      }
      
      let story = stories[storyName];
      
      if (story.requires){
        for (const req in story.requires){
          if (this.storiesDone.indexOf(req) == -1){
            continue;
          }
        }
      }
      
      if (story.condition){
        if (!story.condition()){
          continue;
        }
      }
      
      this.storiesDone.push(storyName);
      this.tellStory(storyName);
    }
  },
  tellStory : function(story){
    log.log("story", {chapter : story});
  }
}

let settings = {
  start : function(){
  },
  gameLoad : function(settingsData){
    
  },
  gameSave : function(){
    return null;
  },
}

// Note: do not delete this. It is a global variable used by 
// the player under stat recalculation. 
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
          if (player.data.researched["map"])
            ac.map = 'showMap()';
            break;
        }
        if (itemData.edible){
          let verb = itemData.edible.verb || "eat";
          
          ac[verb] = 'eat("'+item+'")';
        }
        if (itemData.type === "repair") {
          ac.repair = 'repair("'+item+'")';
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
  this.setInv = function(item, amount){
    this.inventory[item] = amount;
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
  this.name = undefined;
  this.data = {
    buildings : {},
    regrowthTime : {}
  }
  //In the future, colours should probably signify something.
  this.colour = "#"+(100+Math.floor(100*Math.random())).toString(16)+
                    (100+Math.floor(100*Math.random())).toString(16)+
                    (100+Math.floor(100*Math.random())).toString(16);
  this.i = new container(id, {});
  this.capacity = undefined;
  
  this.gameLoad = function(hexData){
    this.data = hexData;
    
    this.i = new container(this.id, this.data.i);
  }
  this.gameSave = function(){
    let hexData = this.data;
    
    hexData.i = this.i.inventory;
    
    return hexData;
  }
  
  this.getName = function(){
    if (this.name) return this.name;
    return this.id;
  }
  let encyc = encyclopedia[x+"_"+y];
  if (encyc){
    this.name = encyc.name;
  }
  this.addBuilding = function(building){
    if (!this.data.buildings[building]){
      this.data.buildings[building] = 0;
    }
    this.data.buildings[building] ++;
  }
  this.getBuilding = function(building){
    if (building){
      return this.data.buildings[building];
    }
    return this.data.buildings;
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
    if (this.data.buildings[build]){
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
    this.capacity = mushrooms;
      for (let mushroom in mushrooms){
        this.i.adjInv(mushroom, mushrooms[mushroom]);
      }
    this.initialiseRegrowth();
  }
  // We will eventually refactor this to take in account climate 
  // and different base regrowth times. 
  this.initialiseRegrowth = function() {
    for (let mushroom in this.capacity) {
      this.data.regrowthTime[mushroom] = 20000;
    }
  },
  this.handleRegrowth = function() {
    let displayChanged = false;
    for (let mushroom in this.data.regrowthTime) {
      if (this.i.getInv(mushroom) < this.capacity[mushroom]) {
          this.data.regrowthTime[mushroom] -= 100;
      }
      if (this.data.regrowthTime[mushroom] <= 0) {
        this.data.regrowthTime[mushroom] += 20000;
        this.i.setInv(mushroom, this.capacity[mushroom]);
        displayChanged = true;
      }
    }
    if (displayChanged) {
      locationDisplay.redraw();
    }
  },
  this.tick = function(){
    this.handleRegrowth();
  }
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
      const buildingData = encyclopedia.buildingData(details.building);
      const recipe = encyclopedia.craftung[details.thing];
      let timer = recipe.timer;
      if (!timer){
        timer = buildingData.timer;
      }
      if (!timer) {
        timer = 10;
      }
      this.required *= timer;
      break;
    }
    case "research": {
      const buildingData = encyclopedia.buildingData(details.building);
      const recipe = encyclopedia.research[details.thing];
      let timer = recipe.timer;
      if (!timer){
        timer = buildingData.timer;
      }
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
}

function gameLoad(){
  let saveDataString = localStorage.getItem("caveofmushrooms");
  
  if (saveDataString){
    let saveData = JSON.parse(saveDataString);
    
    world.gameLoad(saveData.world);
    player.gameLoad(saveData.player);
    settings.gameLoad(saveData.settings);
    story.gameLoad(saveData.story);
  }
}

function gameSave(){
  let saveData = {};
  
  saveData.world = world.gameSave();
  saveData.player = player.gameSave();
  saveData.settings = settings.gameSave();
  saveData.story = story.gameSave();
  
  let saveDataString = JSON.stringify(saveData);
  localStorage.setItem("caveofmushrooms", saveDataString);
}

let lastTick = (new Date()).getTime();
let lastSave = (new Date()).getTime();

function setup(){
  fps = 10;
  world.start();
  player.start();
  settings.start();
  story.start();
  
  gameLoad();
  
  player.recalculateStats();
  drawingSetup();
  setInterval(timePassed, 100);
}

function timePassed(){
  let now = (new Date()).getTime();
  let timeDifference = now - lastTick;
  if (timeDifference > 1000) {
    timeDifference = 1000;
  }
  // Carry over any unused seconds.
  lastTick = now - (timeDifference % 100);
  for (let i = 0; i < Math.floor(timeDifference / 100); i++) {
    tick();
  }
  
  timeDifference = now - lastSave;
  if (timeDifference > 10 * 1000){
    //Autosave every 10 seconds.
    gameSave();
    lastSave = now;
  }
}

function tick(){
  world.tick();
  player.tick();
  story.tick();
}
