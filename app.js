
var express = require('express');
var app  = express();
//var router = express.Router();
var session = require('express-session');
var queries = require('./routes/queries');
var async = require('async');
var path = require('path');
global.app_root = path.resolve(__dirname);
var http = require('http');
var flash = require('express-flash');
///var favicon = require('serve-favicon');
//var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var constants = require('./public/constants');
//var config = require('./config/config');
// Put Globals here
PORTFOLIO_TOTAL = 0;
ALL_SECURITIES_BY_ID ={};
ALL_SECURITIES_BY_NAME = {};
SELECTED_SECURITY = {id:0,name:''}
TAUTOA_DATABASE = 'andys_portfolio'
ACTIVE = '1'  // default '1'  else '0'
SHOW_INFO  = 'val' // default 'value' else 'stg' sector,type,goal
connection = require('./config/database');
connection.connect2database(TAUTOA_DATABASE)

var routes    = require('./routes/routes_index');



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


app.use(express.static(path.join(__dirname, '/')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
	secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
})); //
app.use(flash());

app.use(function(req, res, next){
	if (connection == null) {
	   console.log('We cannot reach the database right now, please try again later.');
	   return;
	 }else{
	    req.db = connection.db;
	    req.C = constants;
      //req.config = config;
	    return next();
	}
});

// ROUTES:
app.use('/', routes);





async.parallel([ connection.get_sectors,
                    connection.get_types,
                    connection.get_goals,
                    connection.get_actions,
                    connection.get_accounts,
                    connection.get_groups ]
                  );



connection.db.query(queries.get_databases(), function(err, rows, fields){
	if(err){ console.log(err)
	}else{
		databaseList = [];
		for (var i = 0; i < rows.length; i++) {
       //console.log(rows[i]['Database (%_portfolio)'])
       databaseList.push(rows[i]['Database (%_portfolio)'])
		}

		//console.log(databaseList)
	}
});

app.all('save_securitiy', function (req, res) {
	console.log('in save1')
	var kind  = req.params.kind;
	console.log(kind)

});

module.exports = app;
if (!module.parent) {
  console.log('starting server: '+process.env.PORT)
  var server = http.createServer(app);
  //cluster(server).listen(process.env.PORT);
}
