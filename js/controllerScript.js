//=========================Text formatting functions=====================
function pluralize(str){
  let bits = str.split(" ");
  
  let of_position = bits.indexOf("of");
  if (of_position != -1){
    let before_of = bits.slice(0, of_position).join(" ");
    let after_of = bits.slice(of_position, bits.length).join(" ");
    
    return pluralize(before_of)+" "+after_of;
  }
  
  switch (str[str.length-1]){
    case "f":
      return str.slice(0, str.length-1)+"ves";
    case "y":
      return str.slice(0, str.length-1)+"ies";
    case "s":
      return str+"es";
    case "h":
      return str+"es";
  }
  return str+"s";
}
function capitalize(str){
  //stolen off stackoverflow
  return str[0].toUpperCase()+str.substring(1);
}
uncapitalizedWords = ["as", "if", "at", "but", "by", "for", "from", "in", "into", "like", 
  "a", "an", "nor", "of", "off", "on", "or", "over", "so", "to", "with"];
function capitalize_all(str){
  const bits = str.split(" ");
  let capBits = [];
  
  for (const ind in bits){
    const bit = bits[ind];
    if (uncapitalizedWords.indexOf(bit) != -1){
      capBits.push(bit);
      continue;
    }
    capBits.push(capitalize(bit));
  }
  
  return capBits.join(" ");
}
function queryNum(integer, precise){
  if (integer === 0){
    return "no";
  }
  if (integer === 1){
    return "a";
  }
  return integer;
}
function qms(array){
  let len = array.length;
  if (!len) return "";
  if (len === 1) return array[0];
  return array.slice(0, len-1).join(", ")+" and "+array[len-1];
}
function add_a(word){
  let letter = word[0];
  if (letter === "a" || letter === "e" || letter === "i" || letter === "o" || letter === "u"){
    return "an "+word;
  }
  return "a "+word;
}
function sizeof(ob){
  let size = 0;
  for (let att in ob){
    size ++;
  }
  return size;
}
function time_expression(seconds){
  let days = Math.floor(seconds / (24 * 60 * 60));
  let hours = Math.floor((seconds - days * 24 * 60 * 60) / (60 * 60));
  let minutes = Math.floor((seconds - days * 24 * 60 * 60 - hours * 60 * 60) / 60);
  seconds = Math.floor(seconds - days * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60);
  
  if (days > 0){
    return days+"d "+hours+"h "+minutes+"m "+seconds+"s";
  } else if (hours > 0){
    return hours+"h "+minutes+"m "+seconds+"s";
  } else if (minutes > 0){
    return minutes+"m "+seconds+"s";
  } else if (seconds > 0){
    return seconds+"s";
  }
}
function text_hover(text, action){
  return "<a onmouseover=\""+action+"\">"+text+"</a>";
}
function text_click(text, action){
  return "<a onclick=\""+action+"\">"+text+"</a>";
}
function shopping_list_item(material, numRequired){
  let itemData = encyclopedia.itemData(material);
  let numHad = player.i.getInv(material);
  
  if (itemData && itemData.sho){
    let materialName = itemData.sho;
    
    return numRequired+" "+materialName+" (you have "+numHad+")";
  } else {
    return numRequired+" ??? ("+material+")"+" (you have "+numHad+")";
  }
}

//===========================Helper functions=============================
function objectsEqual(a, b) {
  let aProps = Object.getOwnPropertyNames(a);
  let bProps = Object.getOwnPropertyNames(b);
  if (aProps.length != bProps.length) {
    return false;
  }
  for (let propName of aProps) {
    if (a[propName] !== b[propName]) {
      return false;
    }
  }
  return true;
}

