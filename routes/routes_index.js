var express = require('express');
var router = express.Router();
var http = require('http')
var url = require('url');
var async = require('async');
var fs = require('fs-extra')
var path = require('path')
var dateFormat = require('dateformat');
var moment_date = require('moment');
var today = moment_date().format('YYYY-MM-DD')

var queries = require('./queries');
var config = require('../config/config');
var C  = require('../public/constants');

router.get('/', function (req, res) {
  console.log('in index/home')
  //console.log(SELECTED_SECURITY)
  var ssid = SELECTED_SECURITY.id || 0;
  if(ssid == 0){
  	SELECTED_SECURITY.transactions = []
  }
  //console.log('SHOW_INFO');
  //console.log(SHOW_INFO);
  
  res.render('index', {
      title : config.APP_NAME.capitalizeFirstLetter()+': Home Page',

      //securities : JSON.stringify(ALL_SECURITIES_BY_ID),
      selected_securityID: ssid,
      databases	: databaseList,
      database 	: CURRENT_DATABASE,
      app_name  : config.APP_NAME.capitalizeFirstLetter(),
      types 	: typeList,
      goals 	: goalList,
      sectors 	: sectorList,
      accounts 	: accountList,
      acct_type : accountTypeList,
      actions 	: actionList,
      groups 	: groupList,
      alerts 	: alertList,
      active 	: ACTIVE,
      secview   : SHOW_INFO

    });

});
//
//
//
//
//
//
router.get('/security_form/:kind/:id', function (req, res) {
	var kind  = req.params.kind
	var secid = req.params.id
	console.log('showing security form')

	if(kind == 'edit'){
			req.db.query(queries.get_security(secid), function(err, rows, fields){
					    if (err)  {
				 		  	console.log('1-GET SECs error: ' + err);
				      } else {

									//rows[0].init_date = new Date(rows[0].init_date)
									//console.log('rows::')
									if(C.verbose){
										console.log(rows[0])
									}
									res.render('security', {
									      title : config.APP_NAME.capitalizeFirstLetter()+': Edit Security',
									      data : JSON.stringify(rows[0]),
									      kind : 'edit',
									      total : PORTFOLIO_TOTAL,
									      types : typeList,
									      goals : goalList,
									      sectors : sectorList,
									      accounts : accountList,
									      acct_types : accountTypeList,
									      groups : groupList,
									      alerts : alertList,
									      secid : secid

									    });
								}
				});
		}else{

			res.render('security', {
			      title : config.APP_NAME.capitalizeFirstLetter()+': New Security',
			      data : JSON.stringify({}),
			      kind : 'new',
			      total : PORTFOLIO_TOTAL,
			      types : typeList,
			      goals : goalList,
			      sectors : sectorList,
			      accounts : accountList,
			      acct_types : accountTypeList,
			      groups : groupList,
			      alerts : alertList,
			      secid:0
			      //hostname: req.C.hostname,
			      //message: req.flash('message'),

			    });

		}
});
//
//   SAVE SECURITY
//
router.post('/save_security/:kind', function (req, res) {
	console.log('in save2')
	console.log(req.body)
	var kind  = req.params.kind;
	var new_group_code = []
	req.body.ticker = req.body.ticker.toUpperCase();
	// ADD new items to running server:
  if(sectorList.indexOf(req.body.sector) == -1){
  	sectorList.push(req.body.sector)
  }
  if(goalList.indexOf(req.body.goal) == -1){
  	goalList.push(req.body.goal)
  }
  if(typeList.indexOf(req.body.type) == -1){
  	typeList.push(req.body.type)
  }
  if(accountList.indexOf(req.body.account) == -1){
  	accountList.push(req.body.account)
  }
  if(accountTypeList.indexOf(req.body.acct_type) == -1){
  	accountTypeList.push(req.body.acct_type)
  }
  if(alertList.indexOf(req.body.alert) == -1){
  	alertList.push(req.body.alert)
  }
	// add to groupList (if new)
	group_string_list = req.body.group_code.split(',');
	for(i in  group_string_list){
		if(group_string_list[i]){
			//new_group_code.push(group_string_list[i])
			if(groupList.indexOf(group_string_list[i]) == -1){
				//console.log('pushing '+group_string_list[i])
				groupList.push(group_string_list[i]);
			}
		}
	}

	//req.body.group_code = new_group_code.join()

	
	params =['name','ticker','account','acct_type','active','type','goal','sector','group_code','notes','alert'];
	fields = {}

	if(kind == 'new'){
		// ucase first on 'new' only:
		req.body.name = req.body.name.charAt(0).toUpperCase() + req.body.name.slice(1);
		extras1 = ['cur_date', 'cur_price', 'cur_shares', 'cur_value'];
		extras2 = ['init_date','init_price','init_shares','init_value'];
		params = params.concat( extras1 );
		params = params.concat( extras2 );
		init_price = req.body.init_price || 0
		init_shares = req.body.init_shares || 0


		if( req.body.init_price && req.body.init_shares ){
			req.body.init_value = req.body.init_price * req.body.init_shares;
		}else if(req.body.init_value && req.body.init_shares ){
			req.body.init_price = req.body.init_value / req.body.init_shares;
		}else if(req.body.init_value && req.body.init_price ){
			req.body.init_shares = req.body.init_value / req.body.init_price;
		}else{
			// ERROR
			console.log('ERROR in price,shares,value')
			req.flash('fail', 'NOT Saved: New Price, Shares, Value Mixup');
			res.redirect('/');
			return;
		}
		sec_init_date = req.body.sec_init_date
		
		for(n in params){
				if( extras1.indexOf(params[n]) != -1 ){
					fields[params[n]] = req.body[extras2[extras1.indexOf(params[n])] ] || ''
				}else{
					fields[params[n]] = req.body[params[n]] || ''
				}
		}
        fields['cur_date'] = fields['init_date'] = sec_init_date

		SELECTED_SECURITY.ticker = req.body.ticker
		SELECTED_SECURITY.name = req.body.name
		SELECTED_SECURITY.cur_value = req.body.init_value
		SELECTED_SECURITY.cur_shares = req.body.init_shares
		SELECTED_SECURITY.cur_price = req.body.init_price
		SELECTED_SECURITY.account = req.body.account
		SELECTED_SECURITY.acct_type = req.body.acct_type
		SELECTED_SECURITY.type = req.body.type
		SELECTED_SECURITY.sector = req.body.sector
		SELECTED_SECURITY.goal = req.body.goal
		SELECTED_SECURITY.alert = req.body.alert
		if(req.body.notes == ''){
			SELECTED_SECURITY.notes = req.body.name
			fields['notes'] = req.body.name
		}else{
			SELECTED_SECURITY.notes = req.body.notes
			fields['notes'] = req.body.notes
		}
        if(C.verbose){
        	console.log(fields)
        }
		q = queries.insert_security(fields)
	}else{

			secid = req.body.secid;
			for(n in params){
				fields[params[n]] = req.body[params[n]]
			}
			q = queries.update_security(secid,fields)
			if(req.body.active == '0'){
					SELECTED_SECURITY = {}
	 		  	SELECTED_SECURITY.transactions = []
			}
	}
	req.db.query(q, function(err, rows, fields){
		    if (err)  {
	 		  	console.log('1-NEW/EDIT SEC error: ' + err);
	 		  	SELECTED_SECURITY = {}
	 		  	SELECTED_SECURITY.transactions = []
	      } else {

	      	if(kind=='new'){
	      			newsecid = rows.insertId;
	      			//console.log(newsecid)
	      			//q2 = "INSERT into transactions (transtype,securityid,date,nav,shares)";
	      			//q2 += " VALUES('Initial','"+newsecid+"','"+init_date+"','"+init_price+"','"+init_shares+"')"
							//console.log(q2)
							SELECTED_SECURITY.id = newsecid;

							trans = {}
							trans.action = 'Initial';
							trans.secid = newsecid;
							trans.sqldate = sec_init_date;
							trans.price = init_price;
							trans.shares = init_shares;
							trans.note = '';
      
							SELECTED_SECURITY.transactions = [{'securityid':newsecid,'date':init_date,'transtype':'Initial','nav':init_price,'shares':init_shares,'note':''}]
							req.db.query(queries.insert_transactions([trans]), function(err, rows, fields){
							    if (err)  {
						 		  	console.log('1-NEW/EDIT TRANS error: ' + err);
						 		  	SELECTED_SECURITY={}
						 		  	SELECTED_SECURITY.transactions = []
						      } else {
						      		//console.log(fields);
						      		//console.log('ROW INSERT ID',rows.insertId);
						      		SELECTED_SECURITY.transactions[0].id = rows.insertId
						      		req.flash('success', 'New Security added');
											res.redirect('/')
						      }
						  });
					}else{
						//console.log(fields);
						req.flash('success', 'Security edit saved');
						res.redirect('/')
					}

				}
		});


});
router.post('/change_secview', function (req, res) {
			SHOW_INFO = req.body.view;
			html = get_seclist_html(ALL_SECURITIES_BY_ID, SHOW_INFO)

			res.json({
			  		'html':html,
			  		'ssid':SELECTED_SECURITY.id
			});

});
router.post('/update_filter', function (req, res) {
    console.log('in update_filter')
	//console.log(req.body)
	if(req.body.type != 'default'){
	    LIST_TYPE = req.body.type
	    LIST_VALUE = req.body.value
	}
	if(req.body.value == 'none'){
	    LIST_TYPE = 'all'
	    LIST_VALUE = 'all'
	}
	
	res.json({"type":LIST_TYPE,"value":LIST_VALUE})
});
router.post('/view_securities', function (req, res) {
			console.log('in view_sec')
			//console.log(req.body)
			//if(req.body.type != 'default'){
			    //LIST_TYPE = req.body.type
			//}
			//var list_value = req.body.value
			var source = req.body.source;
			//console.log('source')
			//console.log(source)
			//console.log('LIST_TYPE')
			//console.log(LIST_TYPE)
			//SHOW_INFO = req.body.view
			ACTIVE = req.body.active
			
			var query,html;
			switch(LIST_TYPE) {
		    case 'goal':
		        //code block
		        query = queries.get_select_securities(LIST_TYPE,LIST_VALUE,ACTIVE);
		        break;
		    case 'type':
		        query = queries.get_select_securities(LIST_TYPE,LIST_VALUE,ACTIVE);
		        break;
		    case 'sector':
		        query = queries.get_select_securities(LIST_TYPE,LIST_VALUE,ACTIVE);
		        break;
		    case 'group':
		        query = queries.get_group_securities(LIST_TYPE,LIST_VALUE,ACTIVE);
		        break;
		    case 'account':
		        query = queries.get_select_securities(LIST_TYPE,LIST_VALUE,ACTIVE);
		        break;
		    case 'acct_type':
		        query = queries.get_select_securities(LIST_TYPE,LIST_VALUE,ACTIVE);
		        break;
		    case 'alert':
		        query = queries.get_select_securities(LIST_TYPE,LIST_VALUE,ACTIVE);
		        break;
		    case 'inactive':
		        //query = queries.get_hidden_securities(LIST_TYPE,list_value,ACTIVE);
		        query = queries.get_all_securities(ACTIVE);
		        break;
		    default:
		        query = queries.get_all_securities(ACTIVE);
			}
			
			if(C.verbose == true){
				console.log(query);
			}
			ALL_SECURITIES_BY_ID={}
			//DIVIDEND_SECURITIES_BY_ID={}
			ALL_SECURITIES_BY_NAME={}
			orphans = []
			html = '';
			group_total = 0
			req.db.query(query, function(err, rows, fields){
					if (err) { console.log('1-MAIN OBJ error: ' + err);	return;	}
		      if(rows.length > 0){
          			for (r in rows){
	          				ALL_SECURITIES_BY_ID[rows[r].id] = {}

	          				ALL_SECURITIES_BY_ID[rows[r].id].id 				= rows[r].id
	          				ALL_SECURITIES_BY_ID[rows[r].id].ticker 		= rows[r].ticker
	          				ALL_SECURITIES_BY_ID[rows[r].id].name 			= rows[r].name
	          				ALL_SECURITIES_BY_ID[rows[r].id].cur_price 		= rows[r].cur_price
	          				ALL_SECURITIES_BY_ID[rows[r].id].cur_shares 	= rows[r].cur_shares
	          				ALL_SECURITIES_BY_ID[rows[r].id].cur_value 		= rows[r].cur_value
	          				ALL_SECURITIES_BY_ID[rows[r].id].sector 		= rows[r].sector
	          				ALL_SECURITIES_BY_ID[rows[r].id].type 			= rows[r].type
	          				ALL_SECURITIES_BY_ID[rows[r].id].goal 			= rows[r].goal
	          				ALL_SECURITIES_BY_ID[rows[r].id].account 		= rows[r].account
	          				ALL_SECURITIES_BY_ID[rows[r].id].acct_type 		= rows[r].acct_type
	          				ALL_SECURITIES_BY_ID[rows[r].id].note 		  = rows[r].notes
                            ALL_SECURITIES_BY_ID[rows[r].id].div_yield      = rows[r].yield
                            ALL_SECURITIES_BY_ID[rows[r].id].div_freq      = rows[r].dividend_freq
                            ALL_SECURITIES_BY_ID[rows[r].id].alert      	= rows[r].alert
                            ALL_SECURITIES_BY_ID[rows[r].id].dividend      = rows[r].dividend
	          				ALL_SECURITIES_BY_ID[rows[r].id].transactions = []
	          				if(rows[r].dividend == 1){
	          					DIVIDEND_SECURITIES_BY_ID[rows[r].id] = ALL_SECURITIES_BY_ID[rows[r].id]
	          				}
          			}
          			first_id = rows[0].id
    				first_name = rows[0].name
          }else{
          			// no rows
          			first_id = 0
    						first_name = 'none'
          }
console.log('DIVIDEND_SECURITIES_BY_ID')
	console.log(DIVIDEND_SECURITIES_BY_ID)
          req.db.query(queries.get_all_transactions(ACTIVE), function(err, rows, fields){
          		if (err) { console.log('2-MAIN OBJ error: ' + err);	return;	}
          		if(rows){
          			for (r in rows){
          					secid = rows[r].securityid
          					//console.log(secid)
          					if(ALL_SECURITIES_BY_ID.hasOwnProperty(secid)){
	          					ALL_SECURITIES_BY_ID[secid].transactions.push(rows[r])
	          				}else{
	          					//console.log('Found orphan transaction: '+rows[r].id)
	          					orphans.push(rows[r].id)
	          				}
          			}
          		}else{
          			// no rows
          		}
          		//console.log('transaction orphans',orphans)
          		// sort each t list by date
          		for(k in ALL_SECURITIES_BY_ID){
          		 		ALL_SECURITIES_BY_ID[k].transactions.sort(sortByDate);
        			}
          		//console.log(JSON.stringify(MAIN_OBJ, null, 4))
          		html = get_seclist_html(ALL_SECURITIES_BY_ID, SHOW_INFO)
          		groupStats = get_group_stats(ALL_SECURITIES_BY_ID)
          		get_dividend_stats()

          		//console.log('groupStats')
          		//console.log(groupStats)
          		req.db.query(queries.get_total(), function(err, trows, fields){
                      if(err){
                            console.log('1-TOTs error: ' + err);
                      }else{
                            PORTFOLIO_TOTAL = trows[0].total;
                                    groupStats.pct_of_tot = (groupStats.tot_value / PORTFOLIO_TOTAL)*100
                            res.json({
                                    'html' :		html,
                                    'query' :		query,
                                    'list_type' :	LIST_TYPE,
                                    'list_value' :	LIST_VALUE,
                                    'first_id':		first_id,
                                    'first_name':	first_name,
                                    'stats' : 		groupStats,
                                    'tot_value':	PORTFOLIO_TOTAL
                            });
                      }
					});
                });
			});
});







