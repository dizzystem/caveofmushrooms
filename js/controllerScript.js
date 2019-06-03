//=========================Text formatting functions=====================
function pluralize(str){
  switch (str[str.length-1]){
    case "f":
      return str.slice(0, str.length-1)+"ves";
    case "y":
      return str.slice(0, str.length-1)+"ies";
    case "s":
      return str+"es";
  }
  return str+"s";
}
function capitalize(str){
  //stolen off stackoverflow
  return str.replace(/\b\w/g, function(l){ return l.toUpperCase() });
}
function queryNum (integer, precise){
  if (integer == 0){
    return "no";
  }
  if (integer == 1){
    return "a";
  }
  return integer;
}
function qms(array){
  var len = array.length;
  if (!len) return "";
  if (len == 1) return array[0];
  return array.slice(0, len-1).join(", ")+" and "+array[len-1];
}
function add_a(word){
  var letter = word[0];
  if (letter == "a" || letter == "e" || letter == "i" || letter == "o" || letter == "u"){
    return "an "+word;
  }
  return "a "+word;
}
function sizeof(ob){
  var size = 0;
  for (var att in ob){
    size ++;
  }
  return size;
}

//============================Display objects=============================
var map = {
  start : function(){
    this.mapZoom = 100;
    this.shown = true;
    this.canvas = document.getElementById("minimap");
    this.cont = document.getElementById("minimap-cont");
    this.canvas.width = 300;
    this.canvas.height = 300;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.fillStyle = "#333333";
    //this.interval = setInterval(redrawMinimap, 100);
    this.canvas.addEventListener("click", this.clicked);
    this.redraw();
  },
  
  mapX : function(xcoord){ return xcoord * this.mapZoom + this.canvas.width/2 },
  mapY : function(ycoord){ return ycoord * this.mapZoom + this.canvas.height/3.2 },
  
  //Args are for the topmost point of the hexagon.
  drawHex : function (hx, hy){
    var xcoord = hx - player.getX() + (hy - player.getY())/2;
    var ycoord = (hy - player.getY()) * Math.sqrt(3)/2;
    var hex = world.getHex(hx, hy);
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
    for (var i=0;i<6;i++){
      var deg = Math.PI/6 + i * Math.PI/3;
      xcoord += Math.cos(deg) * Math.sqrt(3)/3;
      ycoord += Math.sin(deg) * Math.sqrt(3)/3;
      this.ctx.lineTo(this.mapX(xcoord), this.mapY(ycoord));
    }
    //Fill in with colour and label if it's discovered.
    if (hex.discovered){
      this.ctx.fillStyle = hex.colour;
      this.ctx.fill();
      this.ctx.font = (this.mapZoom/5)+"px Arial";
      if (hx == player.getX() && hy == player.getY()){
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
  
  redraw : function(){
    //todo: a "hide map" button
    this.cont.style.display = '';
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (var i=0;i<world.hexes.length;i++){
      for (var j=0;j<world.hexes[0].length;j++){
        this.drawHex(j, i);
      }
    }
  },

  //"this" refers to the canvas because of addEventListener
  clicked : function (mouseEvent){
    //Click position.
    var cx = mouseEvent.offsetX - this.width/2;
    var cy = mouseEvent.offsetY - this.height/2;
    //Translation into hex axes.
    var dx = cx;
    var dy = cx/2 + cy*Math.sqrt(3)/2;
    var dz = cx/2 - cy*Math.sqrt(3)/2;
    //Resulting movement.
    var mx, my;
    var dmax = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz));
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
    if (!world.getHex(player.getX()+mx, player.getY()+my)){
      return;
    }
    player.doAction(new action("travel", { x : mx, y : my }));
  },
  
  zoom : function (adj){
    this.mapZoom += adj;
    if (this.mapZoom < 50) this.mapZoom = 50;
    if (this.mapZoom > 150) this.mapZoom = 150;
    this.redraw();
  }
}

var actionDisplay = {
  start : function(){
    this.display = document.getElementById("actionDisplay");
  },
  redraw : function(){
    var action = player.currentAction();
    var txt;
    if (!action) txt = "";
    else {
      var details = action.details;
      switch(action.name){
        case "travel":
          txt = "You are travelling to "+world.getHex(player.getX()+details.x, player.getY()+details.y).id+". ";
        break;
        case "gather":
          txt = "You are gathering "+encyclopedia.itemData(details.thing).plu+". ";
        break;
        case "build":
          txt = "You are building a "+encyclopedia.buildingData(details.thing).sho+". ";
        break;
        case "craft":
          txt = "You are crafting "+details.thing+". ";
        break;
      }
      txt += "("+Math.ceil(action.timer/10)+")";
    }
    this.display.innerHTML = txt;
  },
}

var locationDisplay = {
  start : function(){
    this.display = document.getElementById("locationDisplay");
    this.hovering = null;
  },
  txtFor : function(item){
    var num = player.currentHex().i.getInv(item);
    var data = encyclopedia.itemData(item);
    var numword = queryNum(num);
    var name = num>1 ? data.plu : data.sho;
    var pos = "on the ground";
    if (data.type == "living-mushroom"){
      numword = "some";
      if (!player.hasDiscovered(item)){
        name = num>1 ? data.bplu : data.bsho;
      }
      pos = "growing";
    }
    var txt = "<p id='location "+item+"'>There "+(num==1 ? "is" : "are")+" "+numword+" ";
    if (this.hovering == item){
      txt += name+" "+encyclopedia.actionsFor(item, data, "loc");
    } else {
      txt += "<a onmouseover='locationDisplay.hovered(\""+item+"\")'>"+name+"</a>";
    }
    txt += " "+pos+" here.</p>";
    return txt;
  },
  redraw : function(){
    var hex = player.currentHex();
    var inv = hex.i.getInv();
    var txt;
    if (this.hovering == "hex"){
      txt = "<p><h3>"+hex.getName()+"</h3> "+encyclopedia.actionsFor(hex, null, "world")+"<p>";
    } else {
      txt = "<p><h3><a onmouseover='locationDisplay.hovered(\"hex\")'>"+hex.getName()+"</a></h3></p>";
    }
    for (item in inv){
      if (!inv[item]) continue;
      txt += this.txtFor(item);
    }
    this.display.innerHTML = txt;
  },
  hovered : function(item){
    this.hovering = item;
    this.redraw();
  },
}

var rightTabs = {
  start : function(){
    this.openTab(0, "inventory");
  },
  openTab : function(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (var i=0;i<tabcontent.length;i++) {
      tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i=0;i<tablinks.length;i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    if (evt){
      evt.currentTarget.className += " active";
    }
  }
}

var inventoryDisplay = {
  start : function(){
    this.display = document.getElementById("inventory");
    this.hovering = null;
  },
  redraw : function(){
    var inv = player.i.getInv();
    var txt = "";
    for (item in inv){
      if (!inv[item]) continue;
      var data = encyclopedia.itemData(item);
      var name = inv[item]>1 ? data.plu : data.sho;
      txt += "<p>You have "+queryNum(inv[item])+" ";
      if (this.hovering == item){
        txt += name+" "+encyclopedia.actionsFor(item, data, "inv");
      } else {
        txt += "<a onmouseover='inventoryDisplay.hovered(\""+item+"\")'>"+name+"</a>";
      }
      txt += ".</p>";
    }
    this.display.innerHTML = txt;
  },
  hovered : function(item){
    this.hovering = item;
    this.redraw();
  },
}

var equipmentDisplay = {
  start : function(){
    this.display = document.getElementById("equipment");
    this.hovering = null;
  },
  redraw : function(){
    var equipment = player.getEquip();
    var txt = "";
    for (slot in equipment){
      var item = equipment[slot];
      if (!item) continue;
      var itemData = encyclopedia.itemData(item);
      if (!itemData) continue;
      
      //todo: make equipment align right, using spans or something
      //more todo: make equipped items be placed first in inventory with a tag
      if (this.hovering == slot){
        txt += "<p>"+capitalize(slot)+": "+itemData.sho+" (<a onclick='remove(\""+slot+"\")'>remove</a>)</p>";
      } else {
        txt += "<p>"+capitalize(slot)+": <a onmouseover='equipmentDisplay.hovered(\""+slot+"\")'>"+itemData.sho+"</a></p>";
      }
    }
    this.display.innerHTML = txt;
  },
  hovered : function(item){
    this.hovering = item;
    this.redraw();
  },
}

var log = {
  start : function(){
    this.display = document.getElementById("log");
    this.height = 0;
    this.unread = 0;
    this.entries = [];
  },
  redraw : function(){
    //entries is the actual list of html nodes in the html log
    //this.entries is the stored list of unique ids that should be shown in the log
    //this function syncs the first up with the second
    let entries = this.display.children;
    for (var i=0;i<entries.length || i<this.entries.length;i++){
      if (this.entries.length <= i){
        this.display.removeChild(entries[i]);
        continue;
      } else if (entries.length <= i){
        this.newLog();
        entries = this.display.children;
      }
      
      if (entries[i].id != this.entries[i]){
        if (entries.length > i+1 && 
            entries[i+1].id == this.entries[i].id){
          //Insertion in entries wrt this.entries.
          this.display.removeChild(entries[i]);
          entries = this.display.children;
        } else if (this.entries.length > i+1 && 
            this.entries[i+1].id == entries[i].id){
          //Deletion in entries wrt this.entries.
          this.writeEntry(this.newLog(entries[i]), this.entries[i].id, this.entries[i].details);
          entries = this.display.children;
        } else {
          //Default write to entry, in non-insertion/nondeletion cases.
          this.writeEntry(entries[i], this.entries[i].id, this.entries[i].details);
        }
        continue;
      }
      
      if (this.entries.length == i+1){
        //This is the last entry.  Always rewrite.
        this.writeEntry(entries[i], this.entries[i].id, this.entries[i].details);
      }
    }
  },
  newLog : function(before){
    var entry = document.createElement("div");
    if (before){
      this.display.insertbefore(entry, before);
    } else {
      this.display.appendChild(entry);
    }
    return entry;
  },
  entryTxt : function(unique, details){
    var bits = unique.split("-");
    var txt = "";
    switch (bits[0]){
      case "build":
        var hex = player.currentHex();
        var name = hex.getName();
        var canbuilds = hex.canBuild(null, true);
        for (var i=0;i<canbuilds.length;i++){
          var buildingData = encyclopedia.buildingData(canbuilds[i]);
          if (!buildingData) continue;
          var buildingname = add_a(buildingData.sho);
          var mats = [];
          for (var material in buildingData.materials){
            var itemData = encyclopedia.itemData(material);
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
        var thing = bits[1];
        var buildingData = encyclopedia.buildingData(thing);
        var hex = player.currentHex();
        return "Built a <a onclick=\"enter('"+thing+"')\">"+buildingData.sho+"</a> in "+hex.getName()+".";
      case "enter":
        var thing = bits[1];
        var buildingData = encyclopedia.buildingData(thing);
        if (buildingData.recipes){
          txt += "<p>Actions:</p>";
          var recipes = buildingData.recipes;
          for (var name in recipes){
            var mats = [];
            var recipe = recipes[name];
            for (var material in recipe.materials){
              mats.push(recipe.materials[material]+" "+encyclopedia.itemData(material).sho);
            }
            if (player.i.canAfford(recipe.materials)){
              txt += "<p><a onclick=\"craft('"+name+"','"+thing+"')\">"+name+"</a> ("+qms(mats)+")</p>";
            } else {
              txt += "<p>"+name+" ("+qms(mats)+")</p>";
            }
          }
        }
        //todo: make sheds for storage
        return txt;
      case "error":
        switch(bits.length > 1 ? bits[1] : null){
          case "nomaterials":
            return "You do not have the materials to craft this item.";
          case "oldbuild":
            return "You can't build that here.";
          case "oldenter":
            return "That building is not here.";
          case "read":
            return "You can't read that.";
          default:
            return "That action is currently invalid.";
        }
      case "examine":
        var thing = bits[1];
        var data = encyclopedia.itemData(thing);
        txt = "<p>"+data.lon+"</p>";
        if (details == "discover"){
          txt += "<p>You decide to name the "+data.bsho+" \""+data.sho+"\".</p>";
        }
        return txt;
      case "journal":
        txt = "<p>You flip through your journal. ";
        if (player.discovered.length){
          txt += "You've discovered these mushrooms: "+qms(player.discovered.map(function(mushroom){
              return "<a onclick=\"examine('loc', '"+mushroom+"')\">"+encyclopedia.itemData(mushroom).sho+"</a>"
            }))
          txt += ".</p>";
        } else
          txt += "You haven't discovered any mushrooms yet.</p>";
        return txt;
      case "look":
        txt = "<p>"; //geographical features, eventually? also list of mushrooms
        var hex = player.currentHex();
        var buildings = hex.getBuilding();
        var len = sizeof(buildings);
        if (!len) txt += "There aren't any buildings here.";
        else {
          if (len == 1) txt += "There is ";
          else txt += "There are ";
          var buildingnames = [];
          for (var building in buildings){
            buildingnames.push("<a onclick=\"enter('"+building+"')\">"+add_a(encyclopedia.buildingData(building).sho)+"</a>");
          }
          txt += qms(buildingnames)+" here.";
        }
        txt += "</p>";
        return txt;
    }
  },
  entryTitle : function(unique, details){
    var bits = unique.split("-");
    switch (bits[0]){
      case "build":
        var hex = player.currentHex();
        return hex.getName();
      case "built":
        var buildingData = encyclopedia.buildingData(bits[1]);
        return capitalize(buildingData.sho);
      case "enter":
        var buildingData = encyclopedia.buildingData(bits[1]);
        return capitalize(buildingData.sho);
      case "error":
        return null;
      case "examine":
        var data = encyclopedia.itemData(bits[1]);
        if (details == "discover")
          return "Discovered: "+capitalize(data.sho);
        else
          return capitalize(data.sho);
      case "journal":
        return "Journal";
      case "look":
        var hex = player.currentHex();
        return hex.getName();
      default:
        return null;
    }
  },
  entryHTML : function(unique, details){
    var title = this.entryTitle(unique, details);
    var txt = this.entryTxt(unique, details);
    var html = "";
      
    var date = new Date();
    var html = "";
    if (title){
      html += "<p><span class=\"log-title\">"+title+"</span>";
    }
    html += "<span class=\"log-timestamp\">"+
      ("0"+date.getHours()).slice(-2)+":"+
      ("0"+date.getMinutes()).slice(-2)+"</span></p>";
    html += txt;
    return html;
  },
  writeEntry : function(ele, unique, details){
    ele.innerHTML = this.entryHTML(unique, details);
    ele.id = unique;
    ele.className = "log-entry";
  },
  log : function(unique, details){
    var oldind = 999;
    //Clear out old entries with the same unique id.
    this.entries = this.entries.filter(function(entry){ return entry.id != unique; });
    
    this.entries.push({ id : unique, details : details });
    this.redraw();
    //todo: maybe a subtle animation when an entry is redrawn
    
    if (document.documentElement.scrollTop >= this.height){
      //Only autoscroll if they're already at the bottom.
      this.display.lastChild.scrollIntoView();
      this.height = document.documentElement.scrollTop;
    } else {
      this.unread++;
    }
  },
}

var popup = {
  start : function(){
    this.modal = document.getElementById('modal');
    this.modal.innerHTML = "<span class=\"close\" onclick=\"popup.hide()\">&times;</span>"+
      "<div id=\"modalText\" class=\"modal-content\"></div>";
    this.display = document.getElementById("modalText");
    
    //When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
      if (event.target == this.modal) {
        popup.hide();
      }
    }
  },
  show : function(txt){
    this.display.innerHTML = txt;
    this.modal.style.display = "block";
  },
  hide : function(){
    this.modal.style.display = "none";
  },
}

function drawingSetup(){
  map.start();
  actionDisplay.start();
  locationDisplay.start();
  rightTabs.start();
  inventoryDisplay.start();
  equipmentDisplay.start();
  log.start();
  popup.start();
  
  locationDisplay.redraw();
  inventoryDisplay.redraw();
  equipmentDisplay.redraw();
}

//=============================Click functions=============================
//(stuff triggered by clicking in the page)

//For building new buildings.
function build(thing){
  var hex = player.currentHex();
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
  var buildingData = encyclopedia.buildingData(building);
  var recipe = buildingData.recipes[thing];
  if (!player.i.canAfford(recipe.materials)){
    return log.log("error-nomaterials");
  }
  return player.doAction(new action("craft", { thing : thing, building : building }));
}

//Todo: Implement "drop multi" and "drop all"
function drop(thing){
  if (world.moveItem(thing, player.i, player.currentHex().i, 1)){
    locationDisplay.redraw();
    inventoryDisplay.redraw();
  }
}

//For entering building menus.
function enter(thing){
  if (!player.currentHex().getBuilding(thing)){
    log.log("error-oldenter");
  }
  //todo: make sheds for storage
  log.log("enter-"+thing);
}

function examine(where, thing){
  if (where == "loc" && player.discover(thing)){
    log.log("examine-"+thing, "discover");
    locationDisplay.redraw();
  } else {
    log.log("examine-"+thing);
  }
}

function gather(thing){
  player.doAction(new action("gather", { thing : thing }));
}

function get(thing){
  if (world.moveItem(thing, player.currentHex().i, player.i, 1)){
    locationDisplay.redraw();
    inventoryDisplay.redraw();
  }
}

function look(){
  log.log("look");
}

function read(thing){
  if (thing == "journal")
    log.log("journal");
  else
    log.log("error-read");
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