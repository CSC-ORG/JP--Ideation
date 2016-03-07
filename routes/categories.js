var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/ideation');


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

router.get('/show/:category', function(req, res, next){
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

router.get('/add', function(req, res, next) {
 	res.render('addcategory', {
 		"title": "Add Category"
 	})
});

router.post('/add', function(req, res, next){
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
				res.redirect('/categories/add');
			}else{
				//Submit to db
				categories.insert({
				"title": title
				}, function (err, category){
				if(err){
					res.send('There was an issue adding the category');
				}else{
				req.flash('success','Category submitted');
				res.location('/');
				res.redirect('/');
				}
				});
			}
	});

	
});

module.exports = router;