router.post('/view_transactions', function (req, res) {
		var secid = req.body.secid
		
		ytd_start_date = 0;
		ytd_start_nav=0;
		var html='';
		if(ALL_SECURITIES_BY_ID.hasOwnProperty(secid)){
			SELECTED_SECURITY = ALL_SECURITIES_BY_ID[secid];

		}else{
			SELECTED_SECURITY = {}
			SELECTED_SECURITY.transactions = []
		}
		//console.log('SELECTED_SECURITY')
		//console.log(SELECTED_SECURITY)

		html = get_translist_html(SELECTED_SECURITY.transactions)
		secStats = get_security_stats(SELECTED_SECURITY.transactions)
		
		secStats.pct_of_gtot =
		res.json({

	    		'stats': secStats,
    			'html':  html,
    			'sec':   SELECTED_SECURITY
  	});


});



router.post('/get_group_info', function (req, res) {
	var list_type = req.body.type
	var list_value = req.body.value
	var query,html;
	switch(list_type) {
    case 'goal':
        //code block
        query = queries.get_select_securities(list_type,list_value,ACTIVE);
        break;
    case 'type':
        query = queries.get_select_securities(list_type,list_value,ACTIVE);
        break;
    case 'sector':
        query = queries.get_select_securities(list_type,list_value,ACTIVE);
        break;
    case 'group':
        query = queries.get_group_securities(list_type,list_value,ACTIVE);
        break;
    case 'account':
        query = queries.get_select_securities(list_type,list_value,ACTIVE);
        break;
    case 'acct_type':
        query = queries.get_select_securities(list_type,list_value,ACTIVE);
        break;
    case 'inactive':
        query = queries.get_hidden_securities(list_type,list_value);
        break;
    default:
        query = queries.get_all_group_info(ACTIVE);
	}
	if(C.verbose){
		console.log(query);
	}
	html = '';
	req.db.query(queries.get_all_group_info(), function(err, rows, fields){
			if (err)  {
 		  	console.log('1-ALL Trans error: ' + err);
      } else {
      	res.json({	'tot_value': rows[0].value});
      }
	});
});
//
//
//  NEEDS REFRESH
router.post('/enter_transaction', function (req, res) {
		console.log('in enter trans')
		console.log(req.body);
		//totshares = req.body.totshares;
		trans={}
		tshares = req.body.tshares;
		tprice = req.body.tprice;
		tvalue = req.body.tvalue;
		trans.sqldate = req.body.tdate;
		trans.secid = req.body.tsecid;
		trans.action = req.body.action;
		trans.note = req.body.tnote;
		if( tprice && tshares ){
			trans.price = tprice;
			trans.shares= tshares;
			trans.value = tprice * tshares;
		}else if( tvalue && tshares ){
			trans.value = tvalue;
			trans.shares = tshares;
			trans.price = tvalue / tshares;
		}else if( tvalue && tprice ){
			trans.value = tvalue;
			trans.price = tprice;
			trans.shares = tvalue / tprice;
		}else{
			// ERROR
			console.log('ERROR in price,shares,value')
			req.flash('fail', 'Trans NOT Saved: New Price, Shares, Value Mixup');
			res.redirect('/');
			return;
		}
		if(actionList.indexOf(trans.action) == -1){
  			actionList.push(trans.action)
  	}
		if(trans.action == 'Price Update'){
			trans.value = 0;
			trans.shares = 0;
		}
		if(trans.action.slice(0,4) == 'Sell'){
			trans.value = -Math.abs(trans.value);
			trans.shares = -Math.abs(trans.shares);
		}
		//console.log(trans)
		if(req.body.ttype == 'new'){
			q = queries.insert_transactions([trans]);
		}else{
			trans.tid = req.body.tid
			q = queries.update_transaction(trans);
		}
		req.db.query(q, function(err, rows, fields){
	    if (err)  {
 		  	console.log('1-NEW TRANS error: ' + err);
      } else {

      		rectify_security_table(req, res, [trans.secid]);
      		res.redirect('/');
      		//res.send({redirect: '/'});
      }

    });
		//insert_transactions(req, [trans])
		//get_update(req)



});
//
//
// NEEDS REFRESH
router.post('/delete_security', function (req, res) {
		console.log('in del sec')
		console.log(req.body);
		secid = req.body.secid;
		if(C.verbose){
			console.log(SELECTED_SECURITY)
		}

		req.db.query(queries.delete_security_transactions(secid), function(err, rows, fields){
	    if (err)  {
 		  	console.log('1-DEL SEC error: ' + err);
      } else {
      		req.db.query(queries.delete_security(secid), function(err, rows, fields){
				    if (err)  {
			 		  	console.log('1-DEL SEC TRANs error: ' + err);
			      } else {
      				SELECTED_SECURITY={id:0};
      				SELECTED_SECURITY.transactions = []
      				//res.redirect('/');
      				res.send({redirect: '/'});
      			}
      		});
      }

    });
});
// NEEDS REFRESH
router.post('/delete_transaction', function (req, res) {
		console.log('in del trans')
		console.log(req.body);
		var secid = SELECTED_SECURITY.id;
		var transid = req.body.transid;
		if(C.verbose){
			console.log(SELECTED_SECURITY)
		}

		req.db.query(queries.delete_transaction(secid,transid), function(err, rows, fields){
	    if (err)  {
 		  	console.log('1-DEL TRANS error: ' + err);
      } else {
      		// update DB: securities
      		rectify_security_table(req, res, [secid]);
      		res.send({redirect: '/'});
      }

    });
});
//
//
// NEEDS REFRESH
router.post('/edit_transaction', function (req, res) {
		console.log('in edit trans')
		console.log(req.body);
		secid = req.body.secid;
		transid = req.body.transid;
		//get_update(req)

});
router.get('/update_price/:id', function (req, res) {
	console.log('in update price --single')
	var id = req.params.id
	update_prices_conn([id], 'single', req, res)

});
router.post('/update_prices', function (req, res) {
	console.log('in update prices --all')
	secid_list =[]

	for(secid in ALL_SECURITIES_BY_ID){
 					ticker = ALL_SECURITIES_BY_ID[secid].ticker;
 					//console.log(ticker)
 					if(ticker){
 						secid_list.push(secid)
 					}
	}
	update_prices_conn(secid_list, 'all', req, res)

});
//
//
// NEEDS REFRESH
function update_prices_conn(id_lst, type, req, res) {
        //var googleFinance = require('google-finance');
        //type = 'single' or 'all'
        var yahooFinance = require('yahoo-finance');
		// https://www.npmjs.com/package/google-finance
		data_object = {};
		ticker_str = ''
		today = moment_date().format('YYYY-MM-DD')
		//console.log(ALL_SECURITIES_BY_ID)
		var SYMBOLS = []
		var all_tickers = []
		for(i in id_lst){
			ticker = ALL_SECURITIES_BY_ID[id_lst[i]].ticker;
			type = ALL_SECURITIES_BY_ID[id_lst[i]].type;
			//console.log('ticker',' ',ticker)
			if(ticker){
				//ticker_str += ticker+','
				data_object[ticker] = id_lst[i]
				
				if(ticker == 'TRAD' || ticker.substring(0,1) == 'Q'){
				  //console.log(ticker)
				}else{
					SYMBOLS.push(ticker)
				 }
			}
		}
		
	
		if(moment_date().day() == 0){   // Sunday
			//use 2 dayas ago
			//console.log('1')
			var d = new Date();
        	d.setDate(d.getDate()-2);
        	var FROM = d.toISOString().substring(0,10);
		}else if (moment_date().day() == 6 || moment_date().hour() < 17){  // Saturday
			//use 1 day ago
			//console.log('2')
			var d = new Date();
        	d.setDate(d.getDate()-1);
        	var FROM = d.toISOString().substring(0,10);
		}else{  
			//use today
			//console.log('3')
			var FROM = today
		}
		
		if(C.verbose){
			console.log('FROM')
 			console.log(today)
		}
		// This replaces the deprecated snapshot() API
		//console.log(SYMBOLS)
		yahooFinance.quote({
		  symbols: SYMBOLS,
 		  //symbols: ['NASDAQ:QCEQPX'],
		  modules: [ 'summaryDetail','price' ] }, function (err, response) {  // summaryDetail price  financialData
		  if (err) { 
		  	console.log(err);
		  }else{
		  	if(C.verbose){
				console.log('data_object')
				console.log(data_object)
				console.log('ALL_SECURITIES_BY_ID')
				console.log(ALL_SECURITIES_BY_ID)
		  	}
		  	//data_array = response.split("\n")
		    	hash_list = []
				//console.log(response)
		    	for(t in data_object){
		    		quote={}
		    		if(response.hasOwnProperty(t)){
		    			quote.secid  = data_object[t]
		    		    if(C.verbose){
		    		    	console.log(t)
		    		    	console.log(response[t])
		    		    	console.log('secid '+quote.secid)
		    		    }
		    		    
		    		    
		    		    // PRICE
		    		    if(ALL_SECURITIES_BY_ID[quote.secid].type == "Mutual Fund" || ALL_SECURITIES_BY_ID[quote.secid].type == "Stock Fund" || ALL_SECURITIES_BY_ID[quote.secid].type == "Bond Fund"){
		    		    	quote.price = response[t].summaryDetail.previousClose
		    		    }else if(ALL_SECURITIES_BY_ID[quote.secid].type == "ETF"){
		    		    	quote.price = response[t].price.regularMarketPrice
		    		    }else{
		    		    	try{
		    		    		quote.price = response[t].financialData.currentPrice
		    		    	}catch(err){
		    		    		quote.price = response[t].price.regularMarketPrice
		    		    	}
		    		    }
		    		    quote.ticker = t
			    		quote.action = 'Price Update'
		    		    
		    		    // YIELD
		    		    if(ALL_SECURITIES_BY_ID[quote.secid].type == "Mutual Fund" || ALL_SECURITIES_BY_ID[quote.secid].type == "Stock Fund" || ALL_SECURITIES_BY_ID[quote.secid].type == "Bond Fund"){
		    		    	//console.log(t+' '+(response[t].summaryDetail.yield).toString())
		    		    	quote.div_yield = (parseFloat(response[t].summaryDetail.yield) * 100).toFixed(2)
		    		    }else if(ALL_SECURITIES_BY_ID[quote.secid].type == "ETF"){
		    		    	//console.log(t+' '+(response[t].summaryDetail.yield).toString())
		    		    	quote.div_yield = (parseFloat(response[t].summaryDetail.yield) * 100).toFixed(2)
		    		    }else{
		    		    	//console.log(t+' '+(response[t].summaryDetail.dividendYield).toString())
		    		    	try{
		    		    		quote.div_yield = (parseFloat(response[t].summaryDetail.dividendYield) * 100).toFixed(2)
		    		    		//console.log(t+' '+(response[t].summaryDetail.dividendYield).toString())
		    		    	}catch(err){
		    		    		quote.div_yield = 0
		    		    	}
		    		    }
		    		    // if(response[t].summaryDetail.hasOwnProperty(response[t].summaryDetail.dividendYield) ){
//                   			quote.yield = response[t].summaryDetail.response[t].summaryDetail.dividendYield * 10
//                   			
//                   		}else{
//                   			quote.yield = ''
//                   	

		    		    ALL_SECURITIES_BY_ID[quote.secid].div_yield  = quote.div_yield
						quote.shares = 0
						quote.note   = ''
						quote.sqldate = FROM //get_sql_date(new Date(items[2].replace(/['"]+/g, '')))
						hash_list.push(quote)
		    		}else{
		    			console.log(t+' Not found')
		    		}
		    		
		    		
		    	}
		    	//console.log('queries')
		    	req.db.query(queries.insert_transactions(hash_list), function(err, rows, fields){
					    if (err)  {
				 		  	console.log('1-NEW TRANS error: ' + err);
				      } else {

				      		//update_db_values(req,res,secid,'single');
							console.log('running rectify');

				      		rectify_security_table(req, res, id_lst);
				      		req.flash('success', '  Done: Updated to: '+FROM);
				      		res.send({redirect: '/'});
				      		// if(type == 'all'){
// 				      			console.log('sending /')
// 				      			res.send({redirect: '/'});
// 				      		}else{
// 				      			console.log('redirect to /')
// 				      			res.redirect('/');
// 				      		}
				      		//

				      }

				  });
		  	
		 	 }
		});
		

}


