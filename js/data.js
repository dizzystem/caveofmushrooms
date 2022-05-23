encyclopedia.items = {
  //==============Living mushroom types==================

  blueleaf : {
    type : "living-mushroom",
    tier : 1,
    bsho : "frilly blue mushroom",
    sho : "blueleaf",
    lon : "This tall blue mushroom has a wide cap covered in little frills.  The frills spread out delicately like a poofy skirt, or possibly the canopy of a tree.  It smells refreshing.",
  },
  poolcap : {
    type : "living-mushroom",
    tier : 1,
    bsho : "bowl-shaped pink mushroom",
    sho : "poolcap",
    lon : "This flat pink mushroom has a cap shaped like a wide, shallow bowl, about the length of your arm.  A small pool of water has gathered in it.",
  },
  silkveil : {
    type : "living-mushroom",
    tier : 2,
    bsho : "veiled white mushroom",
    sho : "silkveil",
    lon : "This mushroom has fragile white veils draped loosely around its cap, cool to the touch.  Drops of dew drip off their edges into the soil below.",
  },
  glowring : {
    type : "living-mushroom",
    tier : 2,
    bsho : "glowing orange mushroom",
    sho : "glowring",
    lon : "This dusky orange mushroom glows orange-white all around the edge of its cap, casting a faint light over the area.  It tends to grow in circles around thermal vents.",
    canGrow : function(hex){
      return hex.geothermal > 0;
    },
  },
  stonerose : {
    type : "living-mushroom",
    tier : 2,
    bsho : "tall grey mushroom",
    sho : "stonerose",
    lon : "This is a stone-grey mushroom with a long, straight stem sparsely covered in sharp thorns.  Its small cap is perched incongruously atop the stem like the head of a golf club.",
  },
  // To do: add description
  wooltop : {
    type : "living-mushroom",
    tier : 2,
    bsho : "fluffy white mushroom",
    sho : "wooltop",
    lon : "bluh.",
  },
  holegrain : {
    type : "living-mushroom",
    tier : 2,
    bsho : "holey blue mushroom",
    sho : "holegrain",
    lon : "This sky-blue mushroom has little holes all over its wide, round cap.  Like the seedpod of a lotus, hard spore grains peek out from the holes.",
  },
  silverstack : {
    type : "living-mushroom",
    tier : 2,
    bsho : "stacked silver mushroom",
    sho : "silverstack",
    lon : "This mushroom grows in piles of pale shimmering circles. The lower layers gradually die and harden into a form resembling wood.",
  },
  cavecherry : {
    type : "living-mushroom",
    tier : 2,
    bsho : "dark red mushroom",
    sho : "cavecherry",
    lon : "This is a dark red mushroom with a succulent, glossy skin.  When broken, it releases a pleasantly sweet smell.",
  },
  zestnub : {
    type : "living-mushroom",
    tier : 2,
    bsho : "tiny yellow mushroom",
    sho : "zestnub",
    lon : "This is a tiny yellow mushroom, about the size of your thumb, with a succulent, glossy skin.  The air around it is filled with a citrusy smell.",
  },
  lightpuff : { //floating in water?
    type : "living-mushroom",
    tier : 2,
    bsho : "glowing green mushroom",
    sho : "lightpuff",
    plu : "lightpuffs",
    lon : "This mushroom has a round puffy cap that glows a faint eerie green in the dark.",
  },
  ambershine : {
    type : "living-mushroom",
    tier : 2,
    bsho : "dull silver mushroom",
    sho : "ambershine",
    lon : "This mushroom is normally a dull metallic silver, but has a bright golden shine underneath when the top layer is rubbed off.  The silver layer slowly forms again as long as it's left exposed to the air.",
  },
  fluffshroom : {
    type : "living-mushroom",
    tier : 2,
    bsho : "furred pale orange mushroom",
    sho : "fluffshroom",
    lon : "This mushroom is covered with thin tufts of pale orange fluff. Instead of a cap, it has fluff sticking out in every direction from the top of its stem.",
  },
  
  /*
    bulbroot - has bundles of nodules around its base, with a sharp, peppery taste
    a mushroom reinforced with metallic threads in the stem - hard to cut, extract threads for "metal"
  */
  //Harvested mushrooms
  pickedblueleaf : {
    type : "picked-mushroom",
    tier : 2,
    sho : "bundle of blue leaves",
    lon : "Not quite leaves, these feathery frills have a dark blue colour and a refreshing herbal smell.",
  },
  pickedpoolcap : {
    type : "picked-mushroom",
    tier : 2,
    sho : "bowl of pure water",
    lon : "A bowl made of light pink glossy mushroom.  It's full of clear drinkable water.",
    edible : {
      verb : "drink",
      desc : "You drink the water out of the bowl, leaving you with an empty poolcap mushroom.",
      giveItem : {
        emptypoolcap : 1,
      }
    }
  },
  pickedsilkveil : {
    type : "picked-mushroom",
    tier : 2,
    sho : "picked silkveil",
    lon : "A veiled white mushroom that's been cut neatly at the base.",
  },
  pickedglowring : {
    type : "picked-mushroom",
    tier : 2,
    sho : "picked glowring",
    lon : "A dusky orange mushroom that's been cut neatly at the base.",
  },
  pickedstonerose : {
    type : "picked-mushroom",
    tier : 2,
    sho : "picked stonerose",
    lon : "A tall grey mushroom that's been cut neatly at the base.",
  },
  pickedwooltop : {
    type : "picked-mushroom",
    tier : 2,
    sho : "picked wooltop",
    lon : "placeholder description"
  },
  pickedholegrain : {
    type : "picked-mushroom",
    tier : 2,
    sho : "picked holegrain",
    lon : "A sky-blue mushroom that's been cut neatly at the base.",
  },
  pickedsilverstack : {
    type : "picked-mushroom",
    tier : 2,
    sho : "picked silverstack",
    lon : "A towering silver mushroom that's been cut neatly at the base.",
  },
  pickedcavecherry : {
    type : "picked-mushroom",
    tier : 2,
    sho : "picked cavecherry",
    lon : "A dark red mushroom that's been cut neatly at the base.",
  },
  pickedzestnub : {
    type : "picked-mushroom",
    tier : 2,
    sho : "picked zestnub",
    lon : "A tiny yellow mushroom that's been cut neatly at the base.",
  },
  pickedlightpuff : {
    type : "picked-mushroom",
    tier : 2,
    sho : "picked lightpuff",
    plu : "picked lightpuffs",
    lon : "A glowing green mushroom that's been cut neatly at the base.",
    duration : 30,
    stats : {add_constant_light : 1}
  },
  pickedambershine : {
    type : "picked-mushroom",
    tier : 2,
    sho : "picked ambershine",
    lon : "A dull silver mushroom that's been cut neatly at the base.",
  },
  pickedfluffshroom : {
    type : "picked-mushroom",
    tier : 2,
    sho : "picked fluffshroom",
    lon : "A furred pale orange mushroom that's been cut neatly at the base.",
  },
  
  //==============Procesed mushroom resources==================
  blueleafInk : {
    type : "resource",
    sho : "blueleaf ink",
    lon : "Some dark blue liquid distilled from blueleaf mushrooms.",
  },
  emptypoolcap : {
    type : "resource",
    sho : "empty bowl",
    lon : "A bowl made of light pink glossy mushroom.  There's still a bit of stem attached to the bottom.",
  },
  silkveilVeil : {
    type : "resource",
    sho : "silkveil veil",
    lon : "This is a thin sheet of leathery material harvested from a silkveil mushroom.  While it's not quite silk, it could probably serve as fabric.",
    properties : {
      fabric : 5,
      flammable : 2,
    },
  },
  glowfluid : {
    type : "resource",
    sho : "glowfluid",
    plu : "glowfluid",
    lon : "This is some orange oil harvested from a glowring mushroom.  When shaken, swirls of light form briefly in the translucent liquid.",
    properties : {
      luminous : 5,
      flammable : 5,
    },
  },
  stoneroseStem : {
    type : "resource",
    sho : "stonerose stem",
    lon : "This is a long, thin stick harvested from a stonerose mushroom.  Despite being as narrow as your thumb, it's pretty heavy.",
    properties : {
      structural : 5,
    },
  },
  stoneroseThorn : {
    type : "resource",
    sho : "stonerose thorn",
    lon : "This is a small sharp thorn harvested from a stonerose mushroom.  It looks painful.",
    properties : {
      sharp : 3,
    },
  }, //comes before glowring - use stonerose tools to harvest
  
  
  //======================Equipment=====================
  journal : {
    type : "equipment-none",
    sho : "journal",
    lon : "Your journal. You brought it with you from the surface.",
  },
  mushroomKnife : {
    type : "equipment-tool",
    sho : "mushroom knife",
    plu : "mushroom knives",
    lon : "This is a curved knife used for gathering mushrooms.",
    stats : {add_constant_gatherSpeed : 9},
    durability : 5000,
  },
  blueleafHat : {
    type : "equipment-hat",
    sho : "blueleaf hat",
    lon : "This is a broad-brimmed hat decorated with frilly blueleaf leaves, making it look slightly more dashing.",
  },
  map : {
    type : "equipment-none",
    sho : "map",
    lon : "This is a simple map drawn on MEDIA with blueleaf ink.",
  },
  
  //======================Food=====================
  blueleafTea : {
    type : "food",
    sho : "blueleaf tea",
    lon : "Some delicious blue tea, served in a poolcap.  It can stain your teeth blue.  When "+
      "drunk, it slightly increases your building and research speed.",
    edible : {
      verb : "drink",
      desc : "The blueleaf tea tastes strongly bitter but very refreshing.  You feel energized.",
      duration : 120,
      stats : {mult_constant_buildSpeed : 0.2, mult_constant_researchSpeed : 0.2},
      giveItem : {
        emptypoolcap : 1,
      }
    }
  },
  // Currently item bonuses don't stack, but instead, they refresh. Upcoming feature?
  wisdomSandwich : {
    type : "food",
    sho : "wisdom sandwich",
    lon : "A sandwich that grants increased construction and research speed. This is a testing item, so if you have it, chances are that you're hacking.",
    edible : {
      verb : "eat",
      duration : 120,
      stats : {mult_constant_buildSpeed : 9, mult_constant_researchSpeed : 9}
    }
  },
  moongillPowder : {
    type : "food",
    sho : "moongill powder",
    lon : "A pale white powder that tingles strongly to the touch.  When swallowed, it gives "+
      "a short burst of manic energy which increases your mushroom gathering speed.",
    edible : {
      verb : "eat",
      desc : "The powder goes down with some difficulty, but just a minute after you manage "+
        "to swallow it all, a surge of incredible power fills your muscles.",
      duration : 60,
      stats : {mult_constant_gatherSpeed : 1}
    }
  },
  moongillierPowder : {
    type : "food",
    sho : "moongillier powder",
    lon : "basically crack. this is also a testing item",
    edible : {
      verb : "eat",
      duration : 9001,
      stats : {mult_constant_gatherSpeed : 19, mult_constant_craftSpeed : 19}
    }
  },
  
  //======================Utility=====================
  repairShroom : {
    type : "repair",
    sho : "repairshroom",
    lon : "An arcane mushroom that repairs anything it touches. When used, it will almost certainly restore anything to its original, flawless state.",
    repair : Infinity,
  },
}

