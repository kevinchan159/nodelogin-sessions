var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var expressValidator =require('express-validator');
var sessions = require('client-sessions');
var handleBars = require('express-handlebars');
var flash = require('connect-flash');
var path = require('path');
var port = process.env.PORT || 3000;

var app = express();
var routes = require('./api/routes/routes');

mongoose.connect('mongodb://localhost/loginsessionapp');
User = require('./api/models/user');

//Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

// set static folder (where we'll put stylesheets, images, jquery, etc)
// put this part BEFORE view engine setup
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', handleBars({ defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');

// routes
routes(app)

app.listen(port, function() {
	console.log('Running on port: ' + port);
});
