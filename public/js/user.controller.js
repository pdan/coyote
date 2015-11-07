class UserController {
  constructor($scope, $rootScope, socket, $http) {
    $scope.loginFail = false;

    $scope.authUser = function() {
      $http.post('/login', {
        email: $scope.email,
        password: $scope.password
      }).then(function(doc) {
        if (doc.data.err) {
          $scope.loginFail = doc.data.err;
          return;
        }
        socket.init(doc.data.token, function(err) {
          if (err) {
            console.log(err);
          } else {
            localStorage.setItem('token', doc.data.token);
            $rootScope.loggedin = true;
            $rootScope.$apply();
            // This below line should be removed and init user.controller instead of this.
            window.location.reload();
          }
        });
      });
    }
  }
}

UserController.$inject = ['$scope', '$rootScope', 'Socket', '$http'];

export default UserController
