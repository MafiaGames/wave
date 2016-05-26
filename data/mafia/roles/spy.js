module.exports = function() {

  return {

    name: "Шпион",
    desc: "Каждуюночь вы можете точно узнать жертву Мафии ... Испльзуйте эту информацию чтобы помочь жителям!",
    side: "village",
    night: true,

    actions: {},
    channels: {},
    beforeAll: function(room) {
      room.gameplay.events.on("mafiaVote", function(victim) {
        var announce = "Сегодня никто не был выбран Мафией";
        if(victim) {
          announce = victim.username + " Сегодня был выбран Мафией";
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
