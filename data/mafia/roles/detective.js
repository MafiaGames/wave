module.exports = function() {

  return {

    name: "Детектив",
    desc: "Вы можете изучать лагеря <strong> каждую ночь </ strong>: жертв и мафии. Вы должны помочь жителям свергнуть Мафию ...",
    side: "village",
    night: true,

    actions: {
      spy: {
        isAvailable: function(player) {
          return player.room.currentStage === "mafia" && !player.roles.dead && !player.detectHasPlayed;
        },
        type: "select",
        options: require("../lib/actions").getPlayerSelectOptions("Découvrir"),
        execute: function(player, choice) {
          choice = player.room.resolveUsername(choice);
          if(!choice || player === choice.player)
            return;

          player.detectHasPlayed = true;
          player.sendAvailableActions();
          var playerSide = (choice.player.roles.mafia ? "mafioso" : "innocent");
          player.message("<span class='mafia-stage-action mafia-role-action'><span class='glyphicon glyphicon-search'></span> " + choice.username + " is " + playerSide + "</span>");

        }
      }
    },
    channels: {},

    beforeAll: function(room) {
      room.gameplay.events.on("afterDusk", function() {
        room.players.forEach(function(p) {
          p.player.detectHasPlayed = false;
        });
      });
    }

  };

};
