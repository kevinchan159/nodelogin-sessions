var expressValidator = require('express-validator');
var userController = require('../controllers/userController');
var sessions = require('client-sessions');
var flash = require('connect-flash');


module.exports = function(app) {

	// Middleware

	//taken from express validator github
	// used to check fields like username, email, password when registering user
	// In this example, the formParam value is going to get morphed into form body 
	// format useful for printing.
	app.use(expressValidator({
	  errorFormatter: function(param, msg, value) {
	      var namespace = param.split('.')
	      , root    = namespace.shift()
	      , formParam = root;

	    while(namespace.length) {
	      formParam += '[' + namespace.shift() + ']';
	    }
	    return {
	      param : formParam,
	      msg   : msg,
	      value : value
	    };
	  }
	}));

	app.use(sessions({ 
		cookieName: 'session', 
		secret: 'my_super_secret_key_alknalksnalkns',
		duration: 60 * 60 * 1000,
	    secure: true, // only use cookies over htttps
		httpOnly: true // prevent cookie access from javascript
	}));
	app.use(flash());

	app.use(function(req, res, next) {
		res.locals.success_msg = req.flash('success_msg');
		res.locals.error_msg = req.flash('error_msg');
		next();
	});

	app.use(function(req, res, next) {
		if (req.session && req.session.user) {
			User.findOne({ username: req.session.user.username}, function(err, user) {
				if (user) {
					req.user = {
						name: user.name,
						username: user.username,
						email: user.email
					};
					req.session.user = req.user;
					res.locals.user = req.user;
					console.log('res locals user is' + res.locals.user.name);
				} else {
					req.session.reset();
					res.redirect('/login');
				}
			});
		}
		next();
		
	});

	function checkUserLoggedIn(req, res, next) {
		if (!req.session.user) {
			// user is not logged in so go to login
			res.redirect('/login');
		} else {
			// user is logged in so proceed to dashboard
			res.locals.user = req.session.user;
			req.user = req.session.user;
			next();
		}

	};

	app.get('/', checkUserLoggedIn, function(req, res) {
		// use middle ware to check if user is logged in
		// if user is not logged in go to login page
		res.render('index');
	});

	app.get('/login', checkUserLoggedIn, function(req, res) {
		// if user is not logged in go to login page
		// else go to dashboard
		res.redirect('/dashboard');
	});

	app.post('/login', function(req, res) {
		var username = req.body.username;
		var password = req.body.password;

		userController.findUserByUsername(username, function(err, user) {
			if (err) {
				throw err;
			}
			if (!user) {
				// no user found
				req.flash('error_msg', 'No user found matching information');
				res.redirect('/login')
			} else {
				// user found so check password
				userController.checkPassword(password, user.password, function(err, isMatch) {
					if (err) {
						req.flash('error_msg', err);
						res.redirect('/login');
					}
					if (!isMatch) {
						// passwords do not match
						req.flash('error_msg', 'Password is incorrect');
						res.redirect('/login');
					} else {
						// passwords do match so go to dashboard
						res.locals.user = {
							name: user.name,
							email: user.email,
							username: user.username
						};
						req.user = res.locals.user;
						req.session.user = res.locals.user; // header will have set-cookie: session = {emaiL: ...}
						res.redirect('/dashboard');
					}
				});
			}
		});
	});

	app.use(function(req, res, next) {
		res.locals.success_msg = req.flash('success_msg');
		res.locals.error_msg = req.flash('error_msg');
		next();
	});


	app.get('/register', function(req, res) {
		res.render('register');
	});

	app.post('/register', function(req, res) {
		var name = req.body.name;
		var username = req.body.username;
		var email = req.body.email;
		var password = req.body.password;
		var password2 = req.body.password2;

		// check fields of req.body
		req.checkBody('name', 'Name is required').notEmpty();
		req.checkBody('username', 'Username is required').notEmpty();
		req.checkBody('email', 'Email is required').notEmpty();
		req.checkBody('email', 'Email is not valid').isEmail();
		req.checkBody('password', 'Password is required').notEmpty();
		req.checkBody('password2', 'Please conform password').notEmpty();
		req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

		var errors = req.validationErrors();

		if (errors) {
			// errors exist so refresh register page with errors as parameter
			res.render('register', {
				errors: errors
			});
		} else {
			// no validation errors
			var user = new User({
				name: name,
				username: username,
				email: email,
				password: password
			});
			userController.createUser(user, function(err, user) {
				if (err) {
					//error creating user
					res.render('register', {
						errors: err
					});
				}

				req.flash('success_msg', 'You have succesfully created a user!');

				res.redirect('/login');

			});
		}

	});


	app.get('/dashboard', checkUserLoggedIn, function(req, res) {
		res.render('index');
	});

	app.get('/logout', function(req, res) {
		req.session.reset();
		res.redirect('/login');
	});
};