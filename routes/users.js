var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');

//var User = require('../models/user.js');
var mongo = require('mongodb');
var db = require('monk')('localhost/ideation');

// require passport and local startegy
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;

/* GET users listing. */
/*router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});*/

router.get('/register', function(req, res, next){
	res.render('register', {
		'title': 'Register'
	});
});

router.get('/login', function(req, res, next){
	res.render('login', {
		'title': 'Login'
	});
});

router.post('/register', function (req, res,next){
	//Get the form values
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;



		//Check for image field
	if(req.files.profileimage){
		console.log('Uploading file...');
		//Getting file info
		var profileImageOriginalName = req.files.profileimage.originalname;
		var profileImageName = req.files.profileimage.name;
		var profileImageMime = req.files.profileimage.mimetype;
		var profileImagePath = req.files.profileimage.path;
		var profileImageExt = req.files.profileimage.extension;
		var profileImageSize = req.files.profileimage.size;
	}else{
		//Set a default image
		var profileImageName = 'noImage.png';
	}

	//Form Validation
	// Value and error
	req.checkBody('name', 'Name field is required').notEmpty();
	req.checkBody('email', 'Email field is required').notEmpty();
	req.checkBody('email', 'Email not valid').isEmail();
	req.checkBody('username', 'Username field is required').notEmpty();
	req.checkBody('password', 'Password field is required').notEmpty();
	req.checkBody('password2', 'Password do not match').equals(req.body.password);

	//Check for errors
	var errors = req.validationErrors();

	if(errors){
		res.render('register', {
			errors: errors,
			name: name,
			email: email,
			username: username,
			password: password,
			password2: password2
		});
	}else{

	var users = db.get('users');
	bcrypt.hash(password, 10, function (err, hash){
		if(err) throw err;
		//Set hashed password
		password = hash;
		users.insert({
			name: name,
			email: email,
			username: username,
			password: password,
			profileimage: profileImageName
		}, function (err, user){
			if(err){
				res.send('There was an issue in registration');
			}else{
				req.flash('success', 'Created account for: '+ name + ', You may log in');
				res.location('/');
				res.redirect('/');
			}
		});
	});

	}


});


passport.serializeUser(function(user, done){
	done(null, user._id);
});

passport.deserializeUser(function(id, done){
	
	User.getUserById(id, function(err, user){
		done(err, user);
	})
});

passport.use(new localStrategy(

		function(username, password, done){
			var users = db.get('users');
			users.findOne({
				username: username
			}, function (err, user){
				if(err) return done(err);
				if(!user){
					console.log('Unknown User');
					return done(null, false, {
						message: 'Unknown User'
					});
				}

				bcrypt.compare(password, user.password, function(err, isMatch){
					if(err) return done(err);
					if(isMatch){
						return done(null, user);
					}else{
						console.log('Invalid Password');
						return done(null, false, {
							message:'Invalid Password'
						});
					}
				});


			});

		}
	));

//Post login route
router.post('/login', passport.authenticate('local', {
	failureRedirect:'/users/login',
	failureFlash:'Invalid Username or Password'
}), function (req, res, next){
	console.log('Authentication Successful');
	req.flash('success', 'You are logged in');
	res.location('/');
	res.redirect('/');
});





module.exports = router;
