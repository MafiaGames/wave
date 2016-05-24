/**
 * MAIN DEFINITION FILE FOR OPENPARTY-MAFIA
 * LICENSED UNDER GPLv3
 *
 * From the original idea of Dmitry Davidoff.
 */

'use strict';

var Emitter = require("events").EventEmitter;

var roles      = require("./roles/index");
var stages     = require("./stages/index");
var victory    = require("./lib/victory");
var playerInfo = require("./lib/playerInfo");
var commands   = require("./lib/commands");

module.exports = function() {

  // Metadata

  this.name        = "Mafia";
  this.version     = "0.1.0";
  this.description = "An online version of the game Dimitri Davidoff - v" + this.version;
  this.minPlayers  = 3;
  this.maxPlayers  = 40;
  this.opVersion   = ">0.1.2";

  this.css         = ["mafia.css"];
  this.sounds      = require('./data/audio.json');

  // Start

  this.start = function(room, callback) {

    this.nbDays = 0;
    victory.init(this);
    playerInfo.init(this);

    try {
      room.gameplay.events = new Emitter();
      roles.init(room);
      this.stages = stages.init(room);
    } catch(e) {
      return callback(e.message);
    }

    room.broadcast('playSound', 'start');
    callback(null);

    // TODO See #16
    setTimeout(function() {

      room.message("<strong><i>You are in the village of Salem. Mafia prowl, and seriously threatens the lives of the villagers ...</i></strong>");

      if(!room.gameplay.gamemasterMode)
        room.nextStage("mafia");
      else
        room.nextStage("wait");

    }, 100);

  };

  // Parameters

  this.parameters = [
  {
    name: "Number of Mafioso (mafia)",
    type: Number,
    value: 1,
    help: "Mafiosi aim to take control of the village. Together they decide to eliminate a citizen per night.",
    role: "mafia"
  },
  {
    name: "Number of Sponsors (mafia)",
    type: Number,
    value: 0,
    help: "A sponsor is part of the mafia camp but appears as an innocent in the eyes of the detective.",
    role: "godfather"
  },
  {
    name: "Number of Terrorists (mafia)",
    type: Number,
    value: 0,
    help: "A terrorist may commit a suicide bombing overnight of his choice. He will die with the target of choice. The doctor does not protect against the attack; but stop a terrorist act if it protects it during the night.",
    role: "terrorist"
  },
  {
    name: "Number of Doctors",
    type: Number,
    value: 0,
    help: "A doctor can protect a citizen per night if desired. If life is threatened protected, it will survive anyway.",
    role: "doctor"
  },
  {
    name: "Number of Lifeguards",
    type: Number,
    value: 0,
    help: "A rescuer can save a victim of the Mafia. It is not advisable to put several rescuers in the composition, although it is possible.",
    role: "rescuer"
  },
  {
    name: "Number of Vigils",
    type: Number,
    value: 0,
    help: "A vigil can murder a people overnight of his choice. However the side of honest citizens.",
    role: "vigilant"
  },
  {
    name: "Number of Detectives",
    type: Number,
    value: 0,
    help: "A detective can discover each night, the camp of a player (or innocent mafioso).",
    role: "detective"
  },
  {
    name: "Number of Spies",
    type: Number,
    value: 0,
    help: "A spy can know the victim of the Mafia every night undetected.",
    role: "spy"
  },
  {
    name: "Number of Consultants",
    type: Number,
    value: 0,
    help: "A counselor can every night prohibit voting a villager.",
    role: "councilman"
  },
  {
    name: "Fashion Game Master",
    type: Boolean,
    value: false,
    help: "When this mode is active, the creator of the game becomes GAME LEADER. It has additional powers to lead the party at will: weather modification, additions, custom roles, private discussions with players ...",
    gamemasterMode: true
  }
  ];

  // Disconnect

  this.onDisconnect = function(room, player) {

    if(player.roles && player.roles.gamemaster) { // TODO : move this is gamemaster.js file

      room.gameplay.gamemasterMode = false;
      room.gameplay.gamemaster     = null;
      room.gameplay.disableAutoVictory = false;

      if(room.getRemainingTime() > 1000 * 60 * 3) // to avoid infinite stages
        room.setStageDuration(60 * 3);

      if(room.currentStage === "wait")
        room.endStage();

      room.players.forEach(function(p) { // disable gamemaster communication
        p.player.setChannel("player-" + player.username, {r: false, w: false});
      });
    }

    if(player.canonicalRole)
      this.room.message("<strong><i>" + player.username + " " + player.canonicalRole + " escaped.</i></strong>");

    // Update vote (if any)
    if(player.choice) {
      player.choice.nbVotes--;
      this.sendPlayerInfo(player.choice.socket)
    }

    if(room.gameplay.checkEnd)
      room.gameplay.checkEnd();
  }

  // Chat styles

  this.processMessage = function(channel, message, player) {

    if(player.roles.gamemaster && commands.test(message, player)) {
      return false;
    }

    if(channel.match(/^player\-/)) {
      player.message("<span class='mafia-private-chat'>À " + channel.replace(/player\-/, "") + " : " + message + "</span>", true);
      message = "<span class='mafia-private-chat'>[PRIVÉ] " + message + "</span>";
    }

    if(channel === "dead") {
      message = "<i class='mafia-dead-chat'>" + message + "</i>";
    }

    if(channel === "mafia") {
      message = "<span class='mafia-mafia-chat'>" + message + "</span>";
    }

    if(player.roles.gamemaster) {
      message = "<span class='mafia-gamemaster-chat'>" + message + "</span>";
    }

    return message;
  }

};
