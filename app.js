var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var fileUpload = require('express-fileupload');
var firebase = require("firebase/app");
require("firebase/auth");
require("firebase/database");
firebase.initializeApp({
	apiKey:"AIzaSyD6DjSPaFBtxZhH3brbGtpgVALgvmJGWdc",
	serviceAccount:"./vanbr-adefd43eead0.json",
	databaseURL: "https://vanbr-c65fe.firebaseio.com",
	storageBucket: 'gs://vanbr-c65fe.appspot.com'
});

var app = express();

var ejs = require('ejs');
var index = require('./routes/index');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true  }));
app.use(cookieParser());
//app.use(session({secret: 'ssshhhhh'}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:'max', saveUninitialized: true, resave:true }));
app.use(fileUpload({limits: { fileSize: 50 * 1024 * 1024 },}));
app.use('/', index);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

