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
  this.description = "Онлайн версия популярной игры v" + this.version;
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

      room.message("<strong><i>Вы находитесь в Городе Грехов. Мафия рыскает, и серьезно угрожает жизни жителей деревни ...</i></strong>");

      if(!room.gameplay.gamemasterMode)
        room.nextStage("mafia");
      else
        room.nextStage("wait");

    }, 100);

  };

  // Parameters

  this.parameters = [
  {
    name: "Количество мафии (mafia)",
    type: Number,
    value: 1,
    help: "Мафиози стремятся взять под свой контроль деревни. Вместе они решают ликвидировать гражданина за ночь.",
    role: "mafia"
  },
  {
    name: "Количество спонсоров (mafia)",
    type: Number,
    value: 0,
    help: "Спонсор является частью мафиозного лагеря, но выглядит как невинная в глазах детектива.",
    role: "godfather"
  },
  {
    name: "Количество террористов (mafia)",
    type: Number,
    value: 0,
    help: "Террорист может совершить самоубийцы за одну ночь по своему выбору. Он умрет с целью выбора. Врач не защищает от нападения; но остановить террористического акта, если он защищает ее в течение ночи.",
    role: "terrorist"
  },
  {
    name: "Количество врачей",
    type: Number,
    value: 0,
    help: "Врач может защитить гражданина за ночь, если это необходимо. Если жизнь находится под угрозой защищена, она выживет в любом случае.",
    role: "doctor"
  },
  {
    name: "Количество Спасателей",
    type: Number,
    value: 0,
    help: "Спасатель может спасти жертву мафии. Не рекомендуется ставить несколько спасателей в составе, хотя вполне возможно,.",
    role: "rescuer"
  },
  {
    name: "Количество дежурных",
    type: Number,
    value: 0,
    help: "Дежурных может убить людей  по своему выбору. Однако сторона честных граждан.",
    role: "vigilant"
  },
  {
    name: "Количество Детективы",
    type: Number,
    value: 0,
    help: "Детектив может обнаружить каждую ночь, лагерь игрока (или невинную мафиозо).",
    role: "detective"
  },
  {
    name: "Количество шпионов",
    type: Number,
    value: 0,
    help: "Шпион может знать жертву мафии каждую ночь незамеченным.",
    role: "spy"
  },
  {
    name: "Количество консультантов",
    type: Number,
    value: 0,
    help: "Консультант может каждую ночь запретить голосование  жителя.",
    role: "councilman"
  },
  {
    name: "Game Master",
    type: Boolean,
    value: false,
    help: "Когда этот режим активен, создатель игры становится GAME LEADER. Она имеет дополнительные полномочия, чтобы возглавить партию по собственному желанию: изменение погоды, дополнения, пользовательские роли, частные беседы с игроками ...",
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
        p.player.setChannel("Игрок-" + player.username, {r: false, w: false});
      });
    }

    if(player.canonicalRole)
      this.room.message("<strong><i>" + player.username + " " + player.canonicalRole + " вышел.</i></strong>");

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
