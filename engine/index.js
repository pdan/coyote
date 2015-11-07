var jwt = require('jsonwebtoken');
var User = require('./user');
var CloudFlare = require('./cloudflare');

module.exports = exports = {
  start: function(app, db, io) {
    var user = new User(db);
    var cf = new CloudFlare(db);

    io.on('connection', function(socket) {

      socket.on('save settings', cf.saveSettings);

      socket.on('save reserved zones list', cf.saveZones);
      socket.on('get reserved zones list', function() {
        cf.getReservedZones(function(doc) {
          socket.emit('get reserved zones list', doc);
        });
      });

      socket.on('get zones list', function() {
        cf.getZones(function(doc) {
          socket.emit('get zones list', doc);
        });
      });



      socket.on('get settings', function() {
        cf.getSettings(function(doc) {
          socket.emit('get settings', doc);
        });
      });

      socket.on('refresh zones list', function() {
        cf.fetchZonesList(function(doc) {
          socket.emit('refresh zones list', doc);
        });
      });

    });

    app.get('/', function(res, req) {
      var path = '';
      if (process.env.NODE_ENV === 'production') {
        path = 'build/'
      }

      req.render(path + 'index.html');
    });

    app.post('/login', user.login(jwt));

    app.get('/signup', user.renderSignup);
    app.post('/signup', user.signup);
  }
}
