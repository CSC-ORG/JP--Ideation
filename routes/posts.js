var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('sunnykarira:Grocklmfao123@ds019491.mlab.com:19491/ideation');

function ensureAuthenticated(req, res, next){
	//Passport Authentication API
	if(req.isAuthenticated()){
		return next();
	}	
	res.redirect('/home');
}

router.get('/show/:id',ensureAuthenticated, function(req, res, next){
	var db = req.db;
	var user = req.user;
	var posts = db.get('posts');

		var titles= [];
		var mycategory = req.user.category;
		//console.log(mycategory);
		for(i=0; i< mycategory.length; i++){
			var temp = {};
			temp.title = mycategory[i];
			titles.push(temp);
		}
	posts.findById(req.params.id, function(err, post){
		res.render('show', {
			"post": post,
			usercategories: titles
		});
	});
		
});


router.get('/bycategory/:category', function(req, res, next){
	var posts = db.get('posts');

	var titles= [];
		var mycategory = req.user.category;
		//console.log(mycategory);
		for(i=0; i< mycategory.length; i++){
			var temp = {};
			temp.title = mycategory[i];
			titles.push(temp);
		}

	posts.find({'category': req.params.category}, {}, function(err, posts){
		res.render('index', {
			posts: posts,
			categories: titles
		});
	});

});


router.get('/myposts', function(req, res, next){
	var db = req.db;
	var user = req.user;
	var posts = db.get('posts');
	// posts.findById(req.params.id, function(err, post){
	// 	res.render('show', {
	// 		"post": post
	// 	});
	// });
		var titles= [];
		var mycategory = req.user.category;
		//console.log(mycategory);
		for(i=0; i< mycategory.length; i++){
			var temp = {};
			temp.title = mycategory[i];
			titles.push(temp);
		}

	posts.find({'author': req.user.name}, {}, function(err, posts){
		res.render('index', {
			posts: posts,
			categories: titles
		});
	});
});


router.get('/add', ensureAuthenticated, function (req, res, next){
	
	req.flash('info', 'All posts will be automatically deleted within 7 days. If you want to change the deletion date, please visit published post section after publishing the post.');
		var titles= [];
		var mycategory = req.user.category;
		//console.log(mycategory);
		for(i=0; i< mycategory.length; i++){
			var temp = {};
			temp.title = mycategory[i];
			titles.push(temp);
		}

		//console.log(titles);
		//return;

		res.render('addpost', {
			"title":"Add Idea",
			"categories": titles
		});
});


router.post('/add', ensureAuthenticated, function (req, res, next){

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
		var adminpost = db.get('adminposts');

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

//Add comment
router.post('/addcomment', ensureAuthenticated, function(req, res, next){
	//Get form values
	var name        = req.body.name;
	var email 		= req.body.email;
	var body		= req.body.body;
	var postid 		= req.body.postid;
	var commentdate 		= new Date();


	//Validation
	req.checkBody('name', 'Name field is required').notEmpty();
	req.checkBody('email', 'Email field is required').notEmpty();
	req.checkBody('email', 'Provide a valid email').isEmail();
	req.checkBody('body', 'Body field is required').notEmpty();

	// Check errors
	var errors = req.validationErrors();
	var posts = db.get('posts');
	if(errors){
		
		posts.findById(postid, function(err, post){
			res.render('show', {
			"errors": errors,
			"posts": post,
			
			});
		});
		
	}else{
		var comment = {
			"name": name,
			"email": email,
			"body": body,
			"commentdate": commentdate
		}


		posts.update({
			"_id": postid
		},
		{
			$push: {
				'comments': comment
			}
		},
		function(err, doc){
				if(err) 
					throw err;
				else{
					req.flash('success','Comment Added');
					res.location('/posts/show/' + postid);
					res.redirect('/posts/show/' + postid);
				}
			}
		);
	}

});

module.exports = router;