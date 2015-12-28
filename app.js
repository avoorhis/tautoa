
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

TAUTOA_DATABASE = 'test_portfolio'
connection = require('./config/database');
connection.connect2database(TAUTOA_DATABASE)

var routes    = require('./routes/index');



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

ALL_SECURITIES_BY_ID ={};
ALL_SECURITIES_BY_NAME = {};
SELECTED_SECURITY = {id:0,name:''}
portfolio_total = 0
// connection.db.query(queries.get_all_securities(), function(err, rows, fields){
// 	if(err){ console.log(err)
// 	}else{
// 		for (r in rows){
// 			ALL_SECURITIES_BY_ID[rows[r].id] = rows[r];
// 			ALL_SECURITIES_BY_NAME[rows[r].name] = rows[r];
// 			portfolio_total += parseFloat(rows[r].cur_value);
// 			if(r==0){
// 				SELECTED_SECURITY = rows[r];
// 			}
// 		}
// 	}
// });
// connection.db.query(queries.get_total(), function(err, rows, fields){
// 	if(err){ console.log(err)
// 	}else{
// 		portfolio_total = rows[0].total;
// 		console.log(portfolio_total)
// 	}
// });
// connection.get_sectors()
// connection.get_types()
// connection.get_goals()
// connection.get_accounts()
// connection.get_actions()
// connection.get_groups()
async.parallel([ connection.get_sectors, 
                    connection.get_types, 
                    connection.get_goals, 
                    connection.get_actions, 
                    connection.get_accounts, 
                    connection.get_groups ]
                  );
// FILTERS
// connection.db.query(queries.get_sectors(), function(err, rows, fields){
// 	if(err){ console.log(err)
// 	}else{
// 		sectorList = [];
// 		for(n in rows){
// 			sectorList.push(rows[n].sector);
// 		}
// 	}
// });
// connection.db.query(queries.get_types(), function(err, rows, fields){
// 	if(err){ console.log(err)
// 	}else{
// 		typeList = [];
// 		for(n in rows){
// 			typeList.push(rows[n].type);
// 		}
// 	}
// });
// connection.db.query(queries.get_goals(), function(err, rows, fields){
// 	if(err){ console.log(err)
// 	}else{
// 		goalList = [];
// 		for(n in rows){
// 			goalList.push(rows[n].goal);
// 		}
// 	}
// });
// connection.db.query(queries.get_accounts(), function(err, rows, fields){
// 	if(err){ console.log(err)
// 	}else{
// 		accountList = [];
// 		for(n in rows){
// 			accountList.push(rows[n].account);
// 		}
// 	}
// });
// //
// connection.db.query(queries.get_actions(), function(err, rows, fields){
// 	if(err){ console.log(err)
// 	}else{
// 		actionList = [];
// 		for(n in rows){
// 			actionList.push(rows[n].action);
// 		}
// 	}
// });
// connection.db.query(queries.get_groups(), function(err, rows, fields){
// 	if(err){ console.log(err)
// 	}else{
// 		groupList = [];
// 		for(n in rows){
// 			items = rows[n].group_code.split(',')
// 			for(i in items){
// 				if(items[i] != '' && groupList.indexOf(items[i]) == -1){
// 					groupList.push(items[i]);
// 				}
// 			}		
// 		}
// 		groupList.sort();
// 	}
// });
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
  var server = http.createServer(app);
  cluster(server).listen(process.env.PORT);
}