//============================Display objects=============================
const map = {
  start(){
    // Feel free to remove the jQuery tips once you don't need them. 
    // I haven't refactored the canvas yet because it breaks the code somehow
    this.mapZoom = 100;
    this.shown = true;
    this.lastUpdate = (new Date()).getTime();
    
    // Shorthand for getElementById
    this.cont = $("#minimap-cont");
    // You can access the DOM element itself using numerical indexing
    this.canvas = $("#minimap")[0];
    
    this.canvas.width = 300;
    this.canvas.height = 300;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.fillStyle = "#333333";
    //this.interval = setInterval(redrawMinimap, 100);
    this.canvas.addEventListener("click", this.clicked);
    this.redraw(true);
  },
  
  mapX : function(xcoord){ return xcoord * this.mapZoom+this.canvas.width/2 },
  mapY : function(ycoord){ return ycoord * this.mapZoom+this.canvas.height/3.2 },
  
  //Args are for the topmost point of the hexagon.
  drawHex : function (hx, hy){
    let xcoord = hx - player.getX()+(hy - player.getY())/2;
    let ycoord = (hy - player.getY()) * Math.sqrt(3)/2;
    const hex = world.getHex(hx, hy);
    if (!hex){
      //Don't draw hexes that don't exist.
      return;
    }
    if (this.mapX(xcoord) > 500  || this.mapY(ycoord) > 500 || 
        this.mapX(xcoord) < -200 || this.mapY(ycoord) < -200){
      //Don't draw hexes too far out of the frame.
      return;
    }
    this.ctx.beginPath();
    this.ctx.moveTo(this.mapX(xcoord), this.mapY(ycoord));
    //Draw a hexagon.
    for (let i=0;i<6;i++){
      const deg = Math.PI/6+i * Math.PI/3;
      xcoord += Math.cos(deg) * Math.sqrt(3)/3;
      ycoord += Math.sin(deg) * Math.sqrt(3)/3;
      this.ctx.lineTo(this.mapX(xcoord), this.mapY(ycoord));
    }
    //Fill in with colour and label if it's discovered.
    if (hex.discovered){
      this.ctx.fillStyle = hex.colour;
      this.ctx.fill();
      this.ctx.font = (this.mapZoom/5)+"px Arial";
      if (hx === player.getX() && hy === player.getY()){
        //Colour the one you're on.
        this.ctx.fillStyle = "#FFFF33";
      } else {
        this.ctx.fillStyle = "#666666";
      }
      this.ctx.fillText(hex.id, this.mapX(xcoord), this.mapY(ycoord+0.9));
    } else {
      this.ctx.fillStyle = "#666666";
      this.ctx.fill();
    }
    this.ctx.stroke();
  },
  
  redraw(force = false){
    if (!force) {
      let newTimestamp = (new Date()).getTime();
      let timeDifference = newTimestamp - this.lastUpdate;
      if (timeDifference < 500) {
        return;
      }
      this.lastUpdate = newTimestamp;
    }
    // Use css method to modify style properties
    this.cont.css( {display:'default'} );
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i=0;i<world.hexes.length;i++){
      for (let j=0;j<world.hexes[0].length;j++){
        this.drawHex(j, i);
      }
    }
  },

  //"this" refers to the canvas because of addEventListener
  clicked(mouseEvent){
    //Click position.
    const cx = mouseEvent.offsetX - this.width/2;
    const cy = mouseEvent.offsetY - this.height/2;
    //Translation into hex axes.
    const dx = cx;
    const dy = cx/2+cy*Math.sqrt(3)/2;
    const dz = cx/2 - cy*Math.sqrt(3)/2;
    //Resulting movement.
    let mx, my;
    const dmax = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz));
    if (dmax/map.mapZoom < 1/2) return; //They're clicking on the current hex.
    switch(dmax){
      case Math.abs(dx):
        mx = dx > 0 ? 1 : -1;
        my = 0;
      break;
      case Math.abs(dy):
        mx = 0;
        my = dy > 0 ? 1 : -1;
      break;
      case Math.abs(dz):
        mx = dz > 0 ? 1 : -1;
        my = dz > 0 ? -1 : 1;
      break;
    }
    const hex = world.getHex(player.getX()+mx, player.getY()+my);
    if (!hex){
      return;
    }
    if (hex.canEnter && !hex.canEnter()){
      popup.hide();
      return;
    }
    player.doAction(new action("travel", { x : mx, y : my }));
  },
  
  zoom(adj){
    this.mapZoom += adj;
    if (this.mapZoom < 50) this.mapZoom = 50;
    if (this.mapZoom > 150) this.mapZoom = 150;
    this.redraw(true);
  }
}

const actionDisplay = {
  start(){
    this.display = $("#actionDisplay");
    this.progressBackground = $("#progressBackground");
    this.progressBar = $("#progressBar");
    this.hovering = null;
    this.lastUpdate = (new Date()).getTime();
  },
  redraw(force = false){
    if (!force) {
      let newTimestamp = (new Date()).getTime();
      let timeDifference = newTimestamp - this.lastUpdate;
      if (timeDifference < 500) {
        return;
      }
      this.lastUpdate = newTimestamp;
    }
    let action = player.currentAction();
    let txt;
    if (!action) {
      txt = "";
      this.progressBackground.css({display:"none"});
    }
    else {
      let details = action.details;
      let currentAction;
      
      switch(action.name){
        case "build":
          currentAction = "building a "+encyclopedia.buildingData(details.thing).sho;
        break;
        case "craft":
          currentAction = "crafting "+details.thing;
        break;
        case "gather":
          currentAction = "gathering "+encyclopedia.itemData(details.thing).plu;
        break;
        case "research":
          currentAction = "researching "+details.thing;
        break;
        case "travel":
          currentAction = "travelling to "+world.getHex(player.getX()+details.x, player.getY()+details.y).id;
        break;
      }
      
      //Currently the stop link only works if you double-click quickly on it.
      //  I suspect that both clicks have to happen within one refresh window of 500 milliseconds,
      //  but I don't know why.
      if (this.hovering === "currentAction"){
        let stopLink = text_click("stop", "stopAction()");
        txt = "You are "+currentAction+" ("+stopLink+"). ";
      } else {
        let currentActionHover = text_hover(currentAction, "actionDisplay.hovered('currentAction')");
        txt = "You are "+currentActionHover+". ";
      }
      
      const actionTimer = (action.required - action.progress) / player.data.actionSpeed;
      txt += "("+Math.ceil(actionTimer/10)+")";
      this.progressBackground.css({display:"block"});
      let progress = action.progress / action.required * 100;
      if (progress > 100) {
        progress = 100;
      } else if (progress < 0) {
        progress = 0;
      }
      this.progressBar.css({width:progress+"%"});
    }
    this.display.html(txt);
  },
  hovered(item){
    this.hovering = item;
    this.redraw(true);
  },
}