encyclopedia.stats = {
  gatherSpeed : {
    sho : "gathering speed"
  },
  researchSpeed : {
    sho : "research speed"
  },
  craftSpeed : {
    sho : "crafting speed"
  },
  buildSpeed : {
    sho : "building speed"
  }
}

encyclopedia.buildings = {
  cookingFire : {
    sho : "cooking fire",
    materials : {
      pickedblueleaf : 10,
    },
    durability : 50,
    crafting : {
      fire : 1
    },
    timer: 30,
  },
  /*choppingBoard : {
    sho : "chopping board",
    materials : {
      pickedblueleaf : 10,
    },
    durability : 500,
    crafting : {
      knife : 1
    },
  },*/
  toolBench : {
    sho : "tool bench",
    materials : {
      stoneroseStem : 10,
    },
    durability : 500,
    crafting : {
      bench : 1
    }
  },
  makeshiftTable : {
    sho : "makeshift table",
    materials : {
      emptypoolcap : 10,
    },
    research : {
      table : 1
    },
    timer : 30
  },
}

encyclopedia.crafting = {
  //========================Cooking=======================
  "blueleaf tea" : { 
    desc : "Make some tea by boiling blueleaf mushrooms in water.",
    materials : {
      pickedblueleaf : 2,
      pickedpoolcap : 1,
    },
    products : { blueleafTea : 1, },
    building : {
      fire : 1
    },
  },
  "blueleaf ink" : {
    desc : "Make some ink by distilling this tea.",
    materials : {
      blueleafTea : 5,
      emptypoolcap : 1,
    },
    products : { blueleafInk : 1, },
    building : {
      fire : 1
    },
  },
  torch : {
    materials : {
      pickedblueleaf : 10,
      stoneroseStem : 1,
    },
    products : { torch : 1 },
    building : {
      fire : 1
    },
    difficulty : 0,
    timer : 5,
  },
  //=======================Crafting========================
  // To do: craft whetstones from toolbench, not knives. 
  // That, and limit the number of things you can craft. 
  "basic knife" : {
    materials : { stoneroseThorn : 20, },
    products : { mushroomKnife : 1 },
    building : {
      bench : 1
    },
    difficulty : 0,
    timer : 5,
  },
  "basic lantern" : {
    materials : {
      lightpuffGlobe : 10,
      rope : 5,
    },
    products : { "basic lantern" : 1 },
    building : {
      bench : 1
    },
    difficulty : 0,
    timer : 5,
  },
  "raft" : {
    materials : {
      emptypoolcap : 10,
      rope : 5, //glue?
    },
    products : { "raft" : 1 },
    building : {
      bench : 1
    },
  }
  //====================Cutting=========================
  //make a reinforced poolcap as structural material
  //grind holegrain in reinforced poolcap
  //a way to reshape poolcap
  /*
  "silkveil extraction" : {
    materials : { pickedsilkveil : 1, },
    products : { silkveilVeil : 2, },
  },
  "glowring extraction" : { 
    materials : { pickedglowring : 1, },
    products : { glowfluid : 1, },
  },
  "stonerose extraction" : { 
    materials : { pickedstonerose : 1, },
    products : {
      stoneroseStem : 1,
      stoneroseThorn : 10,
    },
  },
  "holegrain extraction" : { 
    materials : { pickedholegrain : 1, },
    products : { holegrainSpore : 10, },
  },
  "silverstack extraction" : { 
    materials : { pickedsilverstack : 1, },
    products : { silverstackLog : 1, },
  },
  "cavecherry extraction" : { 
    materials : { pickedcavecherry : 1, },
    products : { cavecherrySlice : 3, },
  },
  "zestnub extraction" : { 
    materials : { pickedzestnub : 1, },
    products : { zestnubNub : 3, },
  },
  */
}

