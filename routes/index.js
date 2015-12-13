var express = require('express');
var router = express.Router();
var http = require('http')
var url = require('url');
var async = require('async');
var dateFormat = require('dateformat');
var now = new Date();
var queries = require('./queries');

router.get('/', function (req, res) {
  console.log('in index/home')
  console.log(SELECTED_SECURITY)

   	res.render('index', {
      title : 'Tautoa: Home Page',
      //total : portfolio_total,
      //securities : JSON.stringify(ALL_SECURITIES_BY_ID),
      selected_securityID: SELECTED_SECURITY.id,
      types 		: typeList,
      goals 		: goalList,
      sectors 	: sectorList,
      accounts 	: accountList,
      actions 	: actionList,
      groups 		: groupList,
      message 	: req.flash('message')

    });
	
});
//
//
//
// router.get('/initialize', function (req, res) {

	
// 	ALL_SECURITIES_BY_ID ={};
// 	ALL_SECURITIES_BY_NAME = {};
// 	SELECTED_SECURITY ={}
// 	portfolio_total = 0
// 	connection.db.query(queries.get_all_securities(), function(err, rows, fields){
// 			if(err){ console.log(err)
// 			}else{
// 				for (r in rows){
// 					ALL_SECURITIES_BY_ID[rows[r].id] = rows[r];
// 					ALL_SECURITIES_BY_NAME[rows[r].name] = rows[r];
// 					portfolio_total += parseFloat(rows[r].cur_value);
// 					if(r==0){
// 						SELECTED_SECURITY = rows[r];
// 					}
// 				}
// 			}
// 		});

