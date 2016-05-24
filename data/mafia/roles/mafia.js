var votes = require("../lib/votes");

module.exports = function() {

  return {

    name: "Mafia",
    desc: "You must kill all the villagers innocent ...",
    side: "mafia",

    actions: {
      vote: votes.getVoteAction("mafia", "mafia")
    },
    channels: {
      mafia: {r: true, w: false, n: "Mafia", p: 10}
    }

  };

};
