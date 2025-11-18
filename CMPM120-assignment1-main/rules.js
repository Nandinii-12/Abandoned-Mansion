class Start extends Scene {
    enter() {
        this.engine.setTitle(this.engine.storyData.title);
        this.engine.addNavigationCell("Begin the story");
    }

    handleNavigation() {
        var start = this.engine.storyData.start;
        this.engine.gotoScene(Room, start.x, start.y, {"items": {}, "steps": 0, "numInteractions": 0, "lightOn": false});
    }
}

class Room extends Scene {
    enter(x,y,player)
    {
        this.x = x;
        this.y = y;
        this.engine.player = player;
        var roomData = this.engine.storyData.rooms[x + "_" + y];
        
        //checks if it has flashlight/battery
        let isLit = !roomData.lit2 || player.lightOn;
       
        if(isLit)
        {
            this.engine.showCaption(roomData.name);
            this.engine.show(roomData.description);
        }
        else{
            this.engine.showCaption("Dark Room");
            this.engine.show("It's pitch black- you can't make out anything in front of you.");
        }

        this.interactions(player.items, roomData.items);
        player.steps += 1;
        if (isLit && roomData.items.length > 0)
        {
            var items = "Items collected: ";
            for(var item of roomData.items)
            {
                items += this.engine.itemString(item) + " ";
                if (player.items[item])
                {
                    player.items[item] += 1;
                }
                else
                {
                    player.items[item] = 1;
                }
            roomData.items = [];
            this.engine.show(items);
            }
        }

        if (this.engine.storyData.exit.x == x && this.engine.storyData.exit.y == y)
        {
            this.endGame(player);
        }
        else
        {
            this.engine.addInteraction("Do something", "x", "y");
            // navigation cells come in a 3x3 grid
            // row 1
            this.engine.addTextCell();

            var currentRoom = this.engine.storyData.rooms[x+"_"+y];
            var northRoom = this.engine.storyData.rooms[x+"_"+(y-1)];

            if(northRoom != undefined)
            {
                if(this.hasRequirements(player, northRoom.requires, currentRoom))
                {
                    this.engine.addNavigationCell(this.generateRoomString("North"), x, y-1, player);
                } else {
                    this.engine.addTextCell(northRoom.blockedMessage);
                }
            } else
            {
                this.engine.addTextCell();
            }
            
            this.engine.addTextCell();

            // row 2
            var westRoom = this.engine.storyData.rooms[(x-1)+"_"+(y)];

            if(westRoom != undefined)
            {
                if(this.hasRequirements(player, westRoom.requires, currentRoom))
                {
                    this.engine.addNavigationCell(this.generateRoomString("West"), x-1, y, player);
                } else {
                    this.engine.addTextCell(westRoom.blockedMessage);
                }
            } else
            {
                this.engine.addTextCell();
            }

            this.engine.addTextCell("You are here");
            
            var eastRoom = this.engine.storyData.rooms[(x+1)+"_"+(y)];
            if(eastRoom != undefined)
            {
                if(this.hasRequirements(player, eastRoom.requires, currentRoom))
                {
                    this.engine.addNavigationCell(this.generateRoomString("East"), x+1, y, player);
                } else {
                    this.engine.addTextCell(eastRoom.blockedMessage);
                }
            } else
            {
                this.engine.addTextCell();
            }

            // row 3
            this.engine.addTextCell();
            var southRoom = this.engine.storyData.rooms[x+"_"+(y+1)];
            if(southRoom != undefined)
            {
                if(this.hasRequirements(player, southRoom.requires, currentRoom))
                {
                    this.engine.addNavigationCell(this.generateRoomString("South"), x, y+1, player);
                } else {
                    this.engine.addTextCell(southRoom.blockedMessage);
                }
            } else
            {
                this.engine.addTextCell();
            }
            this.engine.addTextCell();
        }
        this.engine.transition();


    }


    handleNavigation(x,y,player) {
        this.engine.gotoScene(Room, x, y, player);
    }

