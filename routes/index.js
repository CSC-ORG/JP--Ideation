var express = require('express');
var router = express.Router();

function ensureAuthenticated(req, res, next){
	//Passport Authentication API
	if(req.isAuthenticated()){
		return next();
	}	
	res.redirect('/users/login');
}

/* GET home page. */
router.get('/', ensureAuthenticated, function(req, res, next) {
  res.render('index', { title: 'Members Area' });
});

router.get('/home', function(req, res, next) {
  res.render('externalindex', { title: 'Home' });
});

module.exports = router;