const locationDisplay = {
  start(){
    this.display = $("#locationDisplay");
    this.hovering = null;
    this.lastUpdate = (new Date()).getTime();
  },
  txtFor(item){
    let num = player.currentHex().i.getInv(item);
    let data = encyclopedia.itemData(item);
    let numword = queryNum(num);
    let name = num>1 ? data.plu : data.sho;
    let pos = "on the ground";
    if (data.type === "living-mushroom"){
      numword = "some";
      if (!player.hasDiscovered(item)){
        name = num>1 ? data.bplu : data.bsho;
      }
      pos = "growing";
    }
    let txt = "<p id='location "+item+"'>There "+(num===1 ? "is" : "are")+" "+numword+" ";
    if (this.hovering === item){
      txt += name+" "+encyclopedia.actionsFor(item, data, "loc");
    } else {
      let locationHover = text_hover(name, "locationDisplay.hovered('"+item+"')");
      
      txt += locationHover;
    }
    txt += " "+pos+" here.</p>";
    return txt;
  },
  redraw(force = false){
    if (!force) {
      let newTimestamp = (new Date()).getTime();
      let timeDifference = newTimestamp - this.lastUpdate;
      if (timeDifference < 500) {
        return;
      }
      this.lastUpdate = newTimestamp;
    }
    let hex = player.currentHex();
    let inv = hex.i.getInv();
    let txt;
    if (this.hovering === "hex"){
      txt = "<p><h3>"+hex.getName()+"</h3> "+encyclopedia.actionsFor(hex, null, "world")+"<p>";
    } else {
      let hexName = hex.getName();
      let locationHover = text_hover(hexName, "locationDisplay.hovered('hex')");
      
      txt = "<p><h3>"+locationHover+"</h3></p>";
    }
    if (hex.desc){
      txt += "<p>"+hex.desc+"</p>";
    }
    for (let item in inv){
      if (!inv[item]) continue;
      txt += this.txtFor(item);
    }
    this.display.html(txt);
  },
  hovered(item){
    this.hovering = item;
    this.redraw(true);
  },
}

const rightTabs = {
  start(){
    this.openTab(0, "inventory");
  },
  openTab(evt, tabName) {
    // Declare all variables
    let i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    $(".tabcontent").css({display: 'none'})

    // Get all elements with class="tablinks" and remove the class "active"
    $(".tablinks").removeClass("active");

    // Show the current tab, and add an "active" class to the button that opened the tab
    $('#'+tabName).css({display : "block"}).addClass("active");
  }
}

const inventoryDisplay = {
  start(){
    this.display = $("#inventory");
    this.equipDisplay = $("#inventory-equip");
    this.itemDisplay = $("#inventory-item");
    this.hovering = null;
    this.lastUpdate = (new Date()).getTime();
  },
  redraw(force = false){
    // (danielnyan) Can optimise by only redrawing the elements 
    // that have changed, instead of redrawing everything.
    if (!force) {
      let newTimestamp = (new Date()).getTime();
      let timeDifference = newTimestamp - this.lastUpdate;
      if (timeDifference < 500) {
        return;
      }
      this.lastUpdate = newTimestamp;
    }
    
    // This also empties the contents
    this.equipDisplay.html("<h4>Equipment</h4>"); //todo: rename this to something that doesn't conflict with the equipment tab
    this.itemDisplay.html("<h4>Items</h4>");
    
    const inv = player.i.getInv();
    for (let item in inv) {
      if (!inv[item]) continue;
      const data = encyclopedia.itemData(item);
      const name = inv[item]>1 ? data.plu : data.sho;
      const textObject = $("<p></p>").html("You have "+queryNum(inv[item])+" ");
      if (this.hovering === item) {
        const actionsHtml = encyclopedia.actionsFor(item, data, "inv")
        textObject.html(textObject.html()+name+" "+actionsHtml);
      } else {
        const link = $("<a></a>").html(name);
        link.mouseover(() => inventoryDisplay.hovered(item));
        textObject.append(link);
      }
      textObject.append(".");
      
      const itemData = encyclopedia.itemData(item);
      if (itemData && itemData.type && itemData.type.includes("equipment")) {
        this.equipDisplay.append(textObject);
      } else {
        this.itemDisplay.append(textObject);
      }
    }
  },
  hovered(item){
    this.hovering = item;
    this.redraw(true);
  },
}