// });
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
									      total : portfolio_total,
									      types :typeList,
									      goals :goalList,
									      sectors :sectorList,
									      accounts :accountList,
									      groups :groupList,
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
			      total : portfolio_total,
			      types :typeList,
			      goals :goalList,
			      sectors :sectorList,
			      accounts :accountList,
			      groups :groupList
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
	var kind  = req.params.kind;
	var new_group_code = []
	req.body.ticker = req.body.ticker.toUpperCase();
	group_string_list = req.body.group_code.split(',');
	for(i in  group_string_list){
		if(group_string_list[i]){
			new_group_code.push(group_string_list[i])
			if(groupList.indexOf(group_string_list[i]) == -1){
				//console.log('pushing '+group_string_list[i])
				groupList.push(group_string_list[i]);
			}
		}
	}
	req.body.group_code = new_group_code.join()
	console.log(req.body)
	params =['name','ticker','account','hide','type','goal','sector','group_code','notes'];
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
					fields[params[n]] = req.body[extras2[extras1.indexOf(params[n])] ] || 0
				}else{
					fields[params[n]] = req.body[params[n]] || 0
				}
		}
		q = queries.insert_security(fields)
	}else{
			secid = req.body.secid;
			for(n in params){
				fields[params[n]] = req.body[params[n]] 
			}
			q = queries.update_security(secid,fields)
	}
	req.db.query(q, function(err, rows, fields){
		    if (err)  {
	 		  	console.log('1-NEW/EDIT SEC error: ' + err);				 		  			 
	      } else {
					
	      	if(kind=='new'){
	      			newsecid = rows.insertId;
	      			//console.log(newsecid)
	      			//q2 = "INSERT into transactions (transtype,securityid,date,nav,shares)";
	      			//q2 += " VALUES('Initial','"+newsecid+"','"+init_date+"','"+init_price+"','"+init_shares+"')"
							//console.log(q2)
							req.db.query(queries.insert_transaction('Initial',newsecid,init_date,init_price,init_shares,""), function(err, rows, fields){
							    if (err)  {
						 		  	console.log('1-NEW/EDIT TRANS error: ' + err);				 		  			 
						      } else {
						      		//console.log(fields);
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
//
//
//
router.post('/view_securities', function (req, res) {
	var list_type = req.body.type
	var list_value = req.body.value
	var query,html;
	switch(list_type) {
    case 'goal':
        //code block
        query = queries.get_select_securities(list_type,list_value);
        break;
    case 'type':
        query = queries.get_select_securities(list_type,list_value);
        break;
    case 'sector':
        query = queries.get_select_securities(list_type,list_value);
        break;
    case 'group':
        query = queries.get_group_securities(list_type,list_value);
        break;
    case 'account':
        query = queries.get_select_securities(list_type,list_value);
        break;
    case 'hidden':
        query = queries.get_hidden_securities(list_type,list_value);
        break;
    default:
        query = queries.get_all_securities();
	}
	console.log(query);
	ALL_SECURITIES_BY_ID={}
	ALL_SECURITIES_BY_NAME={}
	html = '';
	group_total = 0
	req.db.query(query, function(err, rows, fields){
					    if (err)  {
				 		  	console.log('1-VIEW SECs error: ' + err);				 		  			 
				      } else {
				      		
				      		
				      	 	html += "<table border='1' id='security_table' class='table table-condensed sortable'>";
            			html += "<thead>";
                	html += "<tr id=''><th>Ticker</th><th>Name</th><th>Shares</th><th>Value</th><th>edit</th></tr>";
            			html += "</thead>";
            			html += "<tbody>";
            			
            			for (r in rows){
            				ALL_SECURITIES_BY_ID[rows[r].id] = rows[r];
										ALL_SECURITIES_BY_NAME[rows[r].name] = rows[r];
                		html += "<tr id='"+rows[r].id+"' class='clickable-row' onclick=\"view_transactions_ajax('"+rows[r].id+"','"+rows[r].name+"')\">";
                    html += "<td id='"+rows[r].ticker+"'>";
                    html += "    <a href='#' >";
                    html +=      rows[r].ticker
                    html += "    </a>";
                    html += "</td>";
                    html += "<td id='"+rows[r].name+"'>";
                    html += "    <a href='#' >";
                    html +=      rows[r].name
                    html += "    </a>";
                    //html += "<div id='"+rows[r].id+"'></div>";
                    html += "</td>";
                    html += "<td>"+parseFloat(rows[r].cur_shares).toFixed(3)+"</td>";
                    html += "<td>$"+parseFloat(rows[r].cur_value).formatMoney(2)+"</td>";
                    html += "<td halign='center' style='text-align:center'><a href='security_form/edit/"+rows[r].id+"' id='edit_image_id' >"
										html += "  <img src='images/edit.png' alt='alt' height='15' border='0'></a>"
                    html += "</td>";
                		html += "</tr> "; 
            			}
            			html += "</tbody>";
            			html += "</table>";

            			if(rows.length == 0){
            				first_id = 'none'
            				first_name = 'none'
            			}else{
            				first_id = rows[0].id
            				first_name = rows[0].name
            			}
            			req.db.query(queries.get_total(), function(err, trows, fields){
									    if (err)  {
								 		  	console.log('1-TOTs error: ' + err);				 		  			 
								      } else {
				      						portfolio_total = trows[0].total;
						
				      						res.json({
									    			'html':html,
									    			'query':query,
									    			'list_type':list_type,
									    			'list_value':list_value,
									    			'first_id':first_id,
									    			'first_name':first_name,
									    			'tot_value':portfolio_total
								  				});
								  		}
								  });
				      } // end } else {
	});

});

router.post('/view_transactions', function (req, res) {
	//console.log(req.body.secid)
	var secid = req.body.secid
	today = new Date(); 
	ytd_start_date = 0;
	ytd_start_nav=0;
	
	SELECTED_SECURITY = ALL_SECURITIES_BY_ID[secid];
	console.log('SELECTED_SECURITY')
	console.log(SELECTED_SECURITY)

	req.db.query(queries.get_transactions(secid), function(err, rows, fields){
					    if (err)  {
				 		  	console.log('1-ALL Trans error: ' + err);				 		  			 
				      } else {
        				   	//console.log(rows)
        				   	maxDate=0;
        				   	totShares=0;
        				   	sumofshares = 0;
        				   	var html='';
        				   	var tot_value=0;
        				   	var invested=0;
        				   	var basis=0;
        				   	var profit=0;
										var tot_return=0;
										var ytd_return=0;
										var avg_ann_return=0;
										var held_for=0; 
										      				   	
        				   	html += "<div id='transaction_table_div' style='height:300px;overflow:auto;'>"
        				   	html += "<table border='1' id='transaction_table' style=''>"
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
								    if(rows.length == 0){
								    	 	init_shares = 0;
								    	 	init_value  = 0;
								    	 	invested 		= 0;
								    	 	nav 				= 0;
								    	 	sumofshares = 0;
								    	 	held_for =0;
								    	 	init_date = 0;
								    }else{
											  //init_shares = parseFloat(rows[0].shares);
											  //init_value  = parseFloat(rows[0].nav) * parseFloat(rows[0].shares);

											  for(r in rows){
											    	date = rows[r].date
											    	
											    	jsdate = new Date(date)
											    	if(jsdate > maxDate){
											    		maxDate = jsdate
											    	}

											    	start_year = 0
											    	shares = rows[r].shares;
											    	
											    	nav = rows[r].nav;
											    	trans = rows[r].transtype
											    	costofshares = parseFloat(rows[r].nav) * parseFloat(rows[r].shares);
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
									    					trans == 'ST Capital Gains' ||
									    					trans == 'LT Capital Gains'

											    					){
															basis += costofshares;
														}		
											    	
											    	sumofshares += parseFloat(shares);
											    	value = sumofshares * nav;
											    	

											    	html += '<tr id='+rows[r].id+'>';
											    	html += '<td>'+date+'</td>';
											    	
											    	if(trans == 'NOTE'){
											    		html += "<td colspan='6'>NOTE: "+rows[r].note+'</td>';

											    	}else{
											    		html += '<td>'+trans+'</td>';
												    	html += '<td>$'+parseFloat(nav).toFixed(2)+'</td>';
												    	if(trans == 'Price Update' || trans.substring(0,8) == 'Year End'){
												    		html += '<td></td>';
												    		html += '<td></td>';
												    	}else{
												    		html += '<td>'+parseFloat(shares).toFixed(3)+'</td>';
												    		html += '<td>$'+costofshares.toFixed(2)+'</td>';
												    	}
												    	html += '<td>'+sumofshares.toFixed(3)+'</td>';
												    	html += '<td>$'+value.formatMoney(2)+'</td>';
												    }
											    	if( trans == 'Initial'){
											    		html += "<td></td>";
											    	}else{
												    	html += "<td halign='center' style='text-align:center'>";
												    	html += "<a href='#' class='edit_transaction' \
												    		onclick=\"edit_transaction('"+rows[r].id+"','"+trans+"','"+date+"','"+nav+"','"+shares+"')\">"
															//html += "<a href='' class='edit_transaction' >"
															html += "  <img src='images/edit.png' title='edit' alt='edit' height='15' border='0'  ></a>"
															html += "&nbsp;<a href='' id='del_timage_id' onclick=\"delete_transaction('"+secid+"','"+rows[r].id+"')\">"
															html += "  <img src='images/delete.png' title='delete' alt='delete' height='15' border='0'></a>"
															html += '</td>';	
														}													    	
											      

											    	html += '</tr>';
											  }
										}
										html += '<tr><td colspan="7">&nbsp;</td></tr>'
								    html += '</table>'
								    html += '</div>';
								    tot_value = sumofshares * nav;
								    totShares = sumofshares;
								    profit = tot_value - invested;
								    tot_return = (profit / Math.abs(invested))*100
								    if(ytd_start_nav){
								    	ytd_return = ((nav - ytd_start_nav)/ytd_start_nav)*100;
								  	}else{
								  		ytd_return = tot_return;
								  	}
								    console.log(ytd_return)
								    held_for = daydiff(init_date,today);
								    

								    res.json({
								    			'tot_value': tot_value.toFixed(2), 
								    			'tot_shares': sumofshares,
								    			'invested': invested.toFixed(2),
								    			'basis': basis.toFixed(2), 
								    			'profit': profit.toFixed(2),
								    			'tot_return': tot_return.toFixed(1),
								    			'ytd_return': ytd_return.toFixed(1),
								    			'held_for': held_for,
								    			'html': html
								  	});

								    //res.write(html);
										//...
										//response.end()
					   	} // end else

	});
	

});
router.post('/get_group_info', function (req, res) {
	var list_type = req.body.type
	var list_value = req.body.value
	var query,html;
	switch(list_type) {
    case 'goal':
        //code block
        query = queries.get_select_securities(list_type,list_value);
        break;
    case 'type':
        query = queries.get_select_securities(list_type,list_value);
        break;
    case 'sector':
        query = queries.get_select_securities(list_type,list_value);
        break;
    case 'group':
        query = queries.get_group_securities(list_type,list_value);
        break;
    case 'account':
        query = queries.get_select_securities(list_type,list_value);
        break;
    case 'hidden':
        query = queries.get_hidden_securities(list_type,list_value);
        break;
    default:
        query = queries.get_all_group_info();
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

      		rectify_security_table(req, [trans.secid]);
      		res.redirect('/');
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
      				res.redirect('/');
      			}
      		});
      }

    });
});
// NEEDS REFRESH
router.post('/delete_transaction', function (req, res) {
		console.log('in del trans')
		console.log(req.body);
		secid = req.body.secid;
		transid = req.body.transid;
		console.log(SELECTED_SECURITY)


		req.db.query(queries.delete_transaction(secid,transid), function(err, rows, fields){
	    if (err)  {
 		  	console.log('1-DEL TRANS error: ' + err);				 		  			 
      } else {
      		// update DB: securities
      		rectify_security_table(req, [secid]);
      		res.redirect('/');
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
//
//
// NEEDS REFRESH
router.post('/update_prices', function (req, res) {
		data_object = {};
		tics = [];
		secid_list =[]
		for(secid in ALL_SECURITIES_BY_ID){
 					ticker = ALL_SECURITIES_BY_ID[secid].ticker;
 					console.log(ticker)
 					if(ticker){
 						data_object[ticker] = secid;
 						tics.push(ticker)
 						secid_list.push(secid)
 					}
 					
		}
		

		//var tics = ['AAPL','CSCO','SYK'];
		var completed_requests = 0;
		
		options = {
			host: 'www.google.com',
			path: '/finance/info?client=ig&q='
		}
		base_path = options.path;
		var responses = {};
		tics.forEach(function(tic) {
		  
		  options.path = base_path+tic
		  
		  //console.log(options.path)
		  http.get(options, function(request) {
		    //res.setEncoding('utf8');
		    request.on('data', function(chunk){
		      //console.log(options.path)
		      //console.log('chunk:'+chunk)
		      if(chunk.toString().substring(0,10) != 'httpserver'){
		      		responses[data_object[tic]] = JSON.parse(chunk.toString().substring(3))[0];
		      }
		      
		    });

		    request.on('end', function(){
		      
		      if (completed_requests++ == tics.length - 1) {
		        // All downloads are completed
		        //console.log('body:', responses);
		        hash_list = []

		        for(i in responses){
		        	quote={}
		        	quote.action = 'Price Update'
		        	quote.ticker = responses[i].t
		        	quote.price = responses[i].l_cur
		        	if(quote.price[0] == '$'){
		        		quote.price = quote.price.slice( 1 );
		        	}
		        	quote.shares = 0
		        	quote.note  = '';
		        	quote.secid = data_object[quote.ticker];
		        	//quote.fdate=responses[i].lt_dts
		        	quote.sqldate = get_sql_date(new Date(responses[i].lt_dts))
		        	
		        	hash_list.push(quote);
		        	console.log(quote)
		        }
		        //insert_transactions(req, hash_list)
		        console.log('tic',tic)
		        req.db.query(queries.insert_transactions(hash_list), function(err, rows, fields){
					    if (err)  {
				 		  	console.log('1-NEW TRANS error: ' + err);				 		  			 
				      } else {

				      		//update_db_values(req,res,secid,'single');
									console.log('running rectify')
				      		rectify_security_table(req, secid_list);
				      		res.redirect('/');
				      }

				    });
 						
		      }      
		    });
		  });
		})

});

//
//
//
router.post('/get_updated_totals', function (req, res) {
		
		console.log('in update')
		get_update(req)

});
//
// /////////--FUNCTIONS--/////////////////////////////////////////
//
function get_update(req) {
	ALL_SECURITIES_BY_ID={};
		ALL_SECURITIES_BY_NAME={};
		req.db.query(queries.get_all_securities(), function(err, rows, fields){
			if(err){ console.log(err)
			}else{
				for (r in rows){
					ALL_SECURITIES_BY_ID[rows[r].id] = rows[r];
					ALL_SECURITIES_BY_NAME[rows[r].name] = rows[r];
				}
				req.db.query(queries.get_total(), function(err, rows, fields){
					if(err){ console.log(err)
					}else{
						portfolio_total = rows[0].total;
						//console.log(portfolio_total)
						res.json({	'tot_value' : rows[0].total }); 
						//console.log(portfolio_total)
					}
				});
			}
		});
}
//
////////////////////////////////////////////////////////////////////////////////
// TESTING TESTING
//  For ALL securities:
// function fullParallel(callbacks, last) {
//   var results = [];
//   var result_count = 0;
  
//   callbacks.forEach(function(callback, index) {
//     callback( function() {
//       console.log(arguments)
//       console.log(index)
//       console.log(Array.prototype.slice.call(arguments))
//       results[index] = Array.prototype.slice.call(arguments);
//       result_count++;
//       if(result_count == callbacks.length) {
//         //last(results);
//       }
//     });
//   });
// }
// // Example task
// function async1_get_sum_shares(req, secid, callback) {
//   req.db.query(queries.get_sum_shares(secid), function(err, rows1, fields){
// 		if (err)  {
// 		  	console.log('1-Update db trans error: ' + err);				 		  			 
//     } else {
// 				totshares = rows1[0].tot_shares;
// 				console.log('totalShares',totshares)
// 		}
// 	});
// }
// function async2_get_max_trans(req, secid, callback) {
//   	req.db.query(queries.get_max_transaction(secid), function(err, rows2, fields){
// 			    if (err)  {
// 		 		  	console.log('2-Update db trans error: ' + err);				 		  			 
// 		      } else {
// 		      	field_list = {}
// 		      	maxprice = rows2[0].nav;
// 		      	//console.log('maxprice '+maxprice)
// 		      	field_list['cur_price'] = maxprice;
// 		      	field_list['cur_shares'] = totshares;
// 		      	field_list['cur_value'] = totshares * maxprice;
// 		      	maxdate = rows2[0].date;
// 		      	field_list['cur_date'] = get_sql_date(new Date(maxdate));
// 		      	console.log('maxdate',maxdate);
// 		      }
// 		});
// }

// function finalupdate_security(results) { console.log('Donex', results); }

function rectify_security_table(req, secid_list) {
		
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
		}
		
		// http://book.mixu.net/node/ch7.html
		for(i in secid_list){
			secid=secid_list[i]
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




