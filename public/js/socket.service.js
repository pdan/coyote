import io from 'socket.io-client';

function socket($rootScope, $http) {
  var socket;

  return {
    init: function(token, callback) {

      socket = io.connect('', {
        query: 'token=' + token
      });

      socket.on('connect', function(socket) {
        callback(false);
      });

      socket.on('disconnect', function() {
        console.log('Disconected');
      });

      socket.on('error', function(error) {
        if (error.type == "UnauthorizedError" || error.code == "invalid_token") {
          callback('User\'s token has expired');
        }
      });

    },
    remove: function(eventsName) {
      socket.removeAllListeners(eventsName);
    },
    on: function(eventName, callback) {
      socket.on(eventName, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          callback.apply(socket, args);
        });
      });
    },
    emit: function(eventName, data, callback) {
      socket.emit(eventName, data, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
}

socket.$inject = ['$rootScope', '$http'];
export default socket;
