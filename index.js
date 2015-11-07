var express = require('express');
var app = express();
var consolidate = require('consolidate');
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var io = require('socket.io')(http);
var socketioJwt = require('socketio-jwt');
var path = require('path');
var fs = require('fs');
var Tingodb = require('tingodb')();
var engine = require('./engine');
var databasePath = path.resolve(__dirname, './database');

// Create directory path if it doesn't exist
if (!fs.existsSync(databasePath)) {
  fs.mkdirSync(databasePath, 0766, function(err) {
    if (err) {
      throw err;
    }
  });
}

var db = new Tingodb.Db(databasePath, {});

app.engine('html', consolidate.ejs);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
io.use(socketioJwt.authorize({
  secret: 'eyJpYXQiOjE0NDU2ODk5ODUsImV4cCI6MTQ0NTY5MzU4NX0',
  handshake: true
}));

engine.start(app, db, io);

http.listen(11235);
