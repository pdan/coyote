class AppController {
  constructor($scope, $rootScope, socket, $http, $timeout) {
    var enableRecords = {};

    if (!localStorage.getItem('token')) {
      return;
    }

    $scope.formDisable = false;

    socket.on('get settings', function(doc) {
      $scope.formDisable = false;
      $scope.apiKey = doc[0].api;
      $scope.email = doc[0].email;
      $scope.time = doc[0].time;
      $scope.ipServer = doc[0].ip;
      $timeout(function() {
        $.material.init();
      });
    });

    socket.on('get zones list', function(doc) {
      socket.emit('get reserved zones list');
      $scope.zones = doc;

      $timeout(function() {
        $.material.init();
      });
    });

    socket.on('refresh zones list', function() {
      socket.emit('get zones list');
      $scope.formDisable = false;
    });

    socket.on('get reserved zones list', function(doc) {

      enableRecords = {};
      // Sorry for this piece
      angular.forEach(doc, function(reserveZone) {
        if (!enableRecords[reserveZone.zone_id]) {
          enableRecords[reserveZone.zone_id] = [];
        }
        enableRecords[reserveZone.zone_id].push(reserveZone);
        angular.forEach($scope.zones, function(zone) {
          if (zone._id === reserveZone.zone_id) {
            for (var i in zone.records) {
              if (reserveZone._id === zone.records[i]._id) {
                zone.records[i].ddns = true;
              }
            }
          }
        });
      });
    });

    $scope.saveZonesList = function() {
      socket.emit('save reserved zones list', enableRecords);
    }

    $scope.changeRecordStatus = function(record) {

      if (enableRecords[record.zone_id] === undefined) {
        enableRecords[record.zone_id] = [];
      }
      if (record.ddns) {
        enableRecords[record.zone_id].push(record);
      } else {
        angular.forEach(enableRecords[record.zone_id], function(value, index) {
          if (value._id === record._id) {
            enableRecords[record.zone_id].splice(index, 1);
          }
        });
      }
    }

    $scope.refreshZonesList = function() {
      socket.emit('refresh zones list');
      $scope.formDisable = true;
    }

    $scope.signOut = function() {
      localStorage.removeItem('token');
      $rootScope.loggedin = false;
    }

    $scope.getSettings = function() {
      socket.emit('get settings');
      socket.emit('get zones list');
      $scope.formDisable = true;
    }
    $scope.getSettings();
    $scope.saveSettings = function() {
      socket.emit('save settings', {
        _id: 'app',
        api: $scope.apiKey,
        email: $scope.email,
        time: $scope.time,
        ip: $scope.ipServer
      });
    }
  }
}

AppController.$inject = ['$scope', '$rootScope', 'Socket', '$http', '$timeout'];

export default AppController
