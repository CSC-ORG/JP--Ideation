var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('mongodb://sunnykarira:Grocklmfao123@ds019491.mlab.com:19491/ideation');

function ensureAuthenticated(req, res, next){
	//Passport Authentication API
	if(req.isAuthenticated()){
		return next();
	}	
	res.redirect('/home');
}

/* GET home page. */
router.get('/', ensureAuthenticated, function(req, res, next) {
  //var db = req.db;
  var posts = db.get('posts');
  //var categories = db.get('admincategories');
  var titles= [];
    var mycategory = req.user.category;
    //console.log(mycategory);
    for(i=0; i< mycategory.length; i++){
      var temp = {};
      temp.title = mycategory[i];
      titles.push(temp);
    }
  posts.find({},{},function(err, posts){
    
      res.render('index', {
      'posts': posts,
      'categories': titles
    });
  });
});


router.get('/home', function(req, res, next) {
  res.render('externalindex', { title: 'Home' });
});

module.exports = router;