const equipmentDisplay = {
  start(){
    this.display = $("#equipment");
    this.hovering = null;
    this.lastUpdate = (new Date()).getTime();
  },
  redraw(force = false){
    if (!force) {
      let newTimestamp = (new Date()).getTime();
      let timeDifference = newTimestamp - this.lastUpdate;
      if (timeDifference < 500) {
        return;
      }
      this.lastUpdate = newTimestamp;
    }
    let equipment = player.getEquip();
    let txt = "<h4>Equipment</h4>";
    for (let slot in equipment){
      let item = equipment[slot];
      if (!item) continue;
      let itemData = encyclopedia.itemData(item);
      if (!itemData) continue;
      let displayText = itemData.sho;
      if (slot === "tool") {
        let currentDura = player.data.durability[item];
        let maxDura = itemData.durability;
        displayText += " ("+currentDura+"/"+maxDura+")";
      }
      
      //todo: make equipment align right, using spans or something
      if (this.hovering === slot){
        let removeLink = text_click("remove", "remove('"+slot+"')");
        
        txt += "<p>"+capitalize(slot)+": "+displayText+" ("+removeLink+")</p>";
      } else {
        let equipHover = text_hover(displayText, "equipmentDisplay.hovered('"+slot+"')");
        
        txt += "<p>"+capitalize(slot)+": "+equipHover+"</p>";
      }
    }
    txt += "<h4>Consumed</h4>";
    for (let food in player.data.consumed) {
      let foodData = encyclopedia.items[food];
      let foodName = foodData.sho;
      let timer = time_expression(player.data.consumed[food]/10);
      let buffs = [];
      
      for (const stat in foodData.edible.stats){
        const bits = stat.split("_");
        const amount = foodData.edible.stats[stat];
        let buff = "";
        
        if (bits[0] === "add"){
          buff += "+"+amount;
        } else if (bits[0] === "mult"){
          buff += "+"+amount*100+"%";
        }
        
        buff += " to "+encyclopedia.stats[bits[2]].sho;
        
        if (bits[1] != "constant"){
          buff += " per "+encyclopedia.stats[bits[1]]+" you have";
        }
        
        buffs.push(buff);
      }
      
      txt += "<p>"+capitalize(foodName)+": "+qms(buffs)+" ("+timer+")</p>";
    }
    this.display.html(txt);
  },
  hovered(item){
    this.hovering = item;
    this.redraw(true);
  },
}

const settingsDisplay = {
  start(){
    this.display = $("#settings");
    this.display.html("<p>"+text_click("Hard Reset", "hardReset()")+"</p>"+
      "<p>"+text_click("Get debug items", "debug()")+"</p>");
  },
  redraw(force = false){
  },
}

