
// anna's
// try{
//   require('nodetime').profile({
//     accountKey: '13bf15a356e62b822df4395f183fe0a83af757f4', 
//     appName: 'Node.js VAMPS Application'
//   });
// }
// catch(err){
//   console.log(err.toString())
// }

var express = require('express');
//var expose = require('express-expose');
var router = express.Router();
var session = require('express-session');
var path = require('path');
global.app_root = path.resolve(__dirname);
//var hdf5 = require('hdf5');
//var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var connection = require('./config/database');
var queries = require('./routes/queries');
//var flash = require('express-flash');
//var passport = require('passport');
//var favicon = require('serve-favicon');
//var fs = require('fs-extra');
//var zlib = require('zlib');
//var multer = require('multer');
//var db = require('mysql2');
// without var declaration connection is global
// needed for DATASETS initialization
//connection = require('./config/database').pool;



var routes    = require('./routes/index');  // This grabs ALL_DATASETS from routes/load_all_datasets.js



var constants = require('./public/constants');
//var config = require('./config/config');
var app = express();
app.set('appName', 'TauToa');
//require('./config/passport')(passport, connection); // pass passport for configuration

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.set(express.static(__dirname + '/tmp'));
// MIDDLEWARE  <-- must be in correct order:
//app.use(favicon( path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
//app.use(bodyParser({limit: 1024000000 })); // 1024MB
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

//var upload = multer({ dest: path.join('user_data', NODE_DATABASE, 'tmp')});
//upload.single('singleInputFileName')
//app.use(upload.single('singleInputFileName'));  // for multipart uploads: files
//app.use(multer({ dest: path.join('user_data', NODE_DATABASE, 'tmp')})); // for multipart uploads: files
app.use(cookieParser());

//app.use(compression());
/**
 * maxAge used to cache the content, # msec
 * to "uncache" some pages: http://stackoverflow.com/questions/17407770/express-setting-different-maxage-for-certain-files
 */
app.use(express.static( 'public', {maxAge: '24h' }));
app.use(express.static('tmp'));
// app.use(express.static(__dirname + '/public', {maxAge: 900000 }));
// app.use(express.static(path.join(__dirname, '/public')));

app.use('public/javascripts', express.static(path.join(__dirname, 'public', 'javascripts')));
app.use('public/stylesheets', express.static(path.join(__dirname, 'public', 'stylesheets')));

// app.use('views/add_ins', express.static(path.join(__dirname, '/views/add_ins')));
// required for passport
// app.use(session({ secret: 'keyboard cat',  cookie: {maxAge: 900000}})); // session secret
app.use(session({ 
	secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
})); // session secret

//app.use(passport.initialize());
//app.use(passport.session()); // persistent login sessions
//app.use(flash()); // use connect-flash for flash messages stored in session


app.use(function(req, res, next){
	if (connection == null) {
	   this.send('We cannot reach the database right now, please try again later.');
	   return;
	 }else{
	    req.db = connection;
	    req.C = constants;
        //req.config = config;
	    return next();
	}
});


// ROUTES:
app.use('/', routes);


// for non-routing pages such as heatmap, counts and bar_charts
app.get('/*', function(req, res, next){
    console.warn(req.params);
    console.warn(req.uri);
    var url = req.params[0];
    // I want to create a page like: counts_table_2014080_13452.html
    // for each link
    if (url === 'visuals/user_viz_data/ctable.html') { // 
        // Yay this is the File A... 
        console.warn("The user file  has been requested");
        router.get('/visuals/user_viz_data/ctable.html',  function(req, res) {
            console.warn('trying to open ctable.html');
        });
    } else {
        // we don't care about any other file, let it download too        
        console.warn("No Route Found");
        next();
    }
});

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers <-- these middleware go after routes

// development error handler
// will print stacktrace

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error.ejs', {
        message: err.message,
        error: {}
    });
});






connection.db.query(queries.get_total(), function(err, rows, fields){
	if(err){ console.log(err)
	}else{
		portfolio_total = rows[0].total;
		console.log(portfolio_total)
	}
});
// FILTERS
connection.db.query(queries.get_sectors(), function(err, rows, fields){
	if(err){ console.log(err)
	}else{
		sectorList = [];
		for(n in rows){
			sectorList.push(rows[n].sector);
		}
		//console.log(sectorList)
	}
});
connection.db.query(queries.get_types(), function(err, rows, fields){
	if(err){ console.log(err)
	}else{
		typeList = [];
		for(n in rows){
			typeList.push(rows[n].type);
		}
		//console.log(typeList)
	}
});
connection.db.query(queries.get_goals(), function(err, rows, fields){
	if(err){ console.log(err)
	}else{
		goalList = [];
		for(n in rows){
			goalList.push(rows[n].goal);
		}
		//console.log(goalList)
	}
});
connection.db.query(queries.get_accounts(), function(err, rows, fields){
	if(err){ console.log(err)
	}else{
		accountList = [];
		for(n in rows){
			accountList.push(rows[n].account);
		}
		//console.log(accountList)
	}
});
connection.db.query(queries.get_groups(), function(err, rows, fields){
	if(err){ console.log(err)
	}else{
		groupList = [];
		for(n in rows){
			items = rows[n].group_code.split(',')
			for(i in items){
				if(items[i] != '' && groupList.indexOf(items[i]) == -1){
					groupList.push(items[i])

				}
			}		
		}
		groupList.sort()
		//console.log(groupList)
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