router.get('/cleanup/:type', function (req, res) {
    console.log('CLEANUP/:type')
    var type = req.params.type   // all or single
	var secid = SELECTED_SECURITY.id;
	if(type == 'all'){
	    q1 = queries.get_all_max_transactions   //()
	    q2 = queries.delete_price_updates2    //(saved_id_list)
	    vals1 = ''
	}else{
	    q1 = queries.get_max_transaction      //(secid)
	    q2 = queries.delete_price_updates   //(secid, saveid)
	    vals1 = secid 
	}
	
	req.db.query(q1(vals1), function(err, rows, fields){
 			if(err){ console.log(err)
 			}else{
 			    if(type == 'all'){
 			        var saved_id_list = []
                    for(n in rows){
                        //console.log(row)
                        transid = rows[n].id
                        secid = rows[n].securityid
                        saved_id_list.push(transid)
                    
                    }
                    vals2 = saved_id_list
 			    }else{
 			        saveid = 0;
 			        if(rows[0].transtype == 'Price Update'){
						saveid  = rows[0].id;
                    }
                    vals2 = [secid, saveid]
 			    }
 			}
 			
 			req.db.query(q2(vals2),  function(err, rows, fields){
 					if(err){ console.log(err)
 					}else{
						req.db.query(queries.get_transactions(secid), function(err, rows, fields){
							if(err){ console.log(err)
 							}else{
								SELECTED_SECURITY.transactions = rows
								res.json({ 'html': get_translist_html(rows) });
							}
						});
 					}
 			});
 	 });
});