encyclopedia.research = {
  "map" : {
    desc : "Draw a map of this cave, so I can keep track of where I've explored.",
    materials : {
      blueleafInk : 1,
    },
    building : {
      table : 1
    },
    difficulty : 0,
    timer : 5,
    limit : 1,
    completion : "Map researched. You may travel to other locations using the map in your journal."
  },
  "firestarting" : {
    desc : "How do I start fires without a lighter?",
    materials : {
      pickedblueleaf : 10,
    },
    building : {
      table : 1
    },
    difficulty : 0,
    timer : 5,
    limit : 1,
  },
}

encyclopedia.stories = {
  intro : {
    words : "You wake up in a deep cave, a dim shaft of light shining down from the cave "+
            "roof not far away.  The last thing you remember is wandering through a nature "+
            "reserve near your home looking for mushrooms, slipping on mud, and falling for "+
            "a heartstoppingly long time.  You're a little dizzy and you've twisted your ankle, "+
            "but you're miraculously unharmed otherwise."
  },
  name : {
    words : "There are strange mushrooms down here you've never seen before.  For a moment, "+
            "you're excited at the opportunity to name the new varieties - then you remember "+
            "that you may not ever get out of this place.",
    condition : function(){
      return player.data.discovered.length > 0;
    }
  },
  tea : {
    words : "The smell of the blueleaf mushrooms makes you feel hungry.  You think you "+
            "should make some food before you continue looking for an exit.<br><br>"+
            "Blueprint unlocked: cooking fire",
    requires : ["name"],
    condition : function(){
    }
  },
  map : {
    words : "You might be able to venture out into the gloom, now that you have a way to "+
            "find your way back.",
    requires : ["name"],
    condition : function(){
    }
  },
  knife : {
    words : "It's your knife!  You remember bringing it with you the morning before you fell "+
      "down here.  Must have dropped it in the fall.",
    requires : ["name"],
    condition : function(){
      return player.i.canAfford({"mushroomKnife":1})
    }
  },
  knife2 : {
    words : "The knife you brought is starting to look a little dull.  It might be a good "+
            "idea to find something to sharpen it with.",
    requires : ["knife"],
    condition : function(){
    }
  }
}