// (danielnyan) Possible improvements: extract entryTxt and entryTitle to external file
const log = {
  start(){
    this.display = $("#log");
    this.height = 0;
    this.unread = 0;
  },
  clear() {
    // Might re-implement with a better method later
    this.display.empty();
    this.height = document.documentElement.scrollTop;
    this.unread = 0;
  },
  newLog(before){
    // Might deprecate because the logic is mostly implemented in log
    let entry = document.createElement("div");
    if (before){
      this.display.insertbefore(entry, before);
    } else {
      this.display.appendChild(entry);
    }
    return entry;
  },
  entryTxt(logType, details){
    let txt = "";
    let hex = player.currentHex();
    let itemData, buildingData;
    switch (logType){
      case "break": {
        let item = details.item;
        itemData = encyclopedia.itemData(item);
        return "The edge on "+itemData.sho+" has worn down to the point where you can't use it "
          "any more.  You'll need to find something to sharpen it with.";
      }
      case "build": {
        let name = hex.getName();
        let canbuilds = hex.canBuild(null, true);
        for (let i=0;i<canbuilds.length;i++){
          buildingData = encyclopedia.buildingData(canbuilds[i]);
          if (!buildingData) continue;
          let buildingName = add_a(buildingData.sho);
          let mats_array = [];
          for (let material in buildingData.materials){
            let numRequired = buildingData.materials[material];
            
            mats_array.push(shopping_list_item(material, numRequired));
          }
          if (hex.canBuild(canbuilds[i])){
            let buildLink = text_click(buildingName, "build('"+canbuilds[i]+"')");
            
            txt += "<p>"+buildLink+" - "+qms(mats_array)+"</p>";
          } else {
            txt += "<p>"+buildingName+" - "+qms(mats_array)+"</p>";
          }
        }
        if (!txt){
          txt = "<p>You look appraisingly over the area, but can't think of anything you could build with what you've got.</p>";
        } else {
          txt = "<p>You look appraisingly over the area.  There's space here for: </p>"+txt;
        }
        return txt;
      }
      case "built": {
        let building = details.building;
        let buildingName = encyclopedia.buildingData(building).sho;
        let enterLink = text_click(buildingName, "enter('"+building+"')");
        let hexName = hex.getName();
        
        return "Built a "+enterLink+" in "+hexName+".";
      }
      case "depleted": {
        let mushroom = details.mushroom;
        itemData = encyclopedia.itemData(mushroom);
        return "The area has run out of "+itemData.sho+". You may wait for them to replenish.";
      }
      case "eat": {
        let food = details.food;
        itemData = encyclopedia.itemData(food);
        if (itemData.edible.desc){
          return itemData.edible.desc;
        }
        return capitalize(itemData.sho)+" consumed.";
      }
      case "enter": {
        let building = details.building;
        buildingData = encyclopedia.buildingData(building);
        
        if (buildingData.crafting){
          let craftList = [];
          let craftTier = buildingData.crafting;
          let buildingInsufficient = false;
          
          for (let name in encyclopedia.crafting){
            let recipe = encyclopedia.crafting[name];
            
            for (let building in recipe.building){
              if (craftTier[building] < recipe[building]){
                buildingInsufficient = true;
                break;
              }
            }
            if (buildingInsufficient){
              continue;
            }
            
            let mats_array = [];
            for (let material in recipe.materials){
              let numRequired = recipe.materials[material];
              
              mats_array.push(shopping_list_item(material, numRequired));
            }
            if (player.i.canAfford(recipe.materials)){
              let craftLink = text_click(name, "craft('"+name+"','"+building+"')");
              
              craftList.push("<p>"+craftLink+" - "+qms(mats_array)+"<br>"+
                recipe.desc+"</p>");
            } else {
              craftList.push("<p>"+name+" - "+qms(mats_array)+"<br>"+
                recipe.desc+"</p>");
            }
          }
          
          txt = "<p>You can craft:</p>";
          if (craftList.length){
            txt += craftList.join("");
          } else {
            txt += "<p>Nothing.</p>";
          }
        }
        
        if (buildingData.research){
          let researchList = [];
          let researchTier = buildingData.research;
          let buildingInsufficient = false;
          
          for (let name in encyclopedia.research){
            if (player.data.researched[name] === encyclopedia.research[name].limit) {
              continue;
            }
            
            let recipe = encyclopedia.research[name];
            
            for (let building in recipe.building){
              if (researchTier[building] < recipe[building]){
                buildingInsufficient = true;
                break;
              }
            }
            if (buildingInsufficient){
              continue;
            }
            
            let mats_array = [];
            for (let material in recipe.materials){
              let numRequired = recipe.materials[material];
              
              mats_array.push(shopping_list_item(material, numRequired));
            }
            if (player.i.canAfford(recipe.materials)){
              researchLink = text_click(name, "research('"+name+"','"+building+"')");
              
              researchList.push("<p>"+researchLink+" ("+qms(mats_array)+")<br>"+recipe.desc+"</p>");
            } else {
              researchList.push("<p>"+name+" ("+qms(mats_array)+")<br>"+recipe.desc+"</p>");
            }
          }
          txt += "<p>You can research:</p>";
          if (researchList.length){
            txt += researchList.join("");
          } else {
            txt += "<p>Nothing.</p>";
          }
        }
        //todo: make sheds for storage
        return txt;
      }
      case "error": {
        const error = details.error;
        switch(error){
          case "itemdoesnotexist":
            return "That item doesn't exist.";
          case "needitem":
            let item = details.item;
            switch(item){
              case "boat":
                return "This part of the cave is flooded with dark, murky water. It's too deep to wade through - you'll need a boat of some sort.";
              case "light":
                return "The further reaches of this cave are filled with almost total darkness. You'll need a way to light it up.";
              default:
                itemData = encyclopedia.itemData(item);
                return "You need a "+itemData.sho+" to go this way.";
            }
          case "nomaterialstoeat": {
            let item = details.item;
            itemData = encyclopedia.itemData(item);
            return "You don't have any "+itemData.sho+" to "+itemData.edible.verb+".";
          }
          case "nomaterialstocraft":
            return "You do not have the materials to craft this item.";
          case "nomaterialstoresearch":
            return "You do not have the materials to perform this research.";
          case "oldbuild":
            return "You can't build that here.";
          case "oldenter":
            return "That building is not here.";
          case "read":
            return "You can't read that.";
          case "repairnoequip":
            return "You are not equipping anything.  Equip the item you want to repair.";
          case "repairfullbar":
            return "Your equipped tool does not require repairing.  Equip the item you want to repair.";
          case "researchcapped":
            return "This item is already at its maximum research level.";
          default:
            return "That action is currently invalid.";
        }
      }
      case "examine": {
        let thing = details.thing;
        itemData = encyclopedia.itemData(thing);
        txt = "<p>"+itemData.lon+"</p>";
        if (player.data.durability[thing]){
          let currentDura = player.data.durability[thing];
          let maxDura = itemData.durability;
          txt += "<p>Durability: "+currentDura+"/"+maxDura+"</p>";
        }
        if (details.discovered){
          txt += "<p>You decide to name the "+itemData.bsho+" \""+itemData.sho+"\".</p>";
        }
        return txt;
      }
      case "expire": {
        let item = details.item;
        itemData = encyclopedia.itemData(item);
        if (details.soon){
          return "The effects of "+itemData.sho+" will expire in 15 seconds.";
        } else {
          return "The effects of "+itemData.sho+" has expired.";
        }
      }
      case "fallback": {
        switch (details.reason){
          case "torch":
            return "Your light goes out.  Fumbling in the dark, you blunder around blindly until "+
              "you catch sight of light in the distance, then stumble in its direction until you "+
              "can see again.<br>"+
              "You've moved to "+hex.getName()+".";
          case "boat":
            return "With a quiet creak of protest, your raft comes apart into pieces.  You flail "+
              "in the rushing water, barely staying afloat until you manage to, by sheer luck, "
              "wash ashore.<br>"+
              "You've moved to "+hex.getName()+".";
          default:
            return "You've moved to "+hex.getName()+".";
        }
      }
      case "journal": {
        txt = "<p>You flip through your journal. ";
        if (player.data.discovered.length){
          txt += "You've discovered these mushrooms: "+qms(player.data.discovered.map(function(mushroom){
            let mushroomName = encyclopedia.itemData(mushroom).sho;
            let examineLink = text_click(mushroomName, "examine('loc', '"+mushroom+"')");
            
            return examineLink;
          }))
          txt += ".</p>";
        } else {
          txt += "You haven't discovered any mushrooms yet.</p>";
        }
        
        if (Object.keys(player.data.researched).length){
          txt += "You've researched these topics: "+qms(Object.keys(player.data.researched).map(function(topic){
            return player.data.researched[topic] == 1 ? topic : topic+" ("+player.data.researched[topic]+")"
          }))
          txt += ".</p>";
        } else
          txt += "You haven't completed any research yet.</p>";
        return txt;
      }
      case "look": {
        txt = "<p>"; //geographical features, eventually? also list of mushrooms
        let buildings = hex.getBuilding();
        let len = sizeof(buildings);
        if (!len) txt += "There aren't any buildings here.";
        else {
          if (len === 1) txt += "There is ";
          else txt += "There are ";
          let buildingnames = [];
          for (let building in buildings){
            let buildingName = encyclopedia.buildingData(building).sho;
            let enterLink = text_click(add_a(buildingName), "enter('"+building+"')");
            
            buildingnames.push(enterLink);
          }
          txt += qms(buildingnames)+" here.";
        }
        txt += "</p>";
        return txt;
      }
      case "repair": {
        itemData = encyclopedia.itemData(details.consumed);
        let equipData = encyclopedia.itemData(details.equip);
        
        return "You sit down and grind away at your "+equipData.sho+" for a while with a "+
          itemData.sho+".  When you're done, the "+equipData.sho+" is sharp enough to use "+
          "once again.";
      }
      case "research": {
        let research = details.research;
        let researchData = encyclopedia.research[research];
        if (research.completion) {
          if (typeof research.completion === "function"){
            return research.completion();
          } else if (typeof research.completion === "string"){
            let completeLog = research.completion;
            
            completeLog.replaceAll("$level$", player.data.researched[research]);
            
            return completeLog;
          } else {
            return completeLog;
          }
        } else {
          return capitalize(research)+" research level is increased to "+player.data.researched[research]+".";
        }
      }
      case "story": {
        let storyData = encyclopedia.stories[details.chapter];
        if (!storyData){
          return "Story data missing.";
        }
        return storyData.words;
      }
      case "travel": {
        return "You've arrived at your newest destination: "+hex.getName()+".";
      }
    }
  },
  entryTitle(logType, details){
    let hex = player.currentHex();
    let itemData, buildingData;
    switch (logType){
      case "build": {
        hex = player.currentHex();
        return hex.getName();
      }
      case "built": {
        let building = details.building;
        buildingData = encyclopedia.buildingData(building);
        return capitalize_all(buildingData.sho);
      }
      case "enter": {
        let building = details.building;
        buildingData = encyclopedia.buildingData(building);
        return text_click(capitalize_all(buildingData.sho), "enter('"+building+"')");
      }
      case "examine": {
        let thing = details.thing;
        itemData = encyclopedia.itemData(thing);
        if (details.discovered)
          return "Discovered: "+capitalize_all(itemData.sho);
        else
          return capitalize_all(itemData.sho);
      }
      case "fallback":
        return "Falling Back";
      case "journal":
        return "Journal";
      case "look": {
        hex = player.currentHex();
        return hex.getName();
      }
      case "travel":
        return "New Location";
      case "repair": {
        let equipData = encyclopedia.itemData(details.equip);
        return "Repaired "+capitalize_all(equipData.sho);
      }
      case "research":
        return "Research Completed";
      default:
        return null;
    }
  },
  entryHTML(logType, details){
    let title = this.entryTitle(logType, details);
    let txt = this.entryTxt(logType, details);
    let html = "";
    let date = new Date();
    
    if (title){
      html += "<p><span class=\"log-title\">"+title+"</span>";
    }
    html += "<span class=\"log-timestamp\">"+
      ("0"+date.getHours()).slice(-2)+":"+
      ("0"+date.getMinutes()).slice(-2)+"</span></p>";
    html += txt;
    return html;
  },
  //This returns an ID that's unique for the combination of the logType and the details.
  //  We use this to tell whether to replace old logs.
  uniqueID(logType, details){
    let id = logType;
    
    if (details){
      if (typeof details === "string" || typeof details === "number" || typeof details === "boolean"){
        id += "-"+details;
      } else if (typeof details === "object"){
        for (let key in details){
          id += "-"+key+":"+details[key];
        }
      }
    }
    
    return id;
  },
  log(logType, details){
    let uniqueID = this.uniqueID(logType, details);
    
    const existingEntry = $("[id='"+uniqueID+"']");
    // Clear out old entries with the same logType ID
    if (existingEntry) {
      existingEntry.hide(400, () => log.removeEntry(existingEntry));
    }
    const newEntry = $("<div></div>").html(this.entryHTML(logType, details));
    
    // You can't set id and class directly with jQuery. But, you can 
    // expose the DOM element using newEntry[0] and then set the id.
    newEntry.prop({id : uniqueID, class : "log-entry"});
    this.display.append(newEntry);
    
    // (not so) subtle animation
    // In jQuery, you can define your own custom events like how I'm doing here
    // This one only fires when the class and css are added.
    newEntry.on("new-entry-class-added", () => {
      newEntry.removeClass("new-entry");
    });
    
    newEntry.addClass("new-entry")
    newEntry.css({transition: "border 0.8s, box-shadow 0.8s"});
    // To do: fix race condition. There may be cases where 100ms may not be enough
    setTimeout(() => newEntry.trigger("new-entry-class-added"), 100);
    
    //Only autoscroll if they're already at the bottom.
    if ($(window).height()+$(document).scrollTop() >= this.height - 10){
      $("html, body").animate({
        scrollTop: $(document).height()
      }, 1000);
      this.unread = 0;
    } else {
      this.unread++;
    }
    this.height = $(document).height();
  },
  removeEntry(entry){
    entry.remove();
    //When a log entry is removed, the height of the log may shrink.
    //This makes sure that the recorded height of the log doesn't go over the actual height of the log.
    if (this.height > $(document).height())
      this.height = $(document).height();
  },
}

