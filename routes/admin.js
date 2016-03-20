var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var moment = require('moment');
var bodyParser = require('body-parser');

var mongo = require('mongodb');
var uri = 'mongodb://sunnykarira:Grocklmfao123@ds019491.mlab.com:19491/ideation';
var User = require('../models/user.js');
var db = require('monk')('sunnykarira:Grocklmfao123@ds019491.mlab.com:19491/ideation');



// require passport and local startegy
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;


var admin = undefined;

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}



router.get('/', function(req, res, next){
	res.redirect('/admin/login');
});

router.get('/login', function(req, res, next){
	res.render('adminlogin', {
		title: 'Admin Login'
	})
});

router.get('/register', function(req, res, next){
	res.render('adminregister', {
		title: 'Admin Register'
	});
});


router.post('/register', function(req, res, next){


	//Get the form values
	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;


	//Form Validation
	// Value and error
	req.checkBody('name', 'Name field is required').notEmpty();
	req.checkBody('email', 'Email field is required').notEmpty();
	req.checkBody('email', 'Email not valid').isEmail();
	req.checkBody('password', 'Password field is required').notEmpty();
	req.checkBody('password2', 'Password do not match').equals(req.body.password);

	//Check for errors
	var errors = req.validationErrors();

	if(errors){
		res.render('register', {
			errors: errors,
			name: name,
			email: email,
			password: password,
			password2: password2
		});
	}else{

			var newUser = new User({
			name: name,
			type: 'admin',
			email: email,
			password: password
			});

		// Create User
		User.createUser(newUser, function (err, user){
			if(err) throw err;
			console.log(user);

		});

		//Success Message
		req.flash('success', 'You are now registered and may log in');
		res.location('/admin');
		res.redirect('/admin');
	}
});


//Post login route
router.post('/login', function(req, res, next){
	var users = db.get('users');
	var name = req.body.name;
	var password = req.body.password;
	console.log('Admin Password   ' + password + '       Admin Name  '  + name);

	users.find({
		type: 'admin', 
		name: name
	}, {}, function(err, user){
		//console.log(user);
		bcrypt.compare(password, user.password, function(err, matched){
			if(err) throw err;
			if(matched){
				admin = user;
				console.log('Auth successful');
				req.flash('success', 'You are logged in as Admin');
				res.location('/admin/adminindex');
				res.redirect('/admin/adminindex');
			}
		});
	});
});

router.get('/adminindex', function(req, res, next){
	res.render('adminindex', {
		title: 'Admin Index',
		user: admin.name
	});
});


router.get('/adminindex/users', function(req, res, next){
		var users = db.get('users');
		users.find({type:'normal'}, {}, function(err, users){
				res.render('adminusers', {
					title: 'Admin Users',
					users: users
				});
		});
});

router.get('/adminindex/addcategory', function(req, res, next){
		var categories = db.get('admincategories');
		categories.find({}, {}, function(err, categories){
				res.render('addcategory', {
					title: 'Add Category',
					categories: categories
				});
		});
});


router.post('/adminindex/addcategory', function(req, res, next){
	var title = req.body.title;

	req.checkBody('title', 'Title Field is required').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		res.render('addcategory', {
			"errors": errors,
			"title": title
		});
	}else{
		var categories = db.get('admincategories');
	}

	title = title.toLowerCase();
	title = capitalizeFirstLetter(title);
	//console.log(title);
	categories.find({'title': title}, {}, function(err, category){
			if(err) throw err;
			if(category.length != 0){
				req.flash('info', 'Category already exists, try submitting another category');
				res.redirect('addcategory');
			}else{
				//Submit to db
				categories.insert({
				"title": title
				}, function (err, category){
				if(err){
					res.send('There was an issue adding the category');
				}else{
				req.flash('success','Category submitted');
				res.location('addcategory');
				res.redirect('addcategory');
				}
				});
			}
	});

	
});


router.get('/adminindex/bycategory', function(req, res, next){
	//var category = req.body.category;
	//var posts = db.get('adminposts');
	var categories = db.get('admincategories');

	categories.find({}, {}, function(err, categories){
			
			res.render('adminbycategory', {
				title: 'Admin Posts',
				categories: categories
	});

	});
	
});


router.post('/adminindex/bycategory', function(req, res, next){
	var category = req.body.category;
	var posts = db.get('adminposts');
	var categories = db.get('admincategories');

	categories.find({}, {}, function(err, categories){
			posts.find({category: category}, {}, function(err, posts){
			res.render('adminbycategory', {
				title: 'Admin Posts',
				posts: posts,
				categories: categories
			});
	});

});
	
});


router.get('/adminindex/show/:id', function(req, res, next){
	var db = req.db;
	var user = req.user;
	var posts = db.get('adminposts');
	posts.findById(req.params.id, function(err, post){
		res.render('adminshow', {
			"post": post,
			admin: admin
		});
	});
});



router.get('/adminindex/approve/:postid' , function(req, res, next){
	var posts = db.get('adminposts');
	var userposts = db.get('posts');
	//console.log(postid);
	posts.findById(req.params.postid, function(err, post){
		userposts.findById(req.params.id, function(err, userpost){
			if(userpost === null){

				userposts.insert(post);
				posts.remove(post);
				//console.log('Pushed in User posts');
				req.flash('success', 'Idea published to users');
				res.location('/admin/adminindex/bycategory');
				res.redirect('/admin/adminindex/bycategory');
			}else{
				req.flash('error', 'Idea already published');
				res.location('/admin/adminindex/bycategory');
				res.redirect('/admin/adminindex/bycategory');

			}
		});
		
	});
});
router.get('/adminindex/disapprove/:postid', function(req, res, next){
	var posts = db.get('adminposts');
	posts.findById(req.params.id, function(err, post){
		 posts.remove(post);
		 req.flash('success', 'Idea Disapproved');
		 res.location('/admin/adminindex/bycategory');
		 res.redirect('/admin/adminindex/bycategory');


	});
});

router.get('/adminindex/profile', function(req, res, next){
	var user = admin;
	res.render('adminprofile', {
		"title": "Edit Profile",
		user: user
	});
});

router.post('/adminindex/profile', function (req, res, next){
	//Get the form values
	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;



	//Form Validation
	// Value and error
	req.checkBody('name', 'Name field is required').notEmpty();
	req.checkBody('email', 'Email field is required').notEmpty();
	req.checkBody('email', 'Email not valid').isEmail();
	req.checkBody('password', 'Password field is required').notEmpty();
	req.checkBody('password2', 'Password do not match').equals(req.body.password);

	//Check for errors
	var errors = req.validationErrors();

	if(errors){
		res.render('profile', {
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
		users.update({
			email: email,
			name: name
		}, {
			$set: {
				password: password
			}
		}, function(err, user){
			if(err) throw(err);
			req.flash('success','Profile updated, You may log in');
			res.location('/admin/adminindex');
			res.redirect('/admin/adminindex');
			
		});

	});
		
		
	}
});


router.get('/logout', function(req, res, next){
	admin = undefined;
	req.logout();
	res.location('/');
	res.redirect('/');
});

module.exports = router;