encyclopedia.enter = {
  needsTorch : function(){
    for (let item in ["torch", "lantern"]){
      if (player.i.getInv(item) > 0){
        return true;
      }
    }
    if (playerStats.light >= 1) {
      return true;
    }
    log.log("error", {error:"needitem", item:"light"});
    return false;
  },
  needsBoat : function(){
    for (let item in ["raft"]){
      if (player.i.getInv(item) > 0){
        return true;
      }
    }
    log.log("error", {error:"needitem", item:"boat"});
    return false;
  },
}

encyclopedia.hexes = {
  h0_0 : {
    mushrooms : {},
  },
  h1_0 : {
    mushrooms : {},
  },
  
  //Zone 1
  h1_1 : {
    mushrooms : {},
  },
  // Note: number at the end is the mushroom capacity 
  // for the area. 
  h1_2 : {
    name : "Sun's Landing",
    mushrooms : {
	  "blueleaf" : 500,
	  "poolcap" : 1000
    },
    colour : "#AAAAAA",
  },
  h0_3 : {
    mushrooms : {
	  "stonerose" : 500,
	  "zestnub" : 500
    },
    colour : "#B5B26A",
    items : {
      "mushroomKnife" : 1
    }
  },
  h1_3 : {
    mushrooms : {
	  "fluffshroom" : 500,
    "lightpuff" : 500
    },
    colour : "#C08180",
  },
  h2_2 : {
    mushrooms : {},
  },
  
  //Zone 2
  h3_2 : {
    name : "Flooded Lake",
    mushrooms : {},
    canEnter : encyclopedia.enter.needsBoat,
    colour : "#8888AA",
    fallback : {
      hex : [2, 2],
      reason : "boat"
    }
  },
  h4_2 : {
    name : "Flooded Lake",
    mushrooms : {},
    canEnter : encyclopedia.enter.needsBoat,
    colour : "#8888AA",
    fallback : {
      hex : [2, 2],
      reason : "boat"
    }
  },
  
  //Zone 3
  h1_4 : {
    mushrooms : {},
  },
  h0_5 : {
    canEnter : encyclopedia.enter.needsTorch,
    mushrooms : {
      "poolcap" : Infinity
    },
    fallback : {
      hex : [1, 4],
      reason : "torch"
    }
  },
}