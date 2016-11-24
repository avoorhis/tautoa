var express = require('express');
var router = express.Router();
var C = require('../public/constants');

module.exports = {

	get_all_securities: function(hide_code){
	    var q = "SELECT id, ticker, name, cur_value, cur_shares, cur_price, sector,type,goal,account,notes,yield"
	    q += " from securities WHERE hide = '"+hide_code+"'  and type != 'Cash' ORDER BY name";
	    return q;
	},
	get_select_securities: function(list_type, list_value, hide_code){
			var q = "SELECT id, ticker, name, cur_value, cur_shares, cur_price, sector,type,goal,account,notes,yield"
	    q += " from securities WHERE hide = '"+hide_code+"'  and type != 'Cash'"
	    q += " and "+list_type+"='"+list_value+"'"
	    q += " ORDER BY name";
	    return q;
	},
	get_group_securities: function(list_type, list_value, hide_code){
			var q = "SELECT id, ticker, name, cur_value, cur_shares, cur_price, sector,type,goal,account,notes,yield"
	    q += " from securities WHERE hide = '"+hide_code+"'  and type != 'Cash'"
	    q += " and group_code like '%"+list_value+"%'"
	    q += " ORDER BY name";
	    return q;
	},
	// get_hidden_securities: function(list_type, list_value){
	// 		var q = "SELECT id, ticker, name, cur_value, cur_shares, cur_price"
	//     q += " from securities WHERE hide = 'yes' "
	//     q += " ORDER BY name";
	//     return q;
	// },
	get_security: function(secid){
	    var q = "SELECT id, ticker, name, cur_value, cur_shares, cur_price, hide,"
	    q += " init_value, init_shares, init_price, DATE_FORMAT(init_date,'%Y-%m-%d') as init_date,"
	    q += "type,goal,sector,account,notes,group_code"
	    q += " from securities WHERE id='"+secid+"' ";
	    console.log(q)
	    return q;
	},
	update_security: function(secid,field_hash){
	    var q = "UPDATE securities set ";
	    for(n in field_hash){
	    	q += n+"='"+field_hash[n]+"',"
	    }
	    q = q.slice(0,-1)
	    q += " WHERE id='"+secid+"' ";
	    console.log(q)
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
	    console.log(q)
	    return q;
	},
	insert_transactions: function(t){
			q =  "INSERT ignore into transactions (transtype,securityid,date,nav,shares,note)";
	    q += " VALUES" //('"+trans+"','"+secid+"','"+date+"','"+nav+"','"+shares+"','"+note+"')"
	    for(i in t){
	    	q += "('"+t[i].action+"','"+t[i].secid+"','"+t[i].sqldate+"','"+t[i].price+"','"+t[i].shares+"','"+t[i].note+"'),"
	    }
	    q = q.slice(0,-1);
	    console.log(q);
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
	    console.log(q);
	    return q;
	},
	get_transactions: function(secid){
	    var q = "SELECT id, DATE_FORMAT(date,'%Y-%m-%d') as date, transtype, nav, shares, note from transactions WHERE securityid='"+secid+"' ORDER BY date";
	    console.log(q)
	    return q;
	},
	get_all_transactions: function(hide_code){
	    var q = "SELECT DISTINCT t.id, securityid, DATE_FORMAT(date,'%Y-%m-%d') as date, transtype, nav, shares, note from transactions as t";
	    q += " JOIN securities as s";
	    q += " WHERE s.hide = '"+hide_code+"'  and s.type != 'Cash'";
	    console.log(q)
	    return q;
	},
	delete_transaction: function(secid,transid){
	    var q = "DELETE from transactions WHERE id='"+transid+"' and securityid='"+secid+"'";
	    console.log(q)
	    return q;
	},
	delete_security: function(secid){
	    var q = "DELETE from securities WHERE id='"+secid+"'";
	    console.log(q)
	    return q;
	},
	delete_security_transactions: function(secid){
	    var q = "DELETE from transactions WHERE securityid='"+secid+"'";
	    console.log(q)
	    return q;
	},

	get_max_transaction: function(secid){
	    var q = "SELECT id, transtype, nav, date from transactions as a";
	    q += " WHERE date=("
	    q += " SELECT MAX(date) from transactions"
	    q += " WHERE securityid='"+secid+"' and transtype != 'note')"
			q += " AND securityid='"+secid+"' limit 1"
	    console.log(q)
	    return q;
	},

	delete_price_updates: function(secid, saveid){
		var q = "delete from transactions where transtype='Price Update' ";
		q += " and securityid='"+secid+"'";
		q += " and id != '"+saveid+"'";
		console.log(q)
	  return q;

	},
	get_sum_shares: function(secid){
			var q = "SELECT SUM(shares) as tot_shares, securityid from transactions WHERE securityid='"+secid+"' ";
	    console.log(q)
	    return q;
	},



	get_total: function(){
	    var q = "SELECT SUM(cur_value) as total from securities WHERE hide = 'no'  and type != 'Cash' ";
	    return q;
	},

	get_sectors: function(hide_code){
	    var q = "SELECT distinct sector from securities WHERE sector != '' AND hide = '"+hide_code+"' ORDER BY sector ";
	    return q;
	},

	get_types: function(hide_code){
	    var q = "SELECT distinct type from securities WHERE type != '' AND hide = '"+hide_code+"' ORDER BY type ";
	    return q;
	},

	get_goals: function(hide_code){
	    var q = "SELECT distinct goal from securities WHERE goal != '' AND hide = '"+hide_code+"' ORDER BY goal ";
	    return q;
	},

	get_accounts: function(hide_code){
	    var q = "SELECT distinct account from securities where account != '' AND hide = '"+hide_code+"' ORDER BY account";
	    return q;
	},
	get_actions: function(){
	    var q = "SELECT action from actionList";
	    return q;
	},
	get_groups: function(hide_code){
	    var q = "SELECT group_code from securities where group_code != '' AND hide = '"+hide_code+"' ";
	    return q;
	},
	get_all_group_info: function(hide_code){
		var q = "SELECT SUM(cur_value) as value from securities WHERE hide = '"+hide_code+"'  and type != 'Cash' ";
	    return q;
	},
	get_databases: function(){
		var q = "SHOW databases like '%_portfolio'  ";
	  return q;
	}
}