//
//
//
router.get('/admin', function (req, res) {

		res.render('admin', {
      	title : config.APP_NAME.capitalizeFirstLetter()+': ADMIN'
    });
});

//
//
//
router.get('/backup_dump', function (req, res) {
		console.log('in backup')

		var dump_file = CURRENT_DATABASE+'_'+today +'.sql'
		var cmd = 'mysqldump '+CURRENT_DATABASE+' > public/dump/'+dump_file
		if(C.verbose){
			console.log(dump_file)
			console.log(cmd)
		}
		var exec = require('child_process').exec;
		exec(cmd, function callback(error, stdout, stderr){
    		if(error){console.log(error)}
    		else{
    			req.flash('success', 'Saved: '+dump_file);

					res.redirect('/');
    		}
		});

});

router.get('/notes', function (req, res) {
		console.log('in notes')
		var notes_file = path.join(process.env.PWD,'public','notes.txt')
    fs.createFileSync(notes_file,'w')  // creates file if not exist
    //console.log(notes_file)
		fs.readFile(notes_file, 'utf8', function (err,data) {
          if (err) {
            return console.log(err);
          }
          res.render('notes', {
                title : config.APP_NAME.capitalizeFirstLetter()+': NOTES',
                data: data
          });
        });
});
router.post('/save_notes', function (req, res) {
		console.log('in save notes')
    var txt = req.body.notes
		var notes_file = path.join(process.env.PWD,'public','notes.txt')
		//console.log(notes_file)
		fs.writeFile(notes_file, txt, function (err) {
          if (err) {
            return console.log(err);
          }
          res.render('notes', {
                title : config.APP_NAME.capitalizeFirstLetter()+': NOTES',
                data: txt
          });
        });
});
router.get('/dividend', function (req, res) {
	console.log('in dividend')
	// get dividend stocks
	
	
	id631 = DIVIDEND_SECURITIES_BY_ID[631]
	// dps = ((parseFloat(d[row]['div_yield']))/100 * parseFloat(d[row]['cur_price'])) / d[row]['div_freq'] %>
    // est_div = parseFloat(dps) * d[row]['div_freq'] * parseFloat(cshares)
	dps = ((id631['div_yield']/100)*id631['cur_price'])/id631['div_freq']
	
	console.log('dps')
	console.log(dps)
	est_div = dps * id631['div_freq'] * id631['cur_shares']
	console.log('est_div')
	console.log(est_div)
	
	res.render('dividend', {
				title : config.APP_NAME.capitalizeFirstLetter()+': Dividends',
				database 	: CURRENT_DATABASE,
				app_name  : config.APP_NAME.capitalizeFirstLetter(),
				data	: JSON.stringify(DIVIDEND_SECURITIES_BY_ID)
		});
	// query = queries.get_dividend_stocks();
// 	req.db.query(query, function(err, rows, fields){
// 		if (err) { console.log('1-MAIN OBJ error: ' + err);	return;	}
//   		if(rows.length > 0){
// 			for (r in rows){
// 				console.log(rows[r])
// 			}
// 			res.render('dividend', {
// 				title : config.APP_NAME.capitalizeFirstLetter()+': Home Page',
// 				database 	: CURRENT_DATABASE,
// 				app_name  : config.APP_NAME.capitalizeFirstLetter(),
// 				data	: JSON.stringify(rows)
// 			});
// 		}
//     });
   
});

