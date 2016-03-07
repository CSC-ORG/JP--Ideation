var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/ideation');

function ensureAuthenticated(req, res, next){
	//Passport Authentication API
	if(req.isAuthenticated()){
		return next();
	}	
	res.redirect('/home');
}

/* GET home page. */
router.get('/', ensureAuthenticated, function(req, res, next) {
  var db = req.db;
  var posts = db.get('adminposts');
  var categories = db.get('admincategories');
  posts.find({},{},function(err, posts){
    
    categories.find({}, {}, function(err, categories){
      res.render('index', {
      'posts': posts,
      'categories': categories
      });
    });
  });
});


router.get('/home', function(req, res, next) {
  res.render('externalindex', { title: 'Home' });
});

module.exports = router;
