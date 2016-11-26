var express = require('express');
var router = express.Router();
var http = require('http')
var url = require('url');
var async = require('async');
var fs = require('fs-extra')
var path = require('path')
var dateFormat = require('dateformat');
var today = new Date();
var queries = require('./queries');

router.get('/', function (req, res) {
  console.log('in index/home')
  //console.log(SELECTED_SECURITY)
  var ssid = SELECTED_SECURITY.id || 0;
  if(ssid == 0){
  	SELECTED_SECURITY.transactions = []
  }
  //console.log(ssid);
  //console.log(TAUTOA_DATABASE);
  res.render('index', {
      title : 'Tautoa: Home Page',

      //securities : JSON.stringify(ALL_SECURITIES_BY_ID),
      selected_securityID: ssid,
      databases	: databaseList,
      database 	: TAUTOA_DATABASE,
      types 		: typeList,
      goals 		: goalList,
      sectors 	: sectorList,
      accounts 	: accountList,
      actions 	: actionList,
      groups 		: groupList,
      message 	: req.flash('message'),
      active 		: ACTIVE,
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
									//console.log(rows[0])
									res.render('security', {
									      title : 'Tautoa: Edit Security',
									      data : JSON.stringify(rows[0]),
									      kind : 'edit',
									      total : PORTFOLIO_TOTAL,
									      types : typeList,
									      goals : goalList,
									      sectors : sectorList,
									      accounts : accountList,
									      groups : groupList,
									      secid : secid

									      //hostname: req.C.hostname,
									      //message: req.flash('message'),

									    });
								}
				});
		}else{

			res.render('security', {
			      title : 'Tautoa: New Security',
			      data : JSON.stringify({}),
			      kind : 'new',
			      total : PORTFOLIO_TOTAL,
			      types : typeList,
			      goals : goalList,
			      sectors : sectorList,
			      accounts : accountList,
			      groups : groupList,
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

	console.log(req.body)
	params =['name','ticker','account','active','type','goal','sector','group_code','notes'];
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
			req.flash('message', 'NOT Saved: New Price, Shares, Value Mixup');
			res.redirect('/');
			return;
		}
		init_date = req.body.init_date
		for(n in params){
				if( extras1.indexOf(params[n]) != -1 ){
					fields[params[n]] = req.body[extras2[extras1.indexOf(params[n])] ] || ''
				}else{
					fields[params[n]] = req.body[params[n]] || ''
				}
		}


		SELECTED_SECURITY.ticker = req.body.ticker
		SELECTED_SECURITY.name = req.body.name
		SELECTED_SECURITY.cur_value = req.body.init_value
		SELECTED_SECURITY.cur_shares = req.body.init_shares
		SELECTED_SECURITY.cur_price = req.body.init_price
		SELECTED_SECURITY.account = req.body.account
		SELECTED_SECURITY.type = req.body.type
		SELECTED_SECURITY.sector = req.body.sector
		SELECTED_SECURITY.goal = req.body.goal
		if(req.body.notes == ''){
			SELECTED_SECURITY.notes = req.body.name
			fields['notes'] = req.body.name
		}else{
			SELECTED_SECURITY.notes = req.body.notes
			fields['notes'] = req.body.notes
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
							trans.sqldate = init_date;
							trans.price = init_price;
							trans.shares = init_shares;
							trans.note = '';
							// { id: 1956,
       // securityid: 130,
       // date: '2006-05-01',
       // transtype: 'Initial',
       // nav: '45.0000',
       // shares: '100.0000',
       // note: '' }
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
						      		req.flash('message', 'New Security added');
											res.redirect('/')
						      }
						  });
					}else{
						//console.log(fields);
						req.flash('message', 'Security edit saved');
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
router.post('/view_securities', function (req, res) {
			var list_type = req.body.type
			var list_value = req.body.value
			//SHOW_INFO = req.body.view
			ACTIVE = req.body.active
			console.log(req.body)
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
		    case 'inactive':
		        //query = queries.get_hidden_securities(list_type,list_value,ACTIVE);
		        query = queries.get_all_securities(ACTIVE);
		        break;
		    default:
		        query = queries.get_all_securities(ACTIVE);
			}
			console.log(query);
			ALL_SECURITIES_BY_ID={}
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
	          				ALL_SECURITIES_BY_ID[rows[r].id].cur_price 	= rows[r].cur_price
	          				ALL_SECURITIES_BY_ID[rows[r].id].cur_shares = rows[r].cur_shares
	          				ALL_SECURITIES_BY_ID[rows[r].id].cur_value 	= rows[r].cur_value
	          				ALL_SECURITIES_BY_ID[rows[r].id].sector 		= rows[r].sector
	          				ALL_SECURITIES_BY_ID[rows[r].id].type 			= rows[r].type
	          				ALL_SECURITIES_BY_ID[rows[r].id].goal 			= rows[r].goal
	          				ALL_SECURITIES_BY_ID[rows[r].id].account 		= rows[r].account
	          				ALL_SECURITIES_BY_ID[rows[r].id].note 		  = rows[r].notes
                    ALL_SECURITIES_BY_ID[rows[r].id].yield      = rows[r].yield
	          				ALL_SECURITIES_BY_ID[rows[r].id].transactions = []
          			}
          			first_id = rows[0].id
    						first_name = rows[0].name
          }else{
          			// no rows
          			first_id = 0
    						first_name = 'none'
          }

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
          		console.log('transaction orphans',orphans)
          		// sort each t list by date
          		for(k in ALL_SECURITIES_BY_ID){
          		 		ALL_SECURITIES_BY_ID[k].transactions.sort(sortByDate);
        			}
          		//console.log(JSON.stringify(MAIN_OBJ, null, 4))
          		html = get_seclist_html(ALL_SECURITIES_BY_ID, SHOW_INFO)
          		groupStats = get_group_stats(ALL_SECURITIES_BY_ID)

          		//console.log('groupStats')
          		//console.log(groupStats)
          		req.db.query(queries.get_total(), function(err, trows, fields){
							    if (err)  {
						 		  	console.log('1-TOTs error: ' + err);
						      } else {
		      						PORTFOLIO_TOTAL = trows[0].total;
											groupStats.pct_of_tot = (groupStats.tot_value / PORTFOLIO_TOTAL)*100
		      						res.json({
							    			'html':html,
							    			'query':query,
							    			'list_type':list_type,
							    			'list_value':list_value,
							    			'first_id':first_id,
							    			'first_name':first_name,
							    			'stats' : groupStats,
							    			'tot_value':PORTFOLIO_TOTAL
						  				});
						  		}
						  });
          });
			});
});