router.get('/charts', function (req, res) {
	console.log('in charts')
	
	console.log('DIVIDEND_SECURITIES_BY_ID MAIN')
	console.log(DIVIDEND_SECURITIES_BY_ID[631])
	res.render('charts', {
				title : config.APP_NAME.capitalizeFirstLetter()+': Charts',
				database 	: CURRENT_DATABASE,
				app_name  : config.APP_NAME.capitalizeFirstLetter(),
				data	: JSON.stringify(DIVIDEND_SECURITIES_BY_ID)
		});
});
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////// F U N C T I O N S /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
function sortByDate(a, b) {
    return new Date(a.date) - new Date(b.date);
}
function sortByName(a, b) {
    var x = a.name.toLowerCase();
    var y = b.name.toLowerCase();
    return x < y ? -1 : x > y ? 1 : 0;
}
function get_seclist_html(secObj, view){
		html = ''
		html += "<table border='1' id='security_table' class='table table-condensed'>";
		html += "<thead>";
		html += "<tr id=''><th>Ticker</th>"
  	html += "<th>Name<span class='pull-right'>Alert</span></th>"
  	if(view == 'val'){
  		html += "<th>Price</th><th>Shares</th>"
  		html += "<th>Value</th><th>Yield</th><th></th></tr>";
		}else{
			html += "<th>Account</th><th>Sector</th>"
			html += "<th>Type</th><th>Category</th><th></th></tr>";
		}
		html += "</thead>";
		html += "<tbody>";

		//var keys = Object.keys(secObj);
		sortList = []
		for(m in secObj){
			sortList.push(secObj[m])
		}
		sortList.sort(sortByName);
		//console.log(JSON.stringify(sortList, null, 4))

		var ticwidth = 70
		//var namewidth = 300  // see css: nowrap_name
		// var infowidth = 80
		var imgwidth = 30
		if(secObj){

			for (k in sortList){
				ALL_SECURITIES_BY_NAME[sortList[k].name] = sortList[k];
    		html += "<tr id='"+sortList[k].id+"' style='' onclick=\"view_transactions_ajax('"+sortList[k].id+"','"+sortList[k].name+"')\">";
        html += "<td id='"+sortList[k].ticker+"' data-toggle='tooltip' data-container='body' data-placement='left' title='"+sortList[k].note+"' width='"+ticwidth+"' >";
        //html += "    <a href='#' >" + sortList[k].ticker + "</a>";
        html += sortList[k].ticker
        html += "</td>";

        html += "<td class='nowrap_name'  id='"+sortList[k].name+"' data-toggle='tooltip' data-container='body' data-placement='left' title='"+sortList[k].note+"'>"
        html += "<span class='pull-left'>"+sortList[k].name+"</span>"
        html += "<span class='pull-right' style='color:red;' >"+sortList[k].alert+"</span></td>";

        if(view == 'val'){
        	html += "<td class='change_secview' ><div>$"+parseFloat(sortList[k].cur_price).toFixed(2)+"</div></td>";
        	html += "<td class='nowrap_value' ><div>"+parseFloat(sortList[k].cur_shares).toFixed(3)+"</div></td>";
        	html += "<td class='nowrap_value' ><div>$"+parseFloat(sortList[k].cur_value).formatMoney(2)+"</div></td>";
          if(sortList[k].div_yield != 'N/A'){
            html += "<td class='nowrap_value'><div>"+parseFloat(sortList[k].div_yield)+"%</div></td>";
          }else{
            html += "<td class='nowrap_value'><div></div></td>";
          }
        }else{
        	html += "<td class='nowrap_info'><div>"+sortList[k].account+"</div></td>";
        	html += "<td class='nowrap_info'><div>"+sortList[k].sector+"</div></td>";
        	html += "<td class='nowrap_info'><div>"+sortList[k].type+"</div></td>";
        	html += "<td class='nowrap_info'><div>"+sortList[k].goal+"</div></td>";
        }
        html += "<td class='nowrap'  width='"+imgwidth+"' halign='center' style='text-align:center'>";
        html += "  <a href='security_form/edit/"+sortList[k].id+"' title='edit' id='edit_image_id' >"
				html += "  <img src='images/edit.png' alt='alt' height='15' border='0'></a>"
				html += "  <a href='update_price/"+sortList[k].id+"' title='update' id='update_image_id' >"
				html += "  <img src='images/update.png' alt='alt' height='15' border='0'></a>"
        html += "</td>";
    		html += "</tr> ";
			}
		}else{
			html += "<tr><td></td><td>NONE</td></tr>";

		}
		html += "</tbody>";
		html += "</table>";

		return html;
}
//
//
//
function get_translist_html(tlist){
		var sumofshares = 0
		var costofshares
		var value
		var html = ''

		html += "<div id='transaction_table_div'>"
   	html += "<table border='1' id='transaction_table' >"
   	html += '<tr>';
  	html += '<th>Date</th>';
  	html += '<th>Transaction</th>';
  	html += '<th>Price</th>';
  	html += '<th>Shares</th>';
  	html += '<th>CostOfShares</th>';
  	html += '<th>SumOfShares</th>';
  	html += '<th>Value</th>';
  	html += '<th></th>';
  	html += '</tr>';
		for(r in tlist){

    		var transid = tlist[r].id
    		var date =tlist[r].date
    		var trans = tlist[r].transtype
    		var nav = tlist[r].nav
    		var shares = tlist[r].shares
    		var note = tlist[r].note
    		costofshares = parseFloat(nav) * parseFloat(shares);
    		sumofshares += parseFloat(shares);
    		value = sumofshares * nav;

				html += '<tr id='+transid+'>';
	    	html += '<td>'+date+'</td>';

	    	if(trans == 'NOTE'){
	    		html += "<td colspan='6'>NOTE: "+note+'</td>';

	    	}else{
	    		if(trans.substring(0,8) == 'Year End'){
	    			html += '<td><strong>'+trans+'</strong></td>';
	    		}else{
	    			html += '<td>'+trans+'</td>';
	    		}

		    	html += '<td>$'+parseFloat(nav).toFixed(2)+'</td>';
		    	if(trans == 'Price Update' || trans.substring(0,8) == 'Year End'){
		    		html += '<td></td>';
		    		html += '<td></td>';
		    	}else{
		    		html += '<td>'+parseFloat(shares).toFixed(3)+'</td>';
		    		if(trans.substring(0,5) == 'Split'){
		    			html += '<td></td>';
		    		}else{
		    			html += '<td>$'+costofshares.toFixed(2)+'</td>';
		    		}
		    	}
		    	html += '<td>'+sumofshares.toFixed(3)+'</td>';
		    	html += '<td>$'+value.formatMoney(2)+'</td>';
		    }
	    	if( trans == 'Initial'){
	    		html += "<td></td>";
	    	}else{
		    	html += "<td halign='center' style='text-align:center'>";
		    	html += "<a href='#' class='edit_transaction' \
		    		onclick=\"edit_transaction('"+transid+"','"+trans+"','"+date+"','"+nav+"','"+shares+"')\">"
					//html += "<a href='' class='edit_transaction' >"
					html += "  <img src='images/edit.png' title='edit' alt='edit' height='15' border='0'  ></a>"
					html += "&nbsp;<a href='' id='del_timage_id' onclick=\"delete_transaction('"+transid+"')\">"
					html += "  <img src='images/delete.png' title='delete' alt='delete' height='15' border='0'></a>"
					html += '</td>';
				}

				html += '</tr>';
		}
		html += '<tr><td colspan="8">&nbsp;</td></tr>'
		html += '</table>'
		html += '</div>';
		return html
}
function get_group_stats(secObj){
		gstats = {}
		gstats.tot_value =0
		gstats.invested =0
		gstats.basis =0
		gstats.profit =0
		gstats.tot_return = 0

		for(secid in secObj){
				tlist = secObj[secid].transactions
				tstats = get_security_stats(tlist)
				gstats.tot_value += tstats.tot_value
				gstats.invested += tstats.invested
				gstats.basis += tstats.basis
				gstats.profit += tstats.profit
		}
		gstats.sec_count = Object.keys(secObj).length

		if(gstats.sec_count > 0){
    	gstats.tot_return = (gstats.profit / Math.abs(gstats.invested))*100

		}

    return gstats
}
function get_dividend_stats(){
		
	for(secid in DIVIDEND_SECURITIES_BY_ID){
			tlist = DIVIDEND_SECURITIES_BY_ID[secid].transactions
			tstats = get_security_stats(tlist)
			DIVIDEND_SECURITIES_BY_ID[secid].basis = tstats.basis
	}
}

