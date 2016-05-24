module.exports = {

  /**
   * Set player roles
   * @param  {Room}   room
   */
  init: function(room) {

    var roles = {};
    var sum = 0;
    var playerShift = 0;
    var mafiaOk = true;

    room.gameplay.gamemasterMode = false;
    room.gameplay.gamemaster = undefined;

    room.gameplay.parameters.forEach(function(p) {

      // Various parameters registration

      if(p.gamemasterMode && p.value) {
        room.gameplay.gamemasterMode = true;
        room.gameplay.gamemaster     = room.players[0].player;
        playerShift = 1;
        mafiaOk = true;
      }

      // Roles registration

      if(!p.role)
        return;

      if(p.value < 0)
        throw new Error("Invalid number for the role " + p.role + ".");

      if((p.role === "mafia" || p.role === "godfather") && p.value)
        mafiaOk = true;

      roles[p.role] = p.value;
      sum += p.value;
    });

    if(!mafiaOk)
      throw new Error("You must have at least a mafioso in Part.");

    if(sum > room.players.length - playerShift)
      throw new Error("Too many roles over the number of players.");

    // Suffle player list
    var o = [];
    for(var i = 0; i < room.players.length - playerShift; i++) {
      o[i] = i;
    }

    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);

    room.players.forEach(function(p, i) {
      if(i < playerShift)
        return; // ignore playerShift players
      p.player.setChannel("general", null); // remove general channel (unused in Mafia, but proposed by Openparty by default)
      p.player.setRole("villager", require("./villager")()); // everyone is a villager, except gamemaster
      p.player.canonicalRole = "<span class='label label-default'>Villager</span>";
      p.player.emit("setGameInfo", "Vous êtes "+ p.player.canonicalRole +". You have to eliminate members of the Mafia, but you have no specific power.");
    });

    if(room.gameplay.gamemasterMode) {
      var gamemaster = room.players[0].player;
      gamemaster.setChannel("general", null);
      gamemaster.setRole("gamemaster", require("./gamemaster")(room));
      gamemaster.canonicalRole = "<span class='label label-success'>Game Master</span>";
      gamemaster.emit("setGameInfo", "You are <strong> Game Master </ strong>. Type / help for help about commands. Good luck;)");
    }

    // Affect roles
    for(var r in roles) {
      var roleData = require("./" + r);
      var globalSample = roleData(); // This object is just used to trigger events global to each role
      if(globalSample.beforeAll)
        globalSample.beforeAll(room);

      for(var i = 0; i < roles[r]; i++) {
        var j = o.pop() + playerShift;
        room.players[j].player.setRole(r, roleData()); // Each player has a NEW instance of each role, for excellent customization posibilities

        var c = "primary";
        if(globalSample.side === "mafia")
          c = "danger";

        room.players[j].player.canonicalRole = "<span class='label label-"+c+"'>" + globalSample.name + "</span>";
        room.players[j].player.emit("setGameInfo", "You are "+ room.players[j].player.canonicalRole +". " + globalSample.desc);
      }
    }

    // Add custom functions in room.gameplay

    room.gameplay.nbAlive = function(role) {
      var nb = 0;
      this.room.players.forEach(function(p) {
        if(!p.player.roles.dead && p.player.roles[role]) {
          nb++;
        }
      });
      return nb;
    };

    room.gameplay.kill = function(player) {
      player.setRole("dead", require("./dead")());
      player.socket.emit("setGameInfo", "You are <strong> ✝ eliminated </ strong>. You can leave the village, or dialogue with the lost souls of the village ...");

      // Disable channels
      player.setChannel("village", {r: true, w: false});
      player.setChannel("mafia", {r: false, w: false});
    };
  }

};
