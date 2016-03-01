var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var database = require('monk')('localhost/ideation');

router.get('/add', function (req, res, next){
	var categories = database.get('categories');
	var user = req.user;
	req.flash('info', 'All posts will be automatically deleted within 7 days. If you want to change the deletion date, please visit published post section after publishing the post.');
	categories.find({}, {}, function (err, categories){
		res.render('addpost', {
			"title":"Add post",
			"categories": categories
		});
	});
});


router.post('/add', function (req, res, next){

	var title = req.body.title;
	var category = req.body.category;
	var body = req.body.body;
	var author = req.body.author;
	var date = new Date();

	if(req.files.mainimage){
		var mainImageOriginalName = req.files.mainimage.originalname;
		var mainImageName = req.files.mainimage.name;
		var mainImageMime = req.files.mainimage.mimetype;
		var mainImagePath = req.files.mainimage.path;
		var mainImageExt = req.files.mainimage.extension;
		var mainImageSize = req.files.mainimage.size;

	}else{
		var mainImageName = 'noimage.png';
	}

	//Validation
	req.checkBody('title', 'Title field is required').notEmpty();
	req.checkBody('body', 'Body field is required').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		res.render('addpost', {
			"errors": errors,
			"title": title,
			"body": body
		});
	}else{
		var adminpost = database.get('adminposts');

		//Submit to admindb
		adminpost.insert({
			"title": title,
			"body": body,
			"category":category,
			"date":date,
			"author":author,
			"mainimage": mainImageName
		}, function (err, post){
			if(err){
				res.send('There was an issue submitting the post to admin.');
			}else{
				req.flash('success', 'Post Submitted to admin, Once reviewed it will be published');
				res.location('/');
				res.redirect('/');
			}
		});
	}

});

module.exports = router;