const popup = {
  start(){
    this.modal = document.getElementById('modal');
    this.modal.innerHTML = "<span class=\"close\" onclick=\"popup.hide()\">&times;</span>"+
      "<div id=\"modalText\" class=\"modal-content\"></div>";
    this.display = document.getElementById("modalText");
    
    //When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
      if (event.target === this.modal) {
        popup.hide();
      }
    }
  },
  show(txt){
    this.display.innerHTML = txt;
    this.modal.style.display = "block";
  },
  showMap() {
    // danielnyan: Stolen from dizzystem's initial minimap code from index.html
    this.display.innerHTML = "<table id='minimap-cont'><tr>   \
      <td><canvas id='minimap'></canvas></td>                 \
      <td><button onclick=\"zoom('+')\" class='btn'>          \
        <span class='glyphicon glyphicon-plus'></span>        \
      </button><hr><button onclick=\"zoom('-')\" class='btn'> \
        <span class=\"glyphicon glyphicon-minus\"></span>     \
      </button></td></tr></table>                             \
    ";
    $('#modalText').addClass('minimap');
    modal.style.display = 'block';
    map.start();
  },
  hide() {
    this.modal.style.display = "none";
    $('#modalText').removeClass('minimap');
  },
}

function drawingSetup(){
  actionDisplay.start();
  locationDisplay.start();
  rightTabs.start();
  inventoryDisplay.start();
  equipmentDisplay.start();
  settingsDisplay.start();
  log.start();
  popup.start();
  
  locationDisplay.redraw(true);
  inventoryDisplay.redraw(true);
  equipmentDisplay.redraw(true);
}

