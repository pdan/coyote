import angular from 'angular';

import UserController from 'js/user.controller';
import AppController from 'js/app.controller';
import SocketService from 'js/socket.service'

let app = angular
  .module('coyote', [])
  .controller('UserController', UserController)
  .controller('AppController', AppController)
  .service('Socket', SocketService)
  .run(function($rootScope, Socket) {

    // Restore token
    var token = localStorage.getItem('token');

    // Doing somethings on start
    var start = function(loggedin) {
      $rootScope.loggedin = loggedin;
      $rootScope.loaded = true;
      $rootScope.$apply();
      $('#login, #app').removeAttr('style');
    };

    // Check user auth status
    if (token) {
      Socket.init(token, function(err, doc) {
        if (err) {
          localStorage.removeItem('token');
          start(false);
        } else {
          start(true);
        }
      });
    } else {
      start(false);
    }
  });

export default app;
