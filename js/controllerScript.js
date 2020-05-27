//=========================Text formatting functions=====================
function pluralize(str){
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
  return str.replace(/\b\w/g, function(l){ return l.toUpperCase() });
}
function queryNum (integer, precise){
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
  
  mapX : function(xcoord){ return xcoord * this.mapZoom + this.canvas.width/2 },
  mapY : function(ycoord){ return ycoord * this.mapZoom + this.canvas.height/3.2 },
  
  //Args are for the topmost point of the hexagon.
  drawHex : function (hx, hy){
    let xcoord = hx - player.getX() + (hy - player.getY())/2;
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
      const deg = Math.PI/6 + i * Math.PI/3;
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
    const dy = cx/2 + cy*Math.sqrt(3)/2;
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
      switch(action.name){
        case "build":
          txt = "You are building a "+encyclopedia.buildingData(details.thing).sho+". ";
        break;
        case "craft":
          txt = "You are crafting "+details.thing+". ";
        break;
        case "gather":
          txt = "You are gathering "+encyclopedia.itemData(details.thing).plu+". ";
        break;
        case "research":
          txt = "You are researching "+details.thing+". ";
        break;
        case "travel":
          txt = "You are travelling to "+world.getHex(player.getX()+details.x, player.getY()+details.y).id+". ";
        break;
      }
      const actionTimer = (action.required - action.progress) / player.actionSpeed;
      txt += "("+Math.ceil(actionTimer/10)+")";
      this.progressBackground.css({display:"block"});
      let progress = action.progress / action.required * 100;
      if (progress > 100) {
        progress = 100;
      } else if (progress < 0) {
        progress = 0;
      }
      this.progressBar.css({width:progress + "%"});
    }
    this.display.html(txt);
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
      txt += "<a onmouseover='locationDisplay.hovered(\""+item+"\")'>"+name+"</a>";
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
      txt = "<p><h3><a onmouseover='locationDisplay.hovered(\"hex\")'>"+hex.getName()+"</a></h3></p>";
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
    $('#' + tabName).css({display : "block"}).addClass("active");
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
    this.equipDisplay.html("<h4>Equipment</h4>");
    this.itemDisplay.html("<h4>Items</h4>");
    
    const inv = player.i.getInv();
    for (let item in inv) {
      if (!inv[item]) continue;
      const data = encyclopedia.itemData(item);
      const name = inv[item]>1 ? data.plu : data.sho;
      const textObject = $("<p></p>").html("You have "+queryNum(inv[item]) + " ");
      if (this.hovering === item) {
        const actionsHtml = encyclopedia.actionsFor(item, data, "inv")
        textObject.html(textObject.html() + name + " " + actionsHtml);
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
        const durability = Math.ceil(player.durability[item] * 100 / itemData.durability);
        displayText += " (" + durability + "%)";
      }
      
      //todo: make equipment align right, using spans or something
      if (this.hovering === slot){
        txt += "<p>"+capitalize(slot)+": "+displayText+" (<a onclick='remove(\""+slot+"\")'>remove</a>)</p>";
      } else {
        txt += "<p>"+capitalize(slot)+": <a onmouseover='equipmentDisplay.hovered(\""+slot+"\")'>"+displayText+"</a></p>";
      }
    }
    txt += "<h4>Consumed</h4>";
    for (let food in player.consumed) {
      let foodName = encyclopedia.items[food].sho;
      txt += "<p>"+ capitalize(foodName)+": (" + player.consumed[food]/10 + ")</p>";
    }
    this.display.html(txt);
  },
  hovered(item){
    this.hovering = item;
    this.redraw(true);
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
  entryTxt(unique, details){
    let bits = unique.split("-");
    let txt = "";
    let hex = player.currentHex();
    let thing, buildingData;
    switch (bits[0]){
      case "break": {
        thing = bits[1];
        let data = encyclopedia.itemData(thing);
        return "Your " + data.sho + " broke. You won't be able to use it until it is repaired.";
      }
      case "build":
        let name = hex.getName();
        let canbuilds = hex.canBuild(null, true);
        for (let i=0;i<canbuilds.length;i++){
          buildingData = encyclopedia.buildingData(canbuilds[i]);
          if (!buildingData) continue;
          let buildingname = add_a(buildingData.sho);
          let mats = [];
          for (let material in buildingData.materials){
            let itemData = encyclopedia.itemData(material);
            if (!itemData) mats.push(buildingData.materials[material]+"x ??? ("+material+")");
            mats.push(buildingData.materials[material]+"x "+itemData.sho);
          }
          if (hex.canBuild(canbuilds[i])){
            txt += "<p><a onclick=\"build('"+canbuilds[i]+"')\">"+buildingname+"</a> ("+qms(mats)+")</p>";
          } else {
            txt += "<p>"+buildingname+" ("+qms(mats)+")</p>";
          }
        }
        if (!txt){
          txt = "<p>You look appraisingly over the area, but can't think of anything you could build with what you've got.</p>";
        } else {
          txt = "<p>You look appraisingly over the area.  There's space here for: </p>" + txt;
        }
        return txt;
      case "built":
        thing = bits[1];
        buildingData = encyclopedia.buildingData(thing);
        return "Built a <a onclick=\"enter('"+thing+"')\">"+buildingData.sho+"</a> in "+hex.getName()+".";
      case "depleted": {
        thing = bits[1]
        let data = encyclopedia.itemData(thing);
        return "The area has run out of " + data.sho + ". You may wait for them to replenish.";
      }
      case "eat": {
        thing = bits[1];
        let data = encyclopedia.itemData(thing);
        return capitalize(data.sho) + " consumed.";
      }
      case "enter":
        thing = bits[1];
        buildingData = encyclopedia.buildingData(thing);
        if (buildingData.recipes){
          txt += "<p>You can craft:</p>";
          let recipes = buildingData.recipes;
          for (let name in recipes){
            let mats = [];
            let recipe = recipes[name];
            for (let material in recipe.materials){
              mats.push(recipe.materials[material]+" "+encyclopedia.itemData(material).sho);
            }
            if (player.i.canAfford(recipe.materials)){
              txt += "<p><a onclick=\"craft('"+name+"','"+thing+"')\">"+name+"</a> ("+qms(mats)+")<br>"+recipe.desc+"</p>";
            } else {
              txt += "<p>"+name+" ("+qms(mats)+")<br>"+recipe.desc+"</p>";
            }
          }
        }
        if (buildingData.research){
          txt += "<p>You can research:</p>";
          let research = buildingData.research;
          for (let name in research){
            if (player.researched[name] === research[name].limit) {
              continue;
            }
            let mats = [];
            let recipe = research[name];
            for (let material in recipe.materials){
              mats.push(recipe.materials[material]+" "+encyclopedia.itemData(material).sho);
            }
            if (player.i.canAfford(recipe.materials)){
              txt += "<p><a onclick=\"research('"+name+"','"+thing+"')\">"+name+"</a> ("+qms(mats)+")<br>"+research[name].desc+"</p>";
            } else {
              txt += "<p>"+name+" ("+qms(mats)+")<br>"+research[name].desc+"</p>";
            }
          }
        }
        //todo: make sheds for storage
        return txt;
      case "error":
        switch(bits.length > 1 ? bits[1] : null){
          case "needitem":
            if (bits.length < 2){
              return "You don't have the necessary equipment to go this way.";
            }
            const item = bits[2];
            switch(item){
              case "boat":
                return "This part of the cave is flooded with dark, murky water. It's too deep to wade through - you'll need a boat of some sort.";
              case "light":
                return "The further reaches of this cave are filled with almost total darkness. You'll need a way to light it up.";
              default:
                const itemData = encyclopedia.itemData(item);
                return "You need a "+itemData.sho+" to go this way.";
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
            return "You are not equipping anything. Equip the item you want to repair.";
          case "repairfullbar":
            return "Your equipped tool does not require repairing. Equip the item you want to repair.";
          case "researchcapped":
            return "This item is already at its maximum research level.";
          default:
            return "That action is currently invalid.";
        }
      case "examine": {
        thing = bits[1];
        let data = encyclopedia.itemData(thing);
        txt = "<p>"+data.lon+"</p>";
        if (details === "discover"){
          txt += "<p>You decide to name the "+data.bsho+" \""+data.sho+"\".</p>";
        }
        return txt;
      }
      case "expire": {
        thing = bits[1];
        let data = encyclopedia.itemData(thing);
        return "The effects of " + data.sho + " has expired.";
      }
      case "expiresoon": {
        thing = bits[1];
        let data = encyclopedia.itemData(thing);
        return "The effects of " + data.sho + " will expire in 15 seconds.";
      }
      case "fallback": 
        switch (details.reason) {
          case "torch":
            return "You ran out of light, so you are forced to retreat to " + hex.getName() + ".";
          case "boat":
            return "Your boat broke, so you have been washed away to " + hex.getName() + ".";
          default:
            return "You can no longer stay in this area. Falling back to " + hex.getName() + ".";
        }
      case "journal":
        txt = "<p>You flip through your journal. ";
        if (player.discovered.length){
          txt += "You've discovered these mushrooms: "+qms(player.discovered.map(function(mushroom){
            return "<a onclick=\"examine('loc', '"+mushroom+"')\">"+encyclopedia.itemData(mushroom).sho+"</a>"
          }))
          txt += ".</p>";
        } else
          txt += "You haven't discovered any mushrooms yet.</p>";
        if (Object.keys(player.researched).length){
          txt += "You've researched these topics: "+qms(Object.keys(player.researched).map(function(topic){
            return player.researched[topic] == 1 ? topic : topic+" ("+player.researched[topic]+")"
          }))
          txt += ".</p>";
        } else
          txt += "You haven't completed any research yet.</p>";
        return txt;
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
            buildingnames.push("<a onclick=\"enter('"+building+"')\">"+add_a(encyclopedia.buildingData(building).sho)+"</a>");
          }
          txt += qms(buildingnames)+" here.";
        }
        txt += "</p>";
        return txt;
      }
      case "repair": {
        let data = encyclopedia.itemData(details.consumed);
        let equipData = encyclopedia.itemData(details.equip);
        return "You've used a " + data.sho + " to repair your " + equipData.sho + ".";
      }
      case "research": {
        if (details.research.completion) {
          return details.research.completion;
        } else {
          return capitalize(bits[1]) + " research level is increased to " + details.player.researched[bits[1]] + "."
        }
      }
      case "travel":
        return "You've arrived at your newest destination: " + hex.getName() + ".";
    }
  },
  entryTitle(unique, details){
    let bits = unique.split("-");
    let hex = player.currentHex();
    let buildingData;
    switch (bits[0]){
      case "break": {
        thing = bits[1];
        let data = encyclopedia.itemData(thing);
        return "Equipment Broken: " + capitalize(data.sho);
      }
      case "build":
        hex = player.currentHex();
        return hex.getName();
      case "built":
        buildingData = encyclopedia.buildingData(bits[1]);
        return capitalize(buildingData.sho);
      case "depleted": {
        let data = encyclopedia.itemData(bits[1]);
        return "Depleted: " + capitalize(data.sho);
      }
      case "eat": {
        return "Item Consumed";
      }
      case "enter":
        buildingData = encyclopedia.buildingData(bits[1]);
        return capitalize(buildingData.sho);
      case "error":
        return null;
      case "examine": {
        let data = encyclopedia.itemData(bits[1]);
        if (details === "discover")
          return "Discovered: "+capitalize(data.sho);
        else
          return capitalize(data.sho);
      }
      case "expire": {
        thing = bits[1];
        let data = encyclopedia.itemData(thing);
        return "Expired: " + capitalize(data.sho); 
      }
      case "expiresoon": {
        thing = bits[1];
        let data = encyclopedia.itemData(thing);
        return "Expiring Soon: " + capitalize(data.sho);
      }
      case "fallback":
        return "Falling Back";
      case "journal":
        return "Journal";
      case "look":
        hex = player.currentHex();
        return hex.getName();
      case "travel":
        return "New Location";
      case "repair": {
        let equipData = encyclopedia.itemData(details.equip);
        return "Equipment Repaired: " + capitalize(equipData.sho);
      }
      case "research": {
        return "Research Complete: " + capitalize(bits[1]);
      }
      default:
        return null;
    }
  },
  entryHTML(unique, details){
    let title = this.entryTitle(unique, details);
    let txt = this.entryTxt(unique, details);
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
  log(unique, details){
    const existingEntry = $("[id=" + unique+"]");
    // Clear out old entries with the same unique ID
    if (existingEntry) {
      existingEntry.hide(400, () => log.removeEntry(existingEntry));
    }
    const newEntry = $("<div></div>").html(this.entryHTML(unique, details));
    // You can't set id and class directly with jQuery. But, you can 
    // expose the DOM element using newEntry[0] and then set the id.
    newEntry.prop({id : unique, class : "log-entry"});
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
    if ($(window).height() + $(document).scrollTop() >= this.height - 10){
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
      return log.log("error-oldbuild");
    }
  }
  log.log("build");
}

