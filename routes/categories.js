var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('mongodb://localhost/ideation');


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function ensureAuthenticated(req, res, next){
	//Passport Authentication API
	if(req.isAuthenticated()){
		return next();
	}	
	res.redirect('/home');
}


router.get('/show/:category',ensureAuthenticated, function(req, res, next){
	var db = req.db;
	var posts = db.get('adminposts');
	var categories = db.get('admincategories');
	posts.find({category: req.params.category}, {}, function(err, posts){
		
		categories.find({},{}, function(err, categories){
			if(err) throw err;
			res.render('index', {
			"title": req.params.category,
			"posts": posts,
			"categories": categories
			});
		});
	});
});


router.get('/add', ensureAuthenticated, function(req, res, next) {
 	res.render('addcategory', {
 		"title": "Add Category"
 	})
});



module.exports = router;