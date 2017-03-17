var bodyParser = require('body-parser');
var User =  require('../models/user');
var RegistrationForm = require('../models/registrationForm');
var jwt = require('jsonwebtoken');
var config = require('../../config');

var superSecret = config.secret;

module.exports = function(app, express) {

  var apiRouter = express.Router();

  apiRouter.post('/sushiman', function(req, res) {
    res.json({
      message: config.testFunction()
    });
  });
  /*apiRouter.post('/sendContactEmail', function(req, res) {
    var mailgun = require('mailgun-js')({apiKey: config.mailgun_api_key, domain: config.domain});
    var data = {
      from: 'CT Coders Customer Contact Form <postmaster@mail.ct-coders.com>',
      to: 'jake@ct-coders.com',
      subject: req.body.firstName + ' ' + req.body.lastName + ' is contacting us!',
      text: 'Someone has shown interest in CT Coders! Here is their information: ' + req.body.firstName + ' ' + req.body.lastName + ' at ' + req.body.email + ' or ' + req.body.phone
    };

    mailgun.messages().send(data, function (error, body) {
      console.log(body);
    });

    res.json({
      success: true,
      message: 'Message sent!'
    });
  });*/


  // Route - Sample User Generator
  // ---------------------------------------------------------------------------

  apiRouter.post('/registerUser', function(req, res) {
    var newUser = new User();
    console.log(newUser);
    newUser.name = req.body.name;
    newUser.username = req.body.username;
    newUser.password = req.body.password;

    //newUser.save();

    res.json({
      success: true,
      message: 'New user created!'
    });
  });

  // Route - Authenticate User
  // ---------------------------------------------------------------------------
  apiRouter.post('/authenticate', function(req, res) {

    // Find the username
    User.findOne({
      username: req.body.username
    }).select('name username password').exec(function(err, user) {

      if (err) throw err;

      // No user with that username was found
      if (!user) {
        res.json({
          success: false,
          message: 'Authentication failed. User not found'
        });
      } else if (user) {

        // Check if password matches
        var validPassword = user.comparePassword(req.body.password);
        if (!validPassword) {
          res.json({
            success: false,
            message: 'Authentication failed! Wrong password.'
          });
        } else {

          // If user is found and password is right.
          // Create a token
          var token = jwt.sign({
            name: user.name,
            username: user.username
          }, superSecret, {
            expiresIn: '24h'
          });

          // Return info including token as json
          res.json({
            success: true,
            message: 'Enjoy your token!',
            token: token
          });
        }
      }
    });
  });

  // API Routes for Register Now! Section
  apiRouter.route('/registerNow')
    .post(function(req, res) {

      var newForm = new RegistrationForm();
      console.log(req.body);
      newForm.studentFirst = req.body.studentFirst;
      newForm.studentLast = req.body.studentLast;
      newForm.studentGrade = req.body.studentGrade;
      newForm.studentAge = req.body.studentAge;
      newForm.parentFirst = req.body.parentFirst;
      newForm.parentLast = req.body.parentLast;
      newForm.parentEmail = req.body.parentEmail;

      newForm.save();

      var mailgun = require('mailgun-js')({apiKey: config.mailgun_api_key, domain: config.domain});
      var data = {
        from: 'CT Coders Student Registration Form <postmaster@mail.ct-coders.com>',
        to: newForm.parentEmail,
        subject: 'CT Coders ' + newForm.studentFirst + ' Course Registration Confirmation',
        text: 'Hello, ' + newForm.parentFirst + '!\nWe are happy to inform you that ' + newForm.studentFirst + ' ' + newForm.studentLast +
              ' has been registered and has been enrolled in our ' + newForm.courseName + ', 8-week programming course!\nBelow are the course details:\n\n' +
              req.body.courseName + '\n' + req.body.courseLocation + '\n' + req.body.courseTimes + '/n/nThank you for choosing us and we look forward to teaching ' +
              req.body.studentFirst + '!\n Sincerely,\n CT Coders'
      };

      mailgun.messages().send(data, function (error, body) {
        console.log(body);
      });

      res.json({
        success: true,
        message: 'New form created and email sent to ' + req.body.parentFirst + ' ' + req.body.parentLast +  '.'
      });
    })
    .get(function(req, res) {
      res.json({
        message: 'Yello'
      });
    })


  // Route Middleware to verify token
  // ---------------------------------------------------------------------------
	/* apiRouter.use(function(req, res, next) {

	  // check header or url parameters or post parameters for token
	  var token = req.body.token || req.query.token || req.headers['x-access-token'];

	  // decode token
	  if (token) {

	    // verifies secret and checks exp
	    jwt.verify(token, superSecret, function(err, decoded) {

	      if (err) {
	        res.status(403).send({
	        	success: false,
	        	message: 'Failed to authenticate token.'
	    	});
	      } else {
	        // if everything is good, save to request for use in other routes
	        req.decoded = decoded;

	        next(); // make sure we go to the next routes and don't stop here
	      }
	    });

	  } else {

	    // if there is no token
	    // return an HTTP response of 403 (access forbidden) and an error message
   	 	res.status(403).send({
   	 		success: false,
   	 		message: 'No token provided.'
   	 	});

	  }
	}); */

  // Route - Welcome to API
  // ---------------------------------------------------------------------------
  apiRouter.get('/', function(req, res) {
    res.json({
      message: 'Welcome to the API.'
    });
  });

  // Route - /api/users
  // ---------------------------------------------------------------------------
  apiRouter.route('/users')

    .post(function(req, res) {
      var user = new User();
      user.name = req.body.name;
      user.username = req.body.username;
      user.password = req.body.password;

      user.save(function(err) {
        if (err) {
          // Duplicate entry
          if (err.code == 11000) {
            return res.json({ success: false, message: 'A user with that username already exists!' });
          } else {
            return res.send(err);
          }
        }
        // Return a message
        res.json({ message: user.username + ' created!' });
      });
    })

    .get(function(req, res) {
      User.find({}, function(err, users) {
        if (err) res.send(err);

        // Return the users
        res.json(users);
      });
    });

  // Route - /users/user_id
  // ---------------------------------------------------------------------------
  apiRouter.route('/users/:user_id')
    .get(function(req, res) {
      User.findById(req.params.user_id, function(err, user) {
        if (err) res.send(err);

        // Return that user
        res.json(user);
      });
    })

    .put(function(req, res) {
      User.findById(req.params.user_id, function(err, user) {
        if (err) res.send(err);

        // Set the new user info if it exists in the request
        if (req.body.name) user.name = req.body.name;
        if (req.body.username) user.username = req.body.username;
        if (req.body.password) user.password = req.body.password;

        // Save the user
        user.save(function(err) {
          if (err) res.send(err);

          // Return a message
          res.json({ message: 'User updated!' });
        });
      });
    })

    .delete(function(req, res) {
      User.remove({
        _id: req.params.user_id
      }, function(err, user) {
        if (err) res.send(err);

        res.json({ message: 'Successfully deleted!' });
      });
    });

    // Route - User info
    // -------------------------------------------------------------------------
    apiRouter.get('/me', function(req, res) {
      console.log(req);
      res.send(req.decoded);
    });

    return apiRouter;
};
