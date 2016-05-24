module.exports = function() {

  return {

    name: "Vigil",
    desc: "You can murder a residents during a night of your choice; but keep in mind that you must help the villagers to repel the Mafia ...",
    side: "village",
    night: true,

    actions: {
      protect: {
        isAvailable: function(player) {
          return player.room.currentStage === "mafia" && !player.roles.dead && !player.vigilantHasPlayed;
        },
        type: "select",
        options: require("../lib/actions").getPlayerSelectOptions("Assassiner"),
        execute: function(player, choice) {
          choice = player.room.resolveUsername(choice);
          if(!choice || player === choice.player)
            return;

          player.vigilantHasPlayed = true;
          choice.player.pendingDeath.push({type: "vigilant"});
          player.sendAvailableActions();
          player.message("<span class='mafia-stage-action mafia-role-action'><span class='glyphicon glyphicon-screenshot'></span> You decided to murder "+ choice.username +" tonight</span>");

        }
      }
    },
    channels: {},
    beforeAll: function(room) {}

  };

};
