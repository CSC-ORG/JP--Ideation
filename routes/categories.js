var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var database = require('monk')('localhost/nodeblog');

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
		var categories = database.get('admincategories');
	}	

	//Submit to db
	categories.insert({
		"title": title
	}, function (err, category){
		if(err){
			res.send('There was an issue adding the category');

		}else{
			req.flash('success','Category submitted to admin');
			res.location('/');
			res.redirect('/');
		}
	});
});

module.exports = router;