var express = require('express');
var router = express.Router();
var C = require('../public/constants');

module.exports = {
	
	get_all_securities: function(active){
	    var q = "SELECT id, ticker, name, cur_value, cur_shares, cur_price, sector,type,goal,account,acct_type,notes,yield,alert,dividend,dividend_freq"
	    q += " from securities WHERE active = '"+active+"'  ORDER BY name";
	    return q;
	},
	get_select_securities: function(list_type, list_value, active){
			var q = "SELECT id, ticker, name, cur_value, cur_shares, cur_price, sector,type,goal,account,acct_type,notes,yield,alert,dividend,dividend_freq"
	    q += " from securities WHERE active = '"+active+"'"
	    q += " and "+list_type+"='"+list_value+"'"
	    q += " ORDER BY name";
	    return q;
	},
	get_group_securities: function(list_type, list_value, active){
			var q = "SELECT id, ticker, name, cur_value, cur_shares, cur_price, sector,type,goal,account,acct_type,notes,yield,alert,dividend,dividend_freq"
	    q += " from securities WHERE active = '"+active+"'"
	    q += " and group_code like '%"+list_value+"%'"
	    q += " ORDER BY name";
	    return q;
	},
	
	get_security: function(secid){
	    var q = "SELECT id, ticker, name, cur_value, cur_shares, cur_price, active,"
	    q += " init_value, init_shares, init_price, DATE_FORMAT(init_date,'%Y-%m-%d') as init_date,"
	    q += "type,goal,sector,account,acct_type,notes,group_code,alert"
	    q += " from securities WHERE id='"+secid+"' ";
	    if(C.verbose){
	    	console.log(q)
	    }
	    return q;
	},
	update_security: function(secid,field_hash){
	    var q = "UPDATE securities set ";
	    for(n in field_hash){
	    	q += n+"='"+field_hash[n]+"',"
	    }
	    q = q.slice(0,-1)
	    q += " WHERE id='"+secid+"' ";
	    if(C.verbose){
	    	console.log(q)
	    }
	    return q;
	},
	insert_security: function(field_hash){
	    var q = "INSERT into securities ("
	    for(n in field_hash){
	    	q += n+","
	    }
	    q = q.slice(0,-1)
	    q += ") VALUES ("
	    for(n in field_hash){
	    	q += "'"+field_hash[n]+"',"
	    }
	    q = q.slice(0,-1)
	    q += ")"
	    if(C.verbose){
	    	console.log(q)
	    }
	    return q;
	},
	insert_transactions: function(t){
			q =  "INSERT ignore into transactions (transtype,securityid,date,nav,shares,note)";
	    q += " VALUES" //('"+trans+"','"+secid+"','"+date+"','"+nav+"','"+shares+"','"+note+"')"
	    for(i in t){
	    	q += "('"+t[i].action+"','"+t[i].secid+"','"+t[i].sqldate+"','"+t[i].price+"','"+t[i].shares+"','"+t[i].note+"'),"
	    }
	    q = q.slice(0,-1);
	    if(C.verbose){
	    	console.log(q)
	    }
	    return q;
	},
	update_transaction: function(t){
			q =  "UPDATE transactions set";
			q += " transtype='"+t.action+"',";
			q += " date='"+t.sqldate+"',";
			q += " nav='"+t.price+"',";
			q += " shares='"+t.shares+"',";
			q += " note='"+t.note+"'";
	    q += " WHERE id='"+t.tid+"'"
	    if(C.verbose){
	    	console.log(q)
	    }
	    return q;
	},
	get_transactions: function(secid){
	    var q = "SELECT id, DATE_FORMAT(date,'%Y-%m-%d') as date, transtype, nav, shares, note from transactions WHERE securityid='"+secid+"' ORDER BY date";
	    if(C.verbose){
	    	console.log(q)
	    }
	    return q;
	},
	get_all_transactions: function(active){
	    var q = "SELECT DISTINCT t.id, securityid, DATE_FORMAT(date,'%Y-%m-%d') as date, transtype, nav, shares, note from transactions as t";
	    q += " JOIN securities as s";
	    q += " WHERE s.active = '"+active+"'";
	    if(C.verbose){
	    	console.log(q)
	    }
	    return q;
	},
	delete_transaction: function(secid,transid){
	    var q = "DELETE from transactions WHERE id='"+transid+"' and securityid='"+secid+"'";
	    if(C.verbose){
	    	console.log(q)
	    }
	    return q;
	},
	delete_security: function(secid){
	    var q = "DELETE from securities WHERE id='"+secid+"'";
	    if(C.verbose){
	    	console.log(q)
	    }
	    return q;
	},
	delete_security_transactions: function(secid){
	    var q = "DELETE from transactions WHERE securityid='"+secid+"'";
	    if(C.verbose){
	    	console.log(q)
	    }
	    return q;
	},

	get_max_transaction: function(secid){
	    var q = "SELECT id, transtype, nav, date from transactions as a";
	    q += " WHERE date=("
	    q += " SELECT MAX(date) from transactions"
	    q += " WHERE securityid='"+secid+"' and transtype != 'note')"
		q += " AND securityid='"+secid+"' limit 1"
	    if(C.verbose){
	    	console.log(q)
	    }
	    return q;
	},
    // get_all_max_transactions: function(){
// 	    var q = "SELECT t.id, transtype, nav, max(date) from transactions as t";
// 	    q += " JOIN securities as s on(s.id = t.securityid)"
//         q += " WHERE  transtype != 'note' and s.active='1'"
//         q += " GROUP BY securityid"
// 	    console.log(q)
// 	    return q;
// 	},
	
	get_all_max_transactions: function(){
 	    var q = "SELECT t1.id, t1.securityid, t1.transtype, t1.nav, t1.date"
        q += " FROM transactions AS t1"
        q += " LEFT OUTER JOIN transactions AS t2"
        q += " ON t1.securityid = t2.securityid" 
        q += " AND (t1.date < t2.date"
        q += " OR (t1.date = t2.date AND t1.Id < t2.Id))"
        q += " WHERE t2.securityid IS NULL"
        if(C.verbose){
	    	console.log(q)
	    }
	    return q;
	},
	delete_price_updates2: function(translist){
	    sql_list = translist.join("','")
		var q = "delete from transactions where transtype='Price Update'" 
		    q += " and id not in ('"+sql_list+"')";
		
		if(C.verbose){
	    	console.log(q)
	    }
	    return q;

	},
	delete_price_updates: function(lst){
		var q = "delete from transactions where transtype='Price Update' ";
		q += " and securityid='"+lst[0]+"'";
		q += " and id != '"+lst[1]+"'";
		if(C.verbose){
	    	console.log(q)
	    }
	    return q;

	},
	get_sum_shares: function(secid){
		var q = "SELECT SUM(shares) as tot_shares, securityid from transactions WHERE securityid='"+secid+"' ";
	    if(C.verbose){
	    	console.log(q)
	    }
	    return q;
	},



	get_total: function(){
	    var q = "SELECT SUM(cur_value) as total from securities WHERE active='1' ";
	    return q;
	},

	get_sectors: function(active){
	    //var q = "SELECT distinct sector from securities WHERE sector != '' AND active= '"+active+"' ORDER BY sector ";
	    var q = "SELECT distinct sector from sectorList WHERE sector != '' ORDER BY sector ";
	    return q;
	},

	get_types: function(active){
	    //var q = "SELECT distinct type from securities WHERE type != '' AND active= '"+active+"' ORDER BY type ";
	    var q = "SELECT distinct type from typeList WHERE type != '' ORDER BY type ";
	    return q;
	},

	get_goals: function(active){
	    //var q = "SELECT distinct goal from securities WHERE goal != '' AND active= '"+active+"' ORDER BY goal ";
	    var q = "SELECT distinct goal from goalList WHERE goal != '' ORDER BY goal ";
	    return q;
	},

	get_accounts: function(active){
	    var q = "SELECT distinct account from securities where account != '' AND active= '"+active+"' ORDER BY account";
	    return q;
	},
	get_account_types: function(active){
	    var q = "SELECT distinct acct_type from securities where account != '' AND active= '"+active+"' ORDER BY acct_type";
	    return q;
	},
	get_actions: function(){
	    var q = "SELECT action from actionList";
	    return q;
	},
	get_groups: function(active){
	    var q = "SELECT group_code from securities where group_code != '' AND active= '"+active+"' ";
	    return q;
	},
	get_alerts: function(active){
	    var q = "SELECT distinct alert from securities where alert != '' AND active= '"+active+"' ORDER BY alert";
	    return q;
	},
	get_all_group_info: function(active){
		var q = "SELECT SUM(cur_value) as value from securities WHERE active= '"+active+"' ";
	    return q;
	},
	get_databases: function(){
		var q = "SHOW databases like '%_portfolio'  ";
	  return q;
	},
	/////
	get_dividend_stocks: function(){
		var q = "SELECT id, ticker, name, cur_value, cur_shares, cur_price, sector,type,goal,account,acct_type,notes,yield,alert from securities";
		q += " WHERE dividend='1' and active='1'";
		return q;
	}
	
}
