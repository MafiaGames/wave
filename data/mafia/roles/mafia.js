var votes = require("../lib/votes");

module.exports = function() {

  return {

    name: "Мафиа",
    desc: "Вы должны убить всех невинных жителей ...",
    side: "mafia",

    actions: {
      vote: votes.getVoteAction("mafia", "mafia")
    },
    channels: {
      mafia: {r: true, w: false, n: "Mafia", p: 10}
    }

  };

};