    handleInteraction(a,b)
    {
        if (a == "x" && b == "y") {
            this.engine.player.numInteractions++;
            var theRoom = this.engine.storyData.rooms[this.x + "_" + this.y];

            //Enter secret study
            if(theRoom.broken && "hammer" in this.engine.player.items)
            {
                theRoom.broken = false;
                this.engine.show(theRoom.message);
                theRoom.description = theRoom.new_description;
                theRoom.fail = "You have already been here before";
            } 
            //Enter exit hallway
            else if(theRoom.unlocked && "key" in this.engine.player.items)
            {
                theRoom.unlocked = false;
                this.engine.show(theRoom.message);
                theRoom.description = theRoom.new_description;
                theRoom.fail = "You have already been here before";
            } 
            //Enter exit door
            else if(theRoom.decoded && "pen" in this.engine.player.items && "notebook" in this.engine.player.items)
            {
                theRoom.decoded = false;
                theRoom.message = "You frantically begin to write to try and crack the code. After what seems like forever, you jump to your feet and input the code!";
                this.engine.show(theRoom.message);
                theRoom.description = theRoom.new_description;
                theRoom.fail = "You have already been here before";
            }
            else if(theRoom.decoded && "pen" in this.engine.player.items && !("notebook" in this.engine.player.items))
            {
                theRoom.message = "You remember picking up a pen. If only you had something to write in.";
                this.engine.show(theRoom.message);
            }
            else if(theRoom.decoded && "notebook" in this.engine.player.items && !("pen" in this.engine.player.items))
            {
                theRoom.message = "You fumble around, looking for a pen to help you with the encryption. Maybe there's somewhere you can find one.";
                this.engine.show(theRoom.message);
            }
            //Enter dark hallway
            else if(theRoom.lit && "flashlight" in this.engine.player.items && "battery" in this.engine.player.items)
            {
                this.engine.player.lightOn = true;
                theRoom.lit = false;
                theRoom.lit2 = false;
                theRoom.message = "Your flashlight flickers on, lighting up your path";
                this.engine.show(theRoom.message);
                theRoom.description = theRoom.new_description;
                theRoom.fail = "You have already been here before";
            }
            else if(theRoom.lit && "flashlight" in this.engine.player.items && !("battery" in this.engine.player.items))
            {
                theRoom.message = "You try to use the flashlight, but it doesn't seem to work. Maybe you need some batteries.";
                this.engine.show(theRoom.message);
            }
            else if(theRoom.lit && "battery" in this.engine.player.items && !("flashlight" in this.engine.player.items))
            {
                theRoom.message = "You remmeber you picked up some batteries. Maybe you can use this with something.";
                this.engine.show(theRoom.message);
            }
            //Dark rooms
            else if(theRoom.lit2 && !this.engine.player.lightOn)
            {
                this.engine.show("You squint, but still see nothing.");
            }
            else if(theRoom.fail != undefined)
            //fails
            {
                this.engine.show(theRoom.fail);
            }
            else {
                this.engine.show("Interaction Successful");
            }
        }
    }

    interactions(inventory, roomItems)
    {
        
    }

    hasRequirements(player, requires, theRoom)
    {
        if(requires === undefined)
            return true;
        
        if(theRoom.lit || theRoom.lit2)
        {
            return true;
        }

        if(typeof requires === "string")
            return requires in player.items;
        if(Array.isArray(requires))
        {
            for(let i = 0; i < requires.length; i++)
            {
                let r = requires[i];
                if(!(r in player.items))
                {
                    return false;
                }
            }
        }

        if(theRoom.broken || theRoom.unlocked || theRoom.decoded)
        {
            return false;
        }

        return true;
    }

    endGame(player)
    {
        var items = "Items collected:";
        for(var item in player.items)
        {
            items += this.engine.itemString(item) + " x" + player.items[item] + " ";
        }
        this.engine.show(items);
        this.engine.show("Total steps taken: " + player.steps);
        this.engine.show("Total interactions: " + player.numInteractions);
        let score = (player.numInteractions/player.steps)* 100;
        this.engine.show("Your score is: " + score);
        this.engine.show(this.engine.storyData.credits);
    }
    generateRoomString(direction)
    {
        return "Go " + direction + "\n";
    }
}

Engine.load(Start, './myWorld.json');