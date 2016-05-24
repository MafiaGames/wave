var utils  = require('./utils');
var rooms  = require('./rooms');
var git    = require('git-repo-info');

// we want to define this only one time
var repo = git('.git');
if(repo.branch) {
  repo.url = require('../package.json').repository.url.replace(/\.git$/, '') + '/commit/' + repo.sha;
}

module.exports = function(app) {

  /**
   * ROOT
   */
  app.get('/', function(req, res) {
    req.session.locale = req.getLocale();
    res.render('index', {passwordRequired: __conf.password !== null });
  });

  /***
   * ABOUT
   */
  app.get('/about', function(req, res) {
    res.render('about', {repo: repo, version: __version, locales: __conf.locales, gamemodes:  __staticGametypes });
  });

  /**
   * IO : Ping
   */
  app.io.route('o-ping', function(socket) {
    socket.emit('o-pong');
  });

  /**
   * IO : Disconnect
   */
  app.io.route('disconnect', function(socket) {

    var room = utils.isInGame(socket);
    if(!room) return;

    rooms.leaveRoom(socket);
  });

  /**
   * IO : Login
   */
  app.io.route('login', function(socket, data) {
    var locale = socket.session.locale || __conf.defaultLocale;
    var nbLogged = 0;
    for(var s in app.io.sockets.sockets) {
      if(app.io.sockets.sockets[s].username) nbLogged++;
    }

    if(__conf.maxPlayers && nbLogged >= __conf.maxPlayers) {
      return socket.emit('loginResult', {err: __i18n({phrase: 'This server is full, sorry. Please try again later!', locale: locale})});
    }

    if(data.password !== __conf.password && __conf.password !== null || !data.username) {
      return socket.emit('loginResult', {err: __i18n({phrase: 'Bad Credentials', locale: locale})});
    }

    // Check username
    var username;
    try {
      username = utils.checkUsername(data.username);
    } catch(e) {
      return socket.emit('loginResult', {err: __i18n({phrase: e.message, locale: locale})});
    }

    socket.join('lobby');
    socket.username = username;
    socket.emit('loginResult', {err: null, username: username, gametypes: __staticGametypes});
  });

  /**
   * IO : Get Rooms
   */
  app.io.route('getRooms', function(socket) {
    if(!utils.isInRoom(socket, 'lobby'))
      return;
    socket.emit('roomsList', rooms.getRooms());
  });

  /**
   * IO : Create Room
   */
  app.io.route('createRoom', function(socket, data) {
    if(!utils.isInRoom(socket, 'lobby'))
      return;
    if(utils.isInGame(socket))
      return;
    rooms.createRoom(data.name, data.password, data.type, socket);
  });

  /**
   * IO : Join Room
   */
  app.io.route('joinRoom', function(socket, data) {
    if(!utils.isInRoom(socket, 'lobby'))
      return;
    if(utils.isInGame(socket))
      return;
    rooms.joinRoom(data.id, data.password, socket);
  });

  /**
   * IO : Leave Room
   */
  app.io.route('leaveRoom', function(socket) {
    rooms.leaveRoom(socket);
  });

  /**
   * IO : Kick Player
   */
  app.io.route('kickPlayer', function(socket, username) {

    var room = utils.isInGame(socket);
    var player;
    if(    !room
      || room.started
      || room.players[0] !== socket
      || !(player = room.resolveUsername(username))) {
      return;
    }
    room.message(username + ' has been kicked out of this room.');
    rooms.leaveRoom(player);
  });

  /**
   * IO : Room Parameters
   */
  app.io.route('setRoomSize', function(socket, data) {
    var room = utils.isInGame(socket);
    if(room && room.players[0] === socket && room.players.length <= +data)
      room.setSize(+data);
  });

  app.io.route('setRoomParameter', function(socket, data) {
    var room = utils.isInGame(socket);
    if(room && room.players[0] === socket)
      room.setParameter(data.parameter, data.value, socket);
  });

  /**
   * IO : Chat Management
   */
  app.io.route('sendMessage', function(socket, data) {
    var room = utils.isInGame(socket);
    var message = utils.sanitizeHtml(data.message);
    if(!message)
      return;
    if(room)
      room.sendMessage(data.channel, message, socket);
  });

  /**
   * IO : Start Game !
   */
  app.io.route('startRoom', function(socket) {
    var room = utils.isInGame(socket);
    if(room && room.players[0] === socket && !room.started && room.size === room.players.length)
      room.start();
  });

  /**
   * IO : Execute Action
   */
  app.io.route('executeAction', function(socket, data) {

    if(!socket.player || !data || !data.action)
      return; // Not authorized

    var actions = socket.player.getAvailableActions(false);

    if(!actions[data.action] || actions[data.action].locked)
      return; // Not ready for this action

    if(actions[data.action].type === 'select'
      && actions[data.action].options.safeChoices.indexOf(data.value) < 0)
      return; // Bad value

    if(actions[data.action].type === 'select'
      && actions[data.action].options.choices === 'players') {
      data.value = socket.player.room.resolveUsername(data.value).player;
    }

    actions[data.action].locked = true;
    actions[data.action].execute(socket.player, data.value);
    actions[data.action].locked = false;
  });
};