//=============================Click functions=============================
//(stuff triggered by clicking in the page)

//For building new buildings.
function build(thing){
  let hex = player.currentHex();
  if (thing){
    if (hex.canBuild(thing)){
      return player.doAction(new action("build", { thing : thing }));
    } else {
      return log.log("error", {error:"oldbuild"});
    }
  }
  log.log("build");
}

function craft(thing, building){
  let buildingData = encyclopedia.buildingData(building);
  let recipe = encyclopedia.crafting[thing];
  if (!player.i.canAfford(recipe.materials)){
    return log.log("error", {error:"nomaterialstocraft"});
  }
  return player.doAction(new action("craft", { thing : thing, building : building }));
}

function research(thing, building){
  let buildingData = encyclopedia.buildingData(building);
  let research = encyclopedia.research[thing];
  if (player.data.researched[thing] >= research.limit){
    return log.log("error", {error:"researchcapped"});
  }
  if (!player.i.canAfford(research.materials)){
    return log.log("error", {error:"nomaterialstoresearch"});
  }
  return player.doAction(new action("research", { thing : thing, building : building }));
}

//Todo: Implement "drop multi" and "drop all"
function drop(thing){
  if (world.moveItem(thing, player.i, player.currentHex().i, 1)){
    locationDisplay.redraw(true);
    inventoryDisplay.redraw(true);
  }
}

