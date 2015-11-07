// import 'RobotoDraft:300,400,500,700,400italic !font';
import app from 'js/app';
import 'bootstrap-material';

angular.element(document).ready(function() {
  angular.bootstrap(document, [app.name]);
  $.material.init();
});
