var mysql      = require('mysql2');
var queries = require('../routes/queries');
var async = require('async');
var config = require('../config/config');


exports.connect2database = function(dbase) {
//(function(){
  console.log('Trying to Connect... '+dbase);
   var handleDisconnect, mysql, this$ = this;
   var mysql = require('mysql2');
   //var fs = require('fs-extra');
   //var config_file = 'config/db-connection.js'
   //eval(fs.readFileSync(config_file).toString());
   exports.db = null;
   handleDisconnect = function(){
     
    exports.db = mysql.createConnection({
          host     : config.DBHOST,
          user     : config.DBUSER,
          password : config.DBPASS,
          database : dbase
    });
     exports.db.connect(function(err){
	   if (err != null) {
          console.log('Error connecting to mysql:', err);
          exports.db = null;
          return setTimeout(handleDisconnect, 2000);
       }else{
       	  console.log('DATABASE: '+dbase)
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

}
//
//
//

//exports.get_all_items = function(){

  exports.get_sectors = function(callback){
    console.log('Loading Sectors')
    connection.db.query(queries.get_sectors(ACTIVE), function(err, rows, fields){
      if(err){ console.log(err)
      }else{
        sectorList = [];
        for(n in rows){
          sectorList.push(rows[n].sector);
        }
        callback(null, sectorList);
      }
    });
  }

  exports.get_types = function(callback){
    console.log('Loading Types')
    connection.db.query(queries.get_types(ACTIVE), function(err, rows, fields){
      if(err){ console.log(err)
      }else{
        typeList = [];
        for(n in rows){
          typeList.push(rows[n].type);
        }
        callback(null, typeList);
      }
    });
  }

  exports.get_goals = function(callback) {
    console.log('Loading Goals')
    connection.db.query(queries.get_goals(ACTIVE), function(err, rows, fields){
      if(err){ console.log(err)
      }else{
        goalList = [];
        for(n in rows){
          goalList.push(rows[n].goal);
        }
        callback(null, goalList);
      }
    });
  }

  exports.get_accounts = function(callback) {
    console.log('Loading Accounts')
    connection.db.query(queries.get_accounts(ACTIVE), function(err, rows, fields){
      if(err){ console.log(err)
      }else{
        accountList = [];
        for(n in rows){
          accountList.push(rows[n].account);
        }
        callback(null, accountList);
      }
    });
    //
  }
  exports.get_acct_types = function(callback) {
    console.log('Loading AccountTypes')
    connection.db.query(queries.get_account_types(ACTIVE), function(err, rows, fields){
      if(err){ console.log(err)
      }else{
        accountTypeList = [];
        for(n in rows){
          accountTypeList.push(rows[n].acct_type);
        }
        callback(null, accountTypeList);
      }
    });
    //
  }
  exports.get_actions = function(callback) {
    console.log('Loading Actions')
    connection.db.query(queries.get_actions(), function(err, rows, fields){
      if(err){ console.log(err)
      }else{
        actionList = [];
        for(n in rows){
          actionList.push(rows[n].action);
        }
        if(actionList.indexOf('Buy') == -1){
            actionList.push('Buy')
        }
        if(actionList.indexOf('Sell') == -1){
            actionList.push('Sell')
        }
        if(actionList.indexOf('Price Update') == -1){
            actionList.push('Price Update')
        }
        callback(null, actionList);
      }
    });
  }
  exports.get_groups = function(callback) {
    console.log('Loading Groups')
    connection.db.query(queries.get_groups(ACTIVE), function(err, rows, fields){
      if(err){ console.log(err)
      }else{
        groupList = [];
        for(n in rows){
          items = rows[n].group_code.split(',')
          for(i in items){
            if(items[i] != '' && groupList.indexOf(items[i]) == -1){
              groupList.push(items[i]);
            }
          }
        }
        groupList.sort();
      }
      callback(null, groupList);
    });
  }
  exports.get_alerts = function(callback) {
    console.log('Loading Alerts')
    connection.db.query(queries.get_alerts(ACTIVE), function(err, rows, fields){
      if(err){ console.log(err)
      }else{
        alertList = [];
        for(n in rows){
          alertList.push(rows[n].alert);
        }
        callback(null, alertList);
      }
    });
  }
  // function final(results) { console.log('Done', results); }
  // var items = [ get_sectors, get_types, get_goals, get_actions, get_accounts, get_groups ];
  // var results = 0;





//}
