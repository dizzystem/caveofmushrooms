var world = {
  hexes : [],
  start : function(){
    //Initialize hexes.
    for (var i=0;i<20;i++){
      this.hexes[i] = [];
      for (var j=0;j<20;j++){
        var data = encyclopedia.hexData(j, i);
        if (!data){
          this.hexes[i][j] = null;
          continue;
        }
        this.hexes[i][j] = new hex('ABCDEFGHIJKLMNOPQRSTUVWXYZ'[i]+("0"+j).slice(-2), j, i);
        this.hexes[i][j].name = data.name;
        this.hexes[i][j].addMushrooms(data.mushrooms);
        if (data.colour) this.hexes[i][j].colour = data.colour;
        else this.hexes[i][j].colour = "#222222";
      }
    }
  },
  tick : function(){
    /*
    for (var i=0;i<this.hexes.length;i++){
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

var player = {
  start : function(){
    this.x = this.y = 1;
    this.action = null;
    this.discovered = [];
    this.currentHex().discovered = true; //Delete this when we implement crafting; make them craft a map for it.
    this.i = new container("inv", {
      mushroomKnife : 1,
      pickedblueleaf : 20,
      journal : 1,
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
        encyclopedia.itemData(item).type == "living-mushroom" && 
        !this.discovered.includes(item)){
      this.discovered.push(item);
      return true;
    }
    return false;
  },
  getActionTimer : function(action){
    switch(action.name){
      //Different actions should have different timers, based on equipment and buffs and terrain.
    }
    return 1 * fps; //1 second, for debugging
  },
  currentAction : function(){ return this.action; },
  doAction : function(action){
    this.action = action;
    actionDisplay.redraw();
  },
  completeAction : function(action){
    switch(action.name){
      case "travel":
        this.adjX(action.details.x);
        this.adjY(action.details.y);
        world.discover(this.getX(), this.getY());
        map.redraw();
        locationDisplay.hovering = null;
        locationDisplay.redraw();
        this.action = null;
      break;
      case "gather":
        var thing = action.details.thing;
        
        this.i.adjInv("picked"+thing, 1);
        inventoryDisplay.redraw();
        
        if (this.currentHex().i.getInv(thing) <= 0){
          this.action = null;
        }
      break;
      case "build":
        var thing = action.details.thing;
        var buildingData = encyclopedia.buildingData(thing);
        var materials = buildingData.materials;
        var hex = this.currentHex();
        
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
        var buildingData = encyclopedia.buildingData(action.details.building);
        var recipe = buildingData.recipes[action.details.thing];
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
    }
    if (action){
      action.timer = this.getActionTimer(action);
    }
  },
  getEquip : function(slot){
    if (!slot) return this.equipment;
    if (this.equipment.hasOwnProperty(slot)) return this.equipment[slot];
    return null;
  },
  setEquip : function(slot, equip){
    if (this.equipment.hasOwnProperty(slot)) this.equipment[slot] = equip;
  },
  tick : function(){
    if (this.action){
      if (this.action.timer > 0){
        this.action.timer --;
      } else {
        this.completeAction(this.action);
      }
      actionDisplay.redraw();
    }
  },
}

var encyclopedia = {
  items : {},
  recipes : {},
  start : function(){
  },
  itemData : function(thing){
    var data = this.items[thing];
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
    var ac = {};
    switch(where){
      case "world":
        ac.look = 'look()';
        ac.build = 'build()';
      break;
      case "loc":
        ac.examine = 'examine("'+where+'","'+item+'")';
        if (data.type == "living-mushroom"){
          if (player.hasDiscovered(item)){
            ac.gather = 'gather("'+item+'")';
          }
        } else {
          ac.get = 'get("'+item+'")';
        }
      break;
      case "inv":
        ac.examine = 'examine("'+where+'","'+item+'")';
        ac.drop = 'drop("'+item+'")';
        switch(item){
          case "journal":
            delete ac.drop;
            ac.read = 'read("journal")';
            ac.map = 'map()';
            break;
        }
        let itemData = encyclopedia.itemData(item);
        if (itemData.type == "picked-mushroom"){
          ac.eat = 'eat("'+item+'")';
        }
      break;
    }
    
    var bits = [];
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
    if (this.inventory[item] == 0) delete this.inventory[item];
  }
  this.canAfford = function(materials){
    for (var material in materials){
      if (this.getInv(material) < materials[material]){
        return false;
      }
    }
    return true;
  }
  this.award = function(materials){
    for (var material in materials){
      this.adjInv(material, materials[material]);
    }
  }
  this.pay = function(materials){
    for (var material in materials){
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
  var encyc = encyclopedia[x+"_"+y];
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
      var canbuilds = [];
      for (let build2 in encyclopedia.buildings){
        if (this.canBuild(build2, nearly)){
          canbuilds.push(build2);
        }
      }
      return canbuilds;
    }
    var buildData = encyclopedia.buildingData(build);
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
    
    var mats = 0;
    for (var material in buildData.materials){
      if (player.i.getInv(material)){
        mats ++;
      }
    }
    //Show the button but greyed out if we have at least one of the materials.
    if (mats) return true;
    else return false;
  }
  this.addMushrooms = function(mushrooms){
    for (var i=0;i<mushrooms.length;i++){
      this.i.adjInv(mushrooms[i], 5);
    }
  }
  
  this.i = new container(id, {});
}

//Constructor for the action object.
function action(name, details){
  this.name = name;
  this.details = details;
  this.timer = player.getActionTimer(this);
}

function setup(){
  fps = 10;
  world.start();
  player.start();
  drawingSetup();
  setInterval(tick, 100);
}

function tick(){
  world.tick();
  player.tick();
}