function craft(thing, building){
  let buildingData = encyclopedia.buildingData(building);
  let recipe = buildingData.recipes[thing];
  if (!player.i.canAfford(recipe.materials)){
    return log.log("error-nomaterialstocraft");
  }
  return player.doAction(new action("craft", { thing : thing, building : building }));
}

function research(thing, building){
  let buildingData = encyclopedia.buildingData(building);
  let research = buildingData.research[thing];
  if (player.researched[thing] >= research.limit){
	return log.log("error-researchcapped");
  }
  if (!player.i.canAfford(research.materials)){
    return log.log("error-nomaterialstoresearch");
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
  const itemData = encyclopedia.itemData(thing)
  if (!itemData || itemData.duration === undefined) {
    return;
  }
  const type = itemData.type;
  if (itemData.duration) {
    player.consumed[thing] = itemData.duration * fps;
    player.recalculateStats();
  }
  player.i.adjInv(thing, -1);
  log.log("eat-" + thing);
  inventoryDisplay.redraw(true);
}

//For entering building menus.
function enter(thing){
  if (!player.currentHex().getBuilding(thing)){
    log.log("error-oldenter");
  }
  //todo: make sheds for storage
  log.log("enter-"+thing);
}

function equip(thing) {
  const type = encyclopedia.itemData(thing).type;
  if (!type) {
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
    log.log("examine-"+thing, "discover");
    locationDisplay.redraw(true);
  } else {
    log.log("examine-"+thing);
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
      if (!player.durability.hasOwnProperty(thing)) {
        player.durability[thing] = itemInfo.durability;
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
    log.log("error-read");
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
    log.log("error-repairnoequip");
    return;
  }
  const equipData = encyclopedia.itemData(equip);
  if (player.durability[equip] === encyclopedia.itemData(equip).durability) {
    log.log("error-repairfullbar");
    return;
  }
  // Adds durability to the tool by fetching the repair attribute of the 
  // item consumed. Note that the tool's durability can't exceed its default value.
  const itemInfo = encyclopedia.itemData(consumed);
  player.durability[equip] += itemInfo.repair;
  if (player.durability[equip] > encyclopedia.itemData(equip).durability) {
    player.durability[equip] = encyclopedia.itemData(equip).durability;
  }
  player.i.adjInv(consumed, -1);
  player.recalculateStats();
  log.log("repair", {"consumed" : consumed, "equip" : equip});
  inventoryDisplay.redraw(force);
  equipmentDisplay.redraw(force);
}

function showMap() {
  popup.showMap();
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