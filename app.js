var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
//var bodyParser = require('body-parser');

//require modules
var expressValidator = require('express-validator');
var session = require('express-session');

var bodyParser = require('body-parser');
// File upload helper
var multer = require('multer');
var flash = require('connect-flash');

// Mongo stuff
var mongo = require('mongodb');

var db = require('monk')('sunnykarira:Grocklmfao123@ds019491.mlab.com:19491/ideation');
// require passport and local startegy
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;

//Routes
var routes = require('./routes/index');
var users = require('./routes/users');
var posts = require('./routes/posts');
var categories = require('./routes/categories');
var admin = require('./routes/admin');


var app = express();

//Moment
app.locals.moment = require('moment');

//Global function so that some text is shown in front end
app.locals.truncateText = function(text, length){
  var truncatedText = text.substring(0, length);
  return truncatedText;
}


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


//Middlwares custom
// handle file uploads
app.use(multer({dest:'./public/images/uploads'}));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


//Middlwares custom
//Handle express sessions
app.use(session({
  secret:'secret',
  saveUninitialize: true,
  resave: true
}));

// Passport session is  after express session
app.use(passport.initialize());
app.use(passport.session());

// Validator
app.use(expressValidator({

  errorFormattor: function(param, msg, value){
    var namespace = param.split('.'),
    root = namespace.shift(),
    formParam = root;

    while(namespace.length){
      formParam+= '[' + namespace.shift() + ']';
    }

    return{
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

//

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// connect flash
app.use(flash());
app.use(function (req, res, next){
  res.locals.messages = require('express-messages')(req, res);
  next();
});
//

//Make db accesible to our router
app.use(function(req, res, next){
  req.db = db;
  //console.log(req.db);
  next();
});

//

//User available at all pages
app.get('/*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});
//

app.use('/', routes);
app.use('/users', users);
app.use('/posts', posts);
app.use('/categories', categories);
app.use('/admin', admin);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