function get_security_stats(tlist){

		var return_obj = {}
		var sumofshares = 0
		var invested = 0
		var basis = 0
		var maxDate = 0
		var ytd_start_date = 0;
		var ytd_start_nav=0;
		var pct_of_tot=0;
		if(tlist.length == 0){
	    	 	return_obj.tot_value 	= 0
			    return_obj.tot_shares 	= 0
			    return_obj.invested 	= 0
			    return_obj.basis 		= 0
			    return_obj.profit 		= 0
			    return_obj.tot_return 	= 0
			    return_obj.ytd_return 	= 0
    			return_obj.held_for 	= 0
    			return_obj.pct_of_tot 	= 0
		}else{
				for(r in tlist){

		    		date = tlist[r].date
		    		trans = tlist[r].transtype
		    		nav = tlist[r].nav
		    		shares = tlist[r].shares
		    		note = tlist[r].note
		    		costofshares = parseFloat(nav) * parseFloat(shares);
		    		sumofshares += parseFloat(shares);
		    		value = sumofshares * nav;

			    	jsdate = new Date(date)
			    	if(jsdate > maxDate){
			    		maxDate = jsdate
			    	}

			    	start_year = 0

						if( trans == 'Initial'){
							init_date = jsdate;
						}
						if( trans == 'Initial' || trans.substring(0,3) == 'Buy' || trans.substring(0,4) == 'Sell'){
							invested += costofshares;
						}

						last_year = moment_date().year() - 1;
						if(trans == 'Year End - '+last_year.toString()){
							ytd_start_date = jsdate
							ytd_start_nav = nav;
						}
			    	if( trans == 'Initial' ||
								trans.substring(0,3) == 'Buy' ||
								trans.substring(0,4) == 'Sell' ||
								trans == 'Dividend' ||
								trans.indexOf('Capital Gain') > -1
			    		){
							basis += costofshares;
						}

				}
				return_obj.tot_value = sumofshares * nav;
				return_obj.pct_of_tot = (return_obj.tot_value / PORTFOLIO_TOTAL)*100
		    //return_obj.tot_shares = sumofshares;
		    return_obj.invested = invested;
		    return_obj.basis = basis;
		    
		    return_obj.profit = return_obj.tot_value - return_obj.invested;
		    return_obj.tot_return = (return_obj.profit / Math.abs(return_obj.invested))*100
		    if(ytd_start_nav){
		    	return_obj.ytd_return = ((nav - ytd_start_nav)/ytd_start_nav)*100;
		  	}else{
		  		return_obj.ytd_return = return_obj.tot_return;
		  	}
		    return_obj.held_for = daydiff(init_date,today);
		}
		return return_obj
}

