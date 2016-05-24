module.exports = function() {

  return {

    name: "Doctor",
    desc: "You can protect someone <strong> every night </ strong>, except yourself. You must help the villagers to repel the Mafia ...",
    side: "village",
    night: true,

    actions: {
      protect: {
        isAvailable: function(player) {
          return player.room.currentStage === "mafia" && !player.roles.dead && !player.docHasPlayed;
        },
        type: "select",
        options: require("../lib/actions").getPlayerSelectOptions("Protéger"),
        execute: function(player, choice) {
          choice = player.room.resolveUsername(choice);
          if(!choice || player === choice.player)
            return;

          player.docHasPlayed = true;
          choice.player.isSafeByDoc  = true;
          player.sendAvailableActions();
          player.message("<span class='mafia-stage-action mafia-role-action'><span class='glyphicon glyphicon-heart-empty'></span> "+ choice.username +" is protected from death for tonight</span>");

        }
      }
    },
    channels: {},

    beforeAll: function(room) {
      room.gameplay.events.on("beforeDawn", function() {
        room.players.forEach(function(p) {
          if(p.player.isSafeByDoc && p.player.pendingDeath)
            p.player.pendingDeath.pop();
        });
      });

      room.gameplay.events.on("afterDusk", function() {
        room.players.forEach(function(p) {
          p.player.isSafeByDoc  = false;
          p.player.docHasPlayed = false;
        });
      });
    }

  };

};
