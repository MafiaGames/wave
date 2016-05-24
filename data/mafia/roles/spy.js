module.exports = function() {

  return {

    name: "Spy",
    desc: "Every night, you can directly spy on the Mafia to know what will be their victim ... As you make good use of this information to help the village!",
    side: "village",
    night: true,

    actions: {},
    channels: {},
    beforeAll: function(room) {
      room.gameplay.events.on("mafiaVote", function(victim) {
        var announce = "No one has been targeted by the Mafia tonight";
        if(victim) {
          announce = victim.username + " was targeted by the Mafia tonight";
        }
        room.players.forEach(function(p) {
          if(p.player.roles.spy && !p.player.roles.dead){
            p.player.message("<span class='mafia-stage-action mafia-role-action'><span class='glyphicon glyphicon-user'></span> " + announce + "</span>");
          }
        });
      });
    }

  };
};