function rectify_security_table(req, res, secid_list) {
		console.log('in rectify_security_table')
		//console.log(secid_list)
		//secid_list = [130,131,132];  // CVX, KO, OAKLX
		// first query
    var get_sum_shares = function(callback) {
		  req.db.query(queries.get_sum_shares(secid), function(err, rows1, fields){
					if (err)  { console.log( err);return;}
					totshares = rows1[0].tot_shares;
					secid = rows1[0].securityid;
					callback(null, {secid:secid,totshares:totshares});
			});
    };
	var get_sec_fields = function(callback) {
		  req.db.query(queries.get_max_transaction(secid), function(err, rows2, fields){
				    if (err)  { console.log( err);return;}
		      	field_list = {}
		      	maxprice = rows2[0].nav;
		      	//console.log('maxprice '+maxprice)
		      	field_list['cur_price'] = maxprice;
		      	field_list['cur_shares'] = totshares;
		      	field_list['cur_value'] = totshares * maxprice;
		      	maxdate = rows2[0].date;
		      	field_list['cur_date'] = get_sql_date(new Date(maxdate));
            if(ALL_SECURITIES_BY_ID[secid].hasOwnProperty('div_yield')){
              field_list['yield'] = ALL_SECURITIES_BY_ID[secid].div_yield
            }else{
              field_list['yield'] = 'NA'
            }

		      	//field_list['secid'] = secid;
		      	//console.log('maxdate:',field_list['cur_date']);
		      	callback(null, field_list);

			});
    };
	var updateSec = function(err, result){
			//console.log('in updateSec',result);
			secid = result.shareslist.secid;
			req.db.query(queries.update_security(secid,result.fieldlist), function(err, rows3, fields){
		       		if (err)  { console.log( err);return;}
		       		
		  });
	};

		// http://book.mixu.net/node/ch7.html
	for(i in secid_list){
		secid=secid_list[i]
		//console.log('secid',secid)
  		//console.log('yield',ALL_SECURITIES_BY_ID[secid].yield)

		async.parallel({
			shareslist : get_sum_shares,
			fieldlist : get_sec_fields,
		}, updateSec );
	}


		// fp([
		// 		function(next) { q1(1, next); },
    // 			function(next) { q2(2, next); },
    // 			],last );
}
///////////////////////////////////////////////////////////////////////////////////

