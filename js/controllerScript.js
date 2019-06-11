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
  let len = array.length;
  if (!len) return "";
  if (len == 1) return array[0];
  return array.slice(0, len-1).join(", ")+" and "+array[len-1];
}
function add_a(word){
  let letter = word[0];
  if (letter == "a" || letter == "e" || letter == "i" || letter == "o" || letter == "u"){
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

//============================Display objects=============================
const map = {
  start(){
    // Feel free to remove the jQuery tips once you don't need them. 
    // I haven't refactored the canvas yet because it breaks the code somehow
    this.mapZoom = 100;
    this.shown = true;
    
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
    this.redraw();
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
  
  redraw(){
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
    if (!world.getHex(player.getX()+mx, player.getY()+my)){
      return;
    }
    player.doAction(new action("travel", { x : mx, y : my }));
  },
  
  zoom(adj){
    this.mapZoom += adj;
    if (this.mapZoom < 50) this.mapZoom = 50;
    if (this.mapZoom > 150) this.mapZoom = 150;
    this.redraw();
  }
}

const actionDisplay = {
  start(){
    this.display = $("#actionDisplay");
  },
  redraw(){
    let action = player.currentAction();
    let txt;
    if (!action) txt = "";
    else {
      let details = action.details;
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
    this.display.html(txt);
  },
}

const locationDisplay = {
  start(){
    this.display = $("#locationDisplay");
    this.hovering = null;
  },
  txtFor(item){
    let num = player.currentHex().i.getInv(item);
    let data = encyclopedia.itemData(item);
    let numword = queryNum(num);
    let name = num>1 ? data.plu : data.sho;
    let pos = "on the ground";
    if (data.type == "living-mushroom"){
      numword = "some";
      if (!player.hasDiscovered(item)){
        name = num>1 ? data.bplu : data.bsho;
      }
      pos = "growing";
    }
    let txt = "<p id='location "+item+"'>There "+(num==1 ? "is" : "are")+" "+numword+" ";
    if (this.hovering == item){
      txt += name+" "+encyclopedia.actionsFor(item, data, "loc");
    } else {
      txt += "<a onmouseover='locationDisplay.hovered(\""+item+"\")'>"+name+"</a>";
    }
    txt += " "+pos+" here.</p>";
    return txt;
  },
  redraw(){
    let hex = player.currentHex();
    let inv = hex.i.getInv();
    let txt;
    if (this.hovering == "hex"){
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
    this.redraw();
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
    this.hovering = null;
  },
  redraw(){
    // (danielnyan) Can optimise by only redrawing the elements 
    // that have changed, instead of redrawing everything.
    this.display.empty();
    const inv = player.i.getInv();
    for (let item in inv) {
      if (!inv[item]) continue;
      const data = encyclopedia.itemData(item);
      const name = inv[item]>1 ? data.plu : data.sho;
      
      // jQuery shorthand for creating new document object <p>
      const textObject = $("<p></p>").html("You have "+queryNum(inv[item]) + " ");
      
      // Gets current html with textObject.html(), then adds more html depending 
      // on whether the object you're hovering over is this current item.
      if (this.hovering == item) {
        // Appends the possible actions for the item
        const actionsHtml = encyclopedia.actionsFor(item, data, "inv")
        textObject.html(textObject.html() + name + " " + actionsHtml);
      } else {
        const link = $("<a></a>").html(name);
        // Shorthand for addEventListener('mouseover', () => {})
        link.mouseover(() => inventoryDisplay.hovered(item));
        textObject.append(link);
      }
      textObject.append(".");
      // append is jQuery for appendChild
      this.display.append(textObject);
    }
  },
  hovered(item){
    this.hovering = item;
    this.redraw();
  },
}

const equipmentDisplay = {
  start(){
    this.display = $("#equipment");
    this.hovering = null;
  },
  redraw(){
    let equipment = player.getEquip();
    let txt = "";
    for (let slot in equipment){
      let item = equipment[slot];
      if (!item) continue;
      let itemData = encyclopedia.itemData(item);
      if (!itemData) continue;
      
      //todo: make equipment align right, using spans or something
      //more todo: make equipped items be placed first in inventory with a tag
      if (this.hovering == slot){
        txt += "<p>"+capitalize(slot)+": "+itemData.sho+" (<a onclick='remove(\""+slot+"\")'>remove</a>)</p>";
      } else {
        txt += "<p>"+capitalize(slot)+": <a onmouseover='equipmentDisplay.hovered(\""+slot+"\")'>"+itemData.sho+"</a></p>";
      }
    }
    this.display.html(txt);
  },
  hovered(item){
    this.hovering = item;
    this.redraw();
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
      case "enter":
        thing = bits[1];
        buildingData = encyclopedia.buildingData(thing);
        if (buildingData.recipes){
          txt += "<p>Actions:</p>";
          let recipes = buildingData.recipes;
          for (let name in recipes){
            let mats = [];
            let recipe = recipes[name];
            for (let material in recipe.materials){
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
        thing = bits[1];
        let data = encyclopedia.itemData(thing);
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
        let buildings = hex.getBuilding();
        let len = sizeof(buildings);
        if (!len) txt += "There aren't any buildings here.";
        else {
          if (len == 1) txt += "There is ";
          else txt += "There are ";
          let buildingnames = [];
          for (let building in buildings){
            buildingnames.push("<a onclick=\"enter('"+building+"')\">"+add_a(encyclopedia.buildingData(building).sho)+"</a>");
          }
          txt += qms(buildingnames)+" here.";
        }
        txt += "</p>";
        return txt;
      case "travel":
        return "You've arrived at your newest destination: " + hex.getName() + ".";
    }
  },
  entryTitle(unique, details){
    let bits = unique.split("-");
    let hex = player.currentHex();
    let buildingData;
    switch (bits[0]){
      case "build":
        hex = player.currentHex();
        return hex.getName();
      case "built":
        buildingData = encyclopedia.buildingData(bits[1]);
        return capitalize(buildingData.sho);
      case "enter":
        buildingData = encyclopedia.buildingData(bits[1]);
        return capitalize(buildingData.sho);
      case "error":
        return null;
      case "examine":
        let data = encyclopedia.itemData(bits[1]);
        if (details == "discover")
          return "Discovered: "+capitalize(data.sho);
        else
          return capitalize(data.sho);
      case "journal":
        return "Journal";
      case "look":
        hex = player.currentHex();
        return hex.getName();
      case "travel":
        return "New Location";
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
      if (event.target == this.modal) {
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
  
  locationDisplay.redraw();
  inventoryDisplay.redraw();
  equipmentDisplay.redraw();
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