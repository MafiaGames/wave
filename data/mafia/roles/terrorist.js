module.exports = function() {

  return {

    name: "Terrorist",
    desc: "You can kill yourself with the person of your choice during any night. <b> You do not know the members of the Mafia </ b>, but they know you, and you need help with your suicide. <Strong> Note: </ strong> if the doctor protects you can not use your power.",
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
          player.message("<span class='mafia-stage-action mafia-mafia-action'><span class='glyphicon glyphicon-flash'></span> Boom! You have decided to make  "+ choice.username +" in your death</span>");

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
                " decided to blow himself by driving "  +
                d.target.username + " " + d.target.canonicalRole +
                "..." ;
            }
          });
        });
      });

      room.gameplay.events.on("mafiaTurn", function() {
        room.players.forEach(function(p) {
          if(p.player.roles.terrorist && !p.player.roles.dead)
            room.message("mafia", "<span class='mafia-mafia-chat'>You can count on the help of " + p.username + " " + p.player.canonicalRole + "</span>");
        });
      });
    }

  };

};