// For One security:
function update_db_values(req,res,secid,source){

	//function final(results) { console.log('Done', results); }

	req.db.query(queries.get_sum_shares(secid), function(err, rows1, fields){
		if (err)  {
		  	console.log('1-Update db trans error: ' + err);
    } else {
				totshares = rows1[0].tot_shares;
				req.db.query(queries.get_max_transaction(secid), function(err, rows2, fields){
			    if (err)  {
		 		  	console.log('2-Update db trans error: ' + err);
		      } else {
		      	field_list = {}
		      	maxprice = rows2[0].nav;
		      	//console.log('maxprice '+maxprice)
		      	field_list['cur_price'] = maxprice;
		      	field_list['cur_shares'] = totshares;
		      	field_list['cur_value'] = totshares * maxprice;
		      	maxdate = rows2[0].date;
		      	field_list['cur_date'] = get_sql_date(new Date(maxdate))
		      	req.db.query(queries.update_security(secid,field_list), function(err, rows3, fields){
		      		if (err)  {
				 		  	console.log('3-Update db trans error: ' + err);
				      } else {
				      	req.flash('success', 'New transaction added');
								if(source == 'single'){
									res.redirect('/');
								}

				      }
		      	});
		      }
		    });
		}
	});
}
//
//
//
String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
function daydiff(first, second) {
    return Math.round((second-first)/(1000*60*60*24));
};
//
function get_sql_date(jsdate){
				return dateFormat(jsdate, "yyyy-mm-dd");
};
function pad(width, string, padding) {
  return (width <= string.length) ? string : pad(width, padding + string, padding)
}
//
Number.prototype.formatMoney = function(c, d, t){
var n = this,
    c = isNaN(c = Math.abs(c)) ? 2 : c,
    d = d == undefined ? "." : d,
    t = t == undefined ? "," : t,
    s = n < 0 ? "-" : "",
    i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
    j = (j = i.length) > 3 ? j % 3 : 0;
   return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};
//
// function insert_transactions(req, tlist){

// 		req.db.query(queries.insert_transactions(tlist), function(err, rows, fields){
// 	    if (err)  {
//  		  	console.log('1-NEW TRANS error: ' + err);
//       } else {

//       		update_db_values(req,res,secid,'single');
//       }

//     });
// };

//
//
//


module.exports = router;