router.post('/view_transactions', function (req, res) {
		var secid = req.body.secid
		today = new Date();
		ytd_start_date = 0;
		ytd_start_nav=0;
		var html='';
		if(ALL_SECURITIES_BY_ID.hasOwnProperty(secid)){
			SELECTED_SECURITY = ALL_SECURITIES_BY_ID[secid];

		}else{
			SELECTED_SECURITY = {}
			SELECTED_SECURITY.transactions = []
		}
		console.log('SELECTED_SECURITY')
		console.log(SELECTED_SECURITY)

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
    case 'inactive':
        query = queries.get_hidden_securities(list_type,list_value);
        break;
    default:
        query = queries.get_all_group_info(ACTIVE);
	}
	console.log(query);
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
			req.flash('message', 'Trans NOT Saved: New Price, Shares, Value Mixup');
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
		console.log(SELECTED_SECURITY)


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
		console.log(SELECTED_SECURITY)


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
 					console.log(ticker)
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

		options = {
			host: 'download.finance.yahoo.com',
			path: '/d/quotes.csv?s='
		}
		// options = {
		// 	host: 'www.google.com',
		// 	path: '/finance/info?client=ig&q='
		// }
		//secid_list =[]
		data_object = {};
		ticker_str = ''
		for(i in id_lst){
 					ticker = ALL_SECURITIES_BY_ID[id_lst[i]].ticker;
 					console.log('ticker',' ',ticker)
 					if(ticker){
 						ticker_str += ticker+','
 						data_object[ticker] = id_lst[i]

 					}
		}
		//url = "http://download.finance.yahoo.com/d/quotes.csv?s="
		//tics = [];

			// -X
		// // [ { "id": "1" ,    "t" : "BJBHX" ,"e" : "MUTF" ,"l" : "8.50" ,"l_fix" : "8.50" ,"l_cur" : "$8.50" ,"s": "0" ,"ltt":"4:00PM EST" ,"lt" : "Dec 16, 4:00PM EST" ,  "lt_dts" : "2015-12-16T16:00:00Z" ,"c" : "+0.02" ,"c_fix" : "0.02" ,"cp" : "0.24" ,"cp_fix" : "0.24" ,"ccol" : "chg" ,"pcls_fix" : "8.50" } ]
		// -reg
	// // [   { "id": "33312" ,"t" : "T" ,"e" : "NYSE" ,    "l" : "34.04" ,"l_fix" : "34.04" ,"l_cur" : "34.04" ,"s": "2" ,"ltt":"5:21PM EST" ,"lt" : "Dec 17, 5:21PM EST" ,"lt_dts" : "2015-12-17T17:21:09Z" ,"c" : "-0.36" ,"c_fix" : "-0.36" ,"cp" : "-1.05" ,"cp_fix" : "-1.05" ,"ccol" : "chr" ,"pcls_fix" : "34.4" ,
	// "el": "34.00" ,"el_fix": "34.00" ,"el_cur": "34.00" ,"elt" : "Dec 17, 5:23PM EST" ,"ec" : "-0.04" ,"ec_fix" : "-0.04" ,"ecp" : "-0.12" ,"ecp_fix" : "-0.12" ,"eccol" : "chr" ,"div" : "0.47" ,"yld" : "5.52" } ]

		// url = 'www.google.com/finance/info?client=ig&q='
		//var tics = ['AAPL','CSCO','SYK'];

		// url = "http://download.finance.yahoo.com/d/quotes.csv?s="
  //       # append ticker+
  //       self.c.execute(C.tautoa_other_queries['ticker_list'])
  //       for row in self.c.fetchall():
  //           url += row['ticker']+'+'
  //       url = url[:-1] + '&f=sl1d1y'
  //   http://download.finance.yahoo.com/d/quotes.csv?s=VZ,T&f=sl1d1y
  //"VZ",47.21,"12/29/2015",4.88
  //"T",34.93,"12/29/2015",5.58
		ticker_str = ticker_str.slice(0,ticker_str.length -1)
		options.path += ticker_str + '&f=sl1d1y'
		console.log('http://'+options.host+options.path )

		var response = '';
		// Error: connect ETIMEDOUT
		// Error: getaddrinfo ENOTFOUND
		var getRequest = http.get(options, function(request) {
		    //res.setEncoding('utf8');

		    request.on('data', function(chunk){
		      //console.log(options.path)
		      //console.log('chunk:'+chunk)
		      response += chunk
		    });
		    request.on('error', function(err){
		      //console.log(options.path)
		      console.log('got error: '+err)
		      req.flash('message', 'Unable to get new quotes');
		      if(type == 'all'){
      			res.send({redirect: '/'});
      		}else{
      			res.redirect('/');
      		}
		    });
		    request.on('end', function(){
		    	data_array = response.split("\n")
		    	hash_list = []

		    	for(n in data_array){
		    		console.log('data_array',data_array[n])
		    		if(data_array[n] != ''){
		    				items = data_array[n].split(',')
		    				if(items[2] !== 'N/A'){
			    				quote={}
			    				quote.ticker = items[0].replace(/['"]+/g, '')
			    				quote.action = 'Price Update'
			    				quote.price  = items[1]
                  quote.secid  = data_object[quote.ticker]
                  ALL_SECURITIES_BY_ID[quote.secid].yield  = items[3]
                  quote.yield = items[3]
			    				quote.shares = 0
			    				quote.note   = ''
			    				quote.sqldate = get_sql_date(new Date(items[2].replace(/['"]+/g, '')))
			    				hash_list.push(quote)

			    			}
		    		}
		    	}
		    	//console.log(hash_list)
		    	req.db.query(queries.insert_transactions(hash_list), function(err, rows, fields){
					    if (err)  {
				 		  	console.log('1-NEW TRANS error: ' + err);
				      } else {

				      		//update_db_values(req,res,secid,'single');
									console.log('running rectify');

				      		rectify_security_table(req, res, id_lst);
				      		if(type == 'all'){
				      			res.send({redirect: '/'});
				      		}else{
				      			res.redirect('/');
				      		}
				      		//

				      }

				  });
		    });
		});  // end http.get()
		getRequest.on('error', function (err) {
				console.log(err);
				req.flash('message', 'Unable to get new quotes - try again later. Here is the error: '+err);
				res.send({redirect: '/'});

		});

}

// router.post('/update_pricesX', function (req, res) {


// 		data_object = {};
// 		tics = [];
// 		secid_list =[]
// 		for(secid in ALL_SECURITIES_BY_ID){
//  					ticker = ALL_SECURITIES_BY_ID[secid].ticker;
//  					console.log(ticker)
//  					if(ticker){
//  						data_object[ticker] = secid;
//  						tics.push(ticker)
//  						secid_list.push(secid)
//  					}

// 		}


// 		var completed_requests = 0;


// 		base_path = options.path;
// 		var responses = {};
// 		tics.forEach(function(tic) {

// 		  options.path = base_path+tic

// 		  console.log(options.host+options.path)
// 		  http.get(options, function(request) {
// 		    //res.setEncoding('utf8');
// 		    request.on('data', function(chunk){
// 		      //console.log(options.path)
// 		      //console.log('chunk:'+chunk)
// 		      if(chunk.toString().substring(0,10) != 'httpserver'){
// 		      		responses[data_object[tic]] = JSON.parse(chunk.toString().substring(3))[0];
// 		      }

// 		    });

// 		    request.on('end', function(){

// 		      if (completed_requests++ == tics.length - 1) {
// 		        // All downloads are completed
// 		        //console.log('body:', responses);
// 		        hash_list = []

// 		        for(i in responses){
// 		        	quote={}
// 		        	quote.action = 'Price Update'
// 		        	quote.ticker = responses[i].t
// 		        	quote.price = responses[i].l_cur
// 		        	if(quote.price[0] == '$'){
// 		        		quote.price = quote.price.slice( 1 );
// 		        	}
// 		        	quote.shares = 0
// 		        	quote.note  = '';
// 		        	quote.secid = data_object[quote.ticker];
// 		        	//quote.fdate=responses[i].lt_dts
// 		        	quote.sqldate = get_sql_date(new Date(responses[i].lt_dts))

// 		        	hash_list.push(quote);
// 		        	console.log(quote)
// 		        }
// 		        //insert_transactions(req, hash_list)
// 		        console.log('tic',tic)
// 		        req.db.query(queries.insert_transactions(hash_list), function(err, rows, fields){
// 					    if (err)  {
// 				 		  	console.log('1-NEW TRANS error: ' + err);
// 				      } else {

// 				      		//update_db_values(req,res,secid,'single');
// 									console.log('running rectify')
// 				      		rectify_security_table(req, res, secid_list);
// 				      		res.send({redirect: '/'});
// 				      }

// 				    });

// 		      }
// 		    });
// 		  });
// 		})

// });
//
//
//
router.get('/cleanup_this_security', function (req, res) {
		console.log('in cleanup_this_security')
		//console.log(SELECTED_SECURITY);
		var secid = SELECTED_SECURITY.id;
		var PU = 'Price Update';
		req.db.query(queries.get_max_transaction(secid), function(err, rows, fields){
 			if(err){ console.log(err)
 			}else{
				console.log('rows')
				console.log(rows)
				if(rows[0].transtype == PU){
						saveid  = rows[0].id;
				}else{
						saveid = 0;
				}
				req.db.query(queries.delete_price_updates(secid, saveid), function(err, rows, fields){
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
			}
		});
});
//
//
//
router.get('/admin', function (req, res) {

		res.render('admin', {
      	title : 'Tautoa: ADMIN',
      	message 	: req.flash('message')
    });
});
router.post('/change_portfolio', function (req, res) {

		console.log('in change portfolio')
		console.log(req.body);
		TAUTOA_DATABASE = req.body.database_sel;

		ALL_SECURITIES_BY_ID ={};
		ALL_SECURITIES_BY_NAME = {};
		SELECTED_SECURITY = {id:0,name:''}
		PORTFOLIO_TOTAL = 0
		connection = require('../config/database');
		connection.connect2database(TAUTOA_DATABASE)


		var render = function(err, result) {
			console.log('rendering index page')
			res.render('index', {
	      title : 'Tautoa: Home Page',

	      //securities : JSON.stringify(ALL_SECURITIES_BY_ID),
	      selected_securityID: 0,
	      databases	: databaseList,
	      database 	: TAUTOA_DATABASE,
	      types 		: typeList,
	      goals 		: goalList,
	      sectors 	: sectorList,
	      accounts 	: accountList,
	      actions 	: actionList,
	      groups 		: groupList,
	      active 		: ACTIVE,
      	secview   : SHOW_INFO,
	      message 	: req.flash('message')

	    });
		}

		async.parallel([ connection.get_sectors,
                    connection.get_types,
                    connection.get_goals,
                    connection.get_actions,
                    connection.get_accounts,
                    connection.get_groups ],
                    render
                  );
});
//
//
//
router.get('/backup_dump', function (req, res) {
		console.log('in backup')

		var dump_file = TAUTOA_DATABASE+'_'+today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate() +'.sql'
		var cmd = 'mysqldump '+TAUTOA_DATABASE+' > public/dump/'+dump_file
		console.log(dump_file)
		console.log(cmd)

		var exec = require('child_process').exec;
		exec(cmd, function callback(error, stdout, stderr){
    		if(error){console.log(error)}
    		else{
    			req.flash('message', 'Saved: '+dump_file);

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
                title : 'Tautoa: NOTES',
                message 	: '',
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
                title : 'Tautoa: NOTES',
                message 	: 'Saved!',
                data: txt
          });
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
		html += "<table border='1' id='security_table' class='table table-condensed sortable'>";
		html += "<thead>";
  	if(view == 'val'){
  		html += "<tr id=''><th>Ticker</th><th>Name</th><th>Price</th><th>Shares</th>"
  		html += "<th>Value</th><th>Yield</th><th></th></tr>";
		}else{
			html += "<tr id=''><th>Ticker</th><th>Name</th><th>Account</th><th>Sector</th>"
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
    		html += "<tr id='"+sortList[k].id+"'  onclick=\"view_transactions_ajax('"+sortList[k].id+"','"+sortList[k].name+"')\">";
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
          if(sortList[k].yield != 'N/A'){
            html += "<td class='nowrap_value'><div>"+parseFloat(sortList[k].yield)+"%</div></td>";
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
  	html += '<td>Date</td>';
  	html += '<td>Transaction</td>';
  	html += '<td>Price</td>';
  	html += '<td>Shares</td>';
  	html += '<td>CostofShares</td>';
  	html += '<td>SumofShares</td>';
  	html += '<td>Value</td>';
  	html += '<td></td>';
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
	    	 	return_obj.tot_value = 0
			    return_obj.tot_shares = 0
			    return_obj.invested = 0
			    return_obj.basis = 0
			    return_obj.profit = 0
			    return_obj.tot_return = 0
			    return_obj.ytd_return = 0
    			return_obj.held_for = 0
    			return_obj.pct_of_tot = 0
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

						last_year = today.getFullYear() - 1;
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
            field_list['yield'] = ALL_SECURITIES_BY_ID[secid].yield
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
		       		//res.redirect('/');
		  });
		}

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
				      	//req.flash('message', 'New transaction added');
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