function eat(thing) {
  const itemData = encyclopedia.itemData(thing);
  const payment = {}
  payment[thing] = 1;
  
  if (!itemData || !itemData.edible){
    return log.log("error", {error:"itemdoesnotexist"});
  }
  if (!player.i.canAfford(payment)){
    return log.log("error", {error:"nomaterialstoeat", item:thing});
  }
  
  player.i.pay(payment);
  if (itemData.edible.stats && itemData.edible.duration){
    player.data.consumed[thing] = itemData.edible.duration * fps;
    player.recalculateStats();
  }
  if (itemData.edible.giveItem){
    player.i.award(itemData.edible.giveItem);
  }
  log.log("eat", {food:thing});
  inventoryDisplay.redraw(true);
}

//For entering building menus.
function enter(thing){
  if (!player.currentHex().getBuilding(thing)){
    log.log("error", {error:"oldenter"});
  }
  //todo: make sheds for storage
  log.log("enter", {building:thing});
}

function equip(thing){
  const type = encyclopedia.itemData(thing).type;
  if (!type){
    return;
  }
  const keywords = type.split("-");
  if (!keywords || keywords.length !== 2 || keywords[0] !== "equipment") {
    return;
  }
  const slot = keywords[1];
  const existingEquip = player.getEquip(slot);
  if (existingEquip) {
    player.i.adjInv(existingEquip, 1);
    player.setEquip(slot, null);
  }
  player.i.adjInv(thing, -1);
  player.setEquip(slot, thing);
  inventoryDisplay.redraw(true);
  equipmentDisplay.redraw(true);
}

function examine(where, thing){
  if (where === "loc" && player.discover(thing)){
    log.log("examine", {thing:thing, discovered:true});
    locationDisplay.redraw(true);
  } else {
    log.log("examine", {thing:thing});
  }
}

function gather(thing){
  player.doAction(new action("gather", { thing : thing }));
}

function get(thing){
  if (world.moveItem(thing, player.currentHex().i, player.i, 1)){
    locationDisplay.redraw(true);
    inventoryDisplay.redraw(true);
    let itemInfo = encyclopedia.itemData(thing);
    if (itemInfo && itemInfo.type === "equipment-tool") {
      if (!player.data.durability.hasOwnProperty(thing)) {
        player.data.durability[thing] = itemInfo.durability;
      }
    }
  }
}

function look(){
  log.log("look");
}

function read(thing){
  if (thing === "journal")
    log.log("journal");
  else
    log.log("error", {error:"read"});
}

function remove(thing) {
  const removedItem = player.getEquip(thing);
  player.i.adjInv(removedItem, 1);
  player.setEquip(thing, null);
  inventoryDisplay.redraw(true);
  equipmentDisplay.redraw(true);
}

function repair(consumed, force=true) {
  const equip = player.getEquip("tool");
  // Prevent repairs if tool isn't equipped, or if it's at full durability.
  if (equip === null) {
    log.log("error", {error:"repairnoequip"});
    return;
  }
  const equipData = encyclopedia.itemData(equip);
  if (player.data.durability[equip] === encyclopedia.itemData(equip).durability) {
    log.log("error", {error:"repairfullbar"});
    return;
  }
  // Adds durability to the tool by fetching the repair attribute of the 
  // item consumed. Note that the tool's durability can't exceed its default value.
  const itemInfo = encyclopedia.itemData(consumed);
  player.data.durability[equip] += itemInfo.repair;
  if (player.data.durability[equip] > encyclopedia.itemData(equip).durability) {
    player.data.durability[equip] = encyclopedia.itemData(equip).durability;
  }
  player.i.adjInv(consumed, -1);
  player.recalculateStats();
  log.log("repair", {"consumed" : consumed, "equip" : equip});
  inventoryDisplay.redraw(force);
  equipmentDisplay.redraw(force);
}

function playIntro(){
  log.log("story", {chapter : "intro"})
}

function showMap(){
  popup.showMap();
}

function stopAction(){
  player.data.action = null;
  actionDisplay.redraw(true);
}

function zoom(str){
  switch(str){
    case "+":
      map.zoom(10);
      break;
    case "-":
      map.zoom(-10);
      break;
  }
}

function hardReset(){
  if (confirm("Are you sure you want to delete all your save data and start over?")){
    localStorage.removeItem("caveofmushrooms");
    location.reload();
  }
}

function debug(){
  player.i.award({
    pickedblueleaf : 20,
    wisdomSandwich : 500,
    moongillPowder : 5,
    moongillierPowder : 500,
    repairShroom : 100,
    mushroomKnife : 1,
    blueleafHat : 1
  });
  inventoryDisplay.redraw(force);
}