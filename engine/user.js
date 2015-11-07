var pw = require('secure-password');

function User(db) {
  var users = db.collection('users');

  // Validate email address
  // http://stackoverflow.com/questions/46155/validate-email-address-in-javascript#answers-header
  function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
  }

  this.signup = function(req, res) {
    var query = {};
    if (validateEmail(req.body.email)) {
      query.email = req.body.email;
      query.password = pw.makePassword(req.body.password, iter = 10, algo = 'sha256', saltLen = 32);
    }
    users.insert(query, function(err, doc) {
      if (err) {
        throw err;
      }

      res.redirect('/');
    });
  };

  this.renderSignup = function(req, res) {
    users.findOne(function(err, doc) {
      if (err) {
        throw err;
      }

      if (doc) {
        res.redirect('/');
      } else {
        var path = '';
        if (process.env.NODE_ENV === 'production') {
          path = 'build/'
        }
        res.render(path + 'signup.html');
      }
    });
  };

  this.login = function(jwt) {
    return function(req, res) {
      var query = {};
      if (req.body.email == undefined || !validateEmail(req.body.email)) {
        var error = 'Enter standard email address';
        res.json({
          err: error
        });

        return;
      }

      query.email = req.body.email;
      users.findOne(query, function(err, doc) {
        if (err) {
          throw err;
        }

        if (doc && pw.verifyPassword(req.body.password, doc.password)) {
          var token = jwt.sign({}, 'eyJpYXQiOjE0NDU2ODk5ODUsImV4cCI6MTQ0NTY5MzU4NX0', {
            expiresInMinutes: 60 * 5
          });

          res.json({
            token: token
          });
        } else {
          var error = 'Fail to login';

          res.json({
            err: error
          });
        }

      });
    }
  }
}

module.exports = User;
