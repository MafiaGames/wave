var votes = require("../lib/votes");

module.exports = function() {

  /**
   * TODO some refactor
   * The godfather should have two roles: "mafia" and "godfather"
   * When refactored, it would be easier to deal with clans management
   */

  return {

    name: "Godfather",
    desc: "You must kill all the villagers innocent, you appear as an innocent in the eyes of Detective ...",
    side: "mafia",

    actions: {
      vote: votes.getVoteAction("mafia", "mafia")
    },
    channels: {
      mafia: {r: true, w: false, n: "Mafia", p: 10}
    }

  };

};
