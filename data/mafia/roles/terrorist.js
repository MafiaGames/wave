module.exports = function() {

  return {

    name: "Террорист",
    desc: "Вы удиваете вместе с собой с вашей жертвы. <b> Вы не знаете членов Мафии</ b>, но они знают вас, и вы должны помочь сл свлим суицидом. <Strong> Примечание: </ strong> Если доктор вас спас, то вы не можете использовать свою силу.",
    side: "mafia",
    night: true,

    actions: {
      explode: {
        isAvailable: function(player) {
          var hasExploded = player.pendingDeath ? player.pendingDeath.some(function(i){ return i.type === "terrorist"; }) : false;
          return player.room.currentStage === "mafia" && !player.roles.dead && !hasExploded;
        },
        type: "select",
        options: require("../lib/actions").getPlayerSelectOptions("Attentat"),
        execute: function(player, choice) {
          choice = player.room.resolveUsername(choice);
          if(!choice || player === choice.player)
            return;

          player.pendingDeath.push({type: "terrorist", target: choice.player});
          player.sendAvailableActions();
          player.message("<span class='mafia-stage-action mafia-mafia-action'><span class='glyphicon glyphicon-flash'></span> БУМ! Вы решили умереть вместе с  "+ choice.username +"</span>");

        }
      }
    },
    channels: {},

    beforeAll: function(room) {
      room.gameplay.events.on("beforeDawn2", function() {
        room.players.forEach(function(p) {
          p.player.pendingDeath.forEach(function(d) {
            if(d.type === "terrorist") {
              // Trigger target death
              d.target.pendingDeath.push({type: "terroristTarget"});
              // Override default death message
              d.target.deathMessage = false;
              p.player.deathMessage = "✝ " + p.username + " " + p.player.canonicalRole +
                " решил взорвать себя с "  +
                d.target.username + " " + d.target.canonicalRole +
                "..." ;
            }
          });
        });
      });

      room.gameplay.events.on("mafiaTurn", function() {
        room.players.forEach(function(p) {
          if(p.player.roles.terrorist && !p.player.roles.dead)
            room.message("mafia", "<span class='mafia-mafia-chat'>Вы можете расчитывать на помощь  " + p.username + " " + p.player.canonicalRole + "</span>");
        });
      });
    }

  };

};
