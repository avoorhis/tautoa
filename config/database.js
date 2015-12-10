var mysql      = require('mysql2');

TAUTOA_DATABASE = 'test_portfolio'

db_config = {
  host     : 'localhost',
  user     : 'root',
  password : '1cc=1ml',
  database : TAUTOA_DATABASE
};

//connection.connect();

//exports.connection = connection;
// connection.query('SELECT * from securities', function(err, rows, fields) {
//   if (!err)
//     console.log('The solution is: ', rows);
//   else
//     console.log('Error while performing Query.');
// });

// connection.end();

(function(){
   var handleDisconnect,mysql, this$ = this;
   var mysql = require('mysql2');
   //var fs = require('fs-extra');
   //var config_file = 'config/db-connection.js'
   //eval(fs.readFileSync(config_file).toString());
   exports.db = null;
   handleDisconnect = function(){
     console.log('Trying to Connect...');
	 		exports.db = mysql.createConnection({
				  host     : 'localhost',
				  user     : 'root',
				  password : '1cc=1ml',
				  database : TAUTOA_DATABASE
				});
     exports.db.connect(function(err){
	   if (err != null) {
         console.log('Error connecting to mysql:', err);
         exports.db = null;
         return setTimeout(handleDisconnect, 2000);
       }else{
       	console.log('DATABASE: '+TAUTOA_DATABASE)
        console.log('Connected!');
       }
     });
     return exports.db.on('error', function(err){
       console.log('Database error:', err);
       if (err.code === 'PROTOCOL_CONNECTION_LOST') {
         exports.db = null;
		 console.log('Found error PROTOCOL_CONNECTION_LOST -- restarting');
         return handleDisconnect();
       } else {
         return process.exit(1);
       }
     });
   };
   handleDisconnect();

}).call(this);