var votes  = require("../lib/votes");
var french = require("../lib/french");

module.exports = function() {

  return {
    start: function(room, callback) {
      // Reset pending death
      room.players.forEach(function(p) {
        p.player.pendingDeath = [];
      });

      room.message("<div class='mafia-day-transition'><span class='glyphicon glyphicon-fire'></span> Наступила ночь</div>");

      // Fetch composition

      var roles = {};
      var mafiaNb = 0;
      var speNb   = 0;

      room.players.forEach(function(p) {
        var r = p.player.roles;
        if(!r || r.dead)
          return;
        if(r.mafia || r.godfather)
          mafiaNb++;
        for(var role in r) {
          if(!r[role].night)
            continue;
          var rolename = r[role].name;
          if(!roles[rolename])
            roles[rolename] = 0;
          roles[rolename]++;
          speNb++;
        }
      });

      // Mafia announce

      var mafiaStr = mafiaNb > 1 ? "Среди членов Мафии <u>" + mafiaNb + " membres</u>" : "<u>Единственный член</u> Мафии";
      if(mafiaNb)
        room.message("<span class='mafia-dead-announce'>Пока жители спят, " + mafiaStr + " действуют.</span>");

      // Special announce

      var specialStr = french.join(roles, "<u>", "</u>");
      var specialStrEnd = speNb > 1 ? "opèrent" : "opère";
      if(specialStr)
        room.message("<span class='mafia-dead-announce'>Между тем, " + specialStr + " " + specialStrEnd + " является секретом...</span>");

      room.gameplay.resetPlayerInfo();
      room.openChannel("mafia", "mafia");
      room.openChannel("mafia", "godfather");
      room.gameplay.events.emit("mafiaTurn");
      callback(null, 30);
    },
    end: function(room, callback) {
      var victim = votes.execute(room);
      room.message(""); // empty line
      if(victim) {
        victim.pendingDeath.push({type: "mafia"});
        room.message("mafia", "<span class='mafia-stage-action mafia-mafia-action'><span class='glyphicon glyphicon-screenshot'></span>Мафия решили ликвидировать " + victim.username + "</span>");
      } else {
        room.message("mafia", "<span class='mafia-stage-action mafia-mafia-action'><span class='glyphicon glyphicon-screenshot'></span> Мафиози не были единогласны и не убили человека</span>");
      }
      room.gameplay.events.emit("mafiaVote", victim);
      room.closeChannel("mafia", "mafia");
      room.closeChannel("mafia", "godfather");
      room.nextStage("afterMafia");
    }
  };

};
