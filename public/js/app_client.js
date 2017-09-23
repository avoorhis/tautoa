
var currentRow=0;
var rowHeight = 0;
var seq_row_count =0;
var scrollBy = 30;


//var now = new Date();

//now.format("YY-MM-dd");
//alert(now.format("yyyy-mm-dd"))
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
//
//

function ChangeCurrentRow() {  // only by arrow keys!

        table = document.getElementById("security_table");
        table_div = document.getElementById("security_list_div_id")
        rows = table.getElementsByTagName("tr");
        var tableRow = rows[currentRow];
        
        //table_div.scrollTop = rowHeight
 
        var secid = tableRow.id;
        var secname = tableRow.cells[1].id;
        hover(rows,secid);
        
        for(i = 0; i < rows.length; i++){
            
            rows[i].style.background = '#d9ffb3'; //'#fff';
            rows[i].style.fontStyle = 'normal';
        }
        //alert(tableRow.style.height)
       
        tableRow.style.background = "lightgreen";
        tableRow.style.fontStyle = 'italic'
        view_transactions_ajax(secid);
}
//
//
//
function hover(rows,secid){
	for(i = 0; i < rows.length; i++){
		
		rows[i].onmouseover = function() {
					       this.style.backgroundColor = "lightgrey";
					    }
		rows[i].onmouseout = function() {
				if(this.id==secid){
					      this.style.backgroundColor = "lightgreen"; 
					      this.style.fontStyle = 'italic' 
				}else{
					this.style.backgroundColor = "#d9ffb3"; 
					this.style.fontStyle = 'normal'
				}
		}
	}
}
document.onkeydown = function(e) {
    e = e || window.event;
    table_div = document.getElementById("security_list_div_id")
    
    switch(e.which || e.keyCode) {
				case 37: // left
        	break;

        case 38: // up
	        if( currentRow == 1){
	        	currentRow = sec_row_count;
	        	rowHeight = 1000
	        }else{
	        	currentRow--;
	        	rowHeight -= scrollBy
	        }
	        ChangeCurrentRow();
	        break;

        case 39: // right
        	break;

        case 40: // down
	        if( currentRow == sec_row_count){
		      	currentRow = 1;
		        rowHeight = 0
		      }else{
		      	currentRow++;
		        rowHeight += scrollBy
		      }
		      //alert(sec_row_count)
	        ChangeCurrentRow();
	        break;

        default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
};    	
var cleanup = document.getElementById('cleanup') || null;
var cleanupall = document.getElementById('cleanup_all') || null;
if (cleanup !== null) {
  cleanup.addEventListener('click', function () {
    //alert('clean')
    cleanup_updates('this_sec');
  });
};
if (cleanupall !== null) {
  cleanupall.addEventListener('click', function () {
    //alert('clean')
    cleanup_updates('all');
  });
};
var trans_ok_btn = document.getElementById('save_trans_btn') || null;
if (trans_ok_btn !== null) {
  trans_ok_btn.addEventListener('click', function () {
    //clear_tform();
    save_transaction();
  });
};

var update_prices = document.getElementById('update_prices') || null;
if (update_prices !== null) {
  update_prices.addEventListener('click', function () {
    
    update_all_prices();
  });
};
var reset_btn = document.getElementById('reset_btn') || null;
if (reset_btn !== null) {
  reset_btn.addEventListener('click', function () {
    //alert('1')
    selects = document.getElementsByClassName('cat_select')
    document.getElementById('alert_flash_message_id').innerHTML = ''
    for(i in selects){
    	selects[i].value = 'none'
    }
   //alert(view)
    source = 'reset_btn'
    //get_security_list('all','default',active, view,'',source);
    update_filter('all','all',active,view,'',source)
    	
    

  });
};

var view_hidden = document.getElementById('view_hidden_btn') || null;
if (view_hidden !== null) {
  view_hidden.addEventListener('click', function () {
    //alert('1')
    selects = document.getElementsByClassName('cat_select')
    for(i in selects){
    	selects[i].value = 'none'
    }
    //alert(active)
    if(active == '0'){
    	active = '1'
    	//get_security_list('all','default',active, view,'','view_hidden_1');
    	update_filter('all','all',active, view,'','view_hidden_1')
    	
    }else{
    	active = '0'
    	//get_security_list('hidden','hidden',active, view,'','view_hidden_0');
    	update_filter('hidden','hidden',active, view,'','view_hidden_0')
    	
    }
    
  });
};
var save_sec_btn = document.getElementById('save_sec_btn_id') || null;
if (save_sec_btn !== null) {
  save_sec_btn.addEventListener('click', function () {
    save_security_validation();
  });
};

function add_to_groups(val){
	target = document.getElementById('groupsTextInput')
	current_val = target.value.trim();
	if(current_val){
		new_val = current_val +','+val;
	}else{
			new_val = val;
	}
	target.value = new_val;
}
//
//
//
//
function cleanup_updates(fxn){
		//alert(fxn)
		// if(fxn == 'all'){
// 		    target = '/cleanup_all'
// 		}else{
// 		    target = '/cleanup_this_security'
// 		}
		target = '/cleanup/'+fxn
		var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", target, true);

	    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        xmlhttp.onreadystatechange = function() {

		    if (xmlhttp.readyState == 4 ) {
					//alert('post ajax')
					var data = JSON.parse(xmlhttp.responseText);
					document.getElementById('transaction_list_div_id').innerHTML = data.html
					//alert(data)
					
					//alert(currentRow)
					var objDiv = document.getElementById("transaction_table_div");
					objDiv.scrollTop = objDiv.scrollHeight;
					
		    }
        };
        xmlhttp.send();
}
function view_transactions_ajax( secid ){
	
    //alert('XX')
    $transPop.hide();
    document.getElementById('transaction_list_div_id').innerHTML = ''
		document.getElementById('sec_name_div_id').innerHTML = ''
		table = document.getElementById("security_table")
		transrows = table.getElementsByTagName("tr");
		hover(transrows,secid)
		var args  = 'secid='+secid;
		
		var xmlhttp = new XMLHttpRequest();
		
    xmlhttp.open("POST", "/view_transactions", true);

	  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function() {

		    if (xmlhttp.readyState == 4 ) {
					var data = JSON.parse(xmlhttp.responseText);
					//alert(data)
					document.getElementById('transaction_list_div_id').innerHTML = data.html
					
					document.getElementById('tot_value').innerHTML       	= '$'+parseFloat(data.stats.tot_value).formatMoney(2);
					document.getElementById('invested').innerHTML        	= '$'+parseFloat(data.stats.invested).formatMoney(2);
					document.getElementById('basis').innerHTML        		= '$'+parseFloat(data.stats.basis).formatMoney(2);
					document.getElementById('profit').innerHTML        		= '$'+parseFloat(data.stats.profit).formatMoney(2);
					document.getElementById('tot_return').innerHTML       = data.stats.tot_return.toFixed(1)+'%';
					document.getElementById('ytd_return').innerHTML       = data.stats.ytd_return.toFixed(1)+'%';
					document.getElementById('avg_ann_return').innerHTML   = (data.stats.tot_return/(data.stats.held_for/(365))).toFixed(1) +'%';
					document.getElementById('pct_of_total').innerHTML     = data.stats.pct_of_tot.toFixed(1)+'%';
					if(group_total){
						//alert(group_total)
						document.getElementById('pct_of_gtotal').innerHTML    = ((data.stats.tot_value/group_total)*100).toFixed(1)+'%';
					}else{
						document.getElementById('pct_of_gtotal').innerHTML    = '0.0%'
					}
					if(data.stats.held_for > 365){
						document.getElementById('held_for').innerHTML       = (data.stats.held_for/365).toFixed(1)+' yrs';
					}else{	
						document.getElementById('held_for').innerHTML      	= (data.stats.held_for/(365 / 12)).toFixed(1)+' mos';
					}
					
					//hover(rows,secid)
					//ticker = ''
					//secname = ''
					sec_row_count = transrows.length -1;
					for(i = 0; i < transrows.length; i++){
		 	        transrows[i].style.background = 'white';
                        transrows[i].style.fontStyle = 'normal'
                        if(transrows[i].id == secid){
                            currentRow = i;
                            rowHeight = i * scrollBy;
                        //	ticker = rows[i].cells[0].id;
                        //	secname = rows[i].cells[1].id;
                        }
		 			}

		 			if(secid){
			 			document.getElementById('sec_ticker_id').innerHTML  = data.sec.ticker;
			 			infoline = '('+data.sec.ticker+') '+data.sec.name
			 			infoline += " <div class='pull-right'>Account: "+data.sec.account+"&nbsp;&nbsp;&nbsp;(id="+secid+")</div>";
			 			document.getElementById('sec_name_div_id').innerHTML 	= infoline;
			 			document.getElementById('tcurrent_name').innerHTML  = '('+data.sec.ticker+')<br>'+data.sec.name;
			 			document.getElementById('tcurrent_name').value  = secid;
			 			//document.getElementById('totshares').value  = data.tot_shares;
						
						
						var objDiv = document.getElementById("transaction_table_div");
						objDiv.scrollTop = objDiv.scrollHeight;
						rows = table.getElementsByTagName("tr");
						for(i = 0; i < rows.length; i++){            
                            rows[i].style.background = '#d9ffb3'; //'#fff';
                            rows[i].style.fontStyle = 'normal';
                        }
                        document.getElementById(secid).style.background = 'lightgreen'
						document.getElementById(secid).style.fontStyle = 'italic'
						document.getElementById('security_list_div_id').scrollTop = rowHeight - scrollBy;
						
					}
					//alert(currentRow)
					document.getElementById('loading_info_div').style.visibility = 'hidden'

		    }
    };
    xmlhttp.send(args);
	
}

function update_filter(list_type, value, active, view, secid, source){
    var args  = 'type='+list_type;
    args += '&value='+value;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "/update_filter", true);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 ) {
            var data = JSON.parse(xmlhttp.responseText);
            
            get_security_list(data.type,data.value,active,view,secid,list_type)
        }
    }
    xmlhttp.send(args);
    
}
function get_security_list(list_type, list_value, active, view, secid, source ){
		//alert(source)
		// listType is default,goals,sectors,groups,types
		//alert(view)
		document.getElementById('loading_info_div').style.visibility = 'visible'
		if(active=='0'){
			document.getElementById('view_hidden_btn').innerHTML = 'View Regular'
			document.getElementById('hidden_notification').innerHTML = '(archived)'
		}else{
			document.getElementById('view_hidden_btn').innerHTML = 'View Inactive'
			document.getElementById('hidden_notification').innerHTML = ''
		}
		
		selects = document.getElementsByClassName('cat_select')
		//$transPop.hide();
    for(i in selects){
    	selects[i].value = 'none'
    }
    if(list_type != 'default' && list_type != 'hidden' && list_type != 'all' ){
    	document.getElementById(list_type).value = list_value;
  	}
    //var args  //= 'type='+list_type;
    
    //var args = 'value='+list_value;
    var args = 'active='+active;
    args += '&view='+view;
    args += '&source='+source;
    //alert(args)
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "/view_securities", true);

	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function() {
    	if (xmlhttp.readyState == 4 ) {
            var data = JSON.parse(xmlhttp.responseText);
            //alert(secid)
            document.getElementById('security_list_div_id').innerHTML = data.html
            document.getElementById('security_info_div_id').innerHTML = data.query
            document.getElementById('port_total_span').innerHTML = '$'+parseFloat(data.tot_value).formatMoney(2);
            if(!secid){
                secid = data.first_id
                secname = data.first_name
            }
            //alert(secid)
            // secid will be 0 if no securities found
            //if(data.stats.sec_count > 0)

            view_transactions_ajax(secid);
            group_total = data.stats.tot_value
            document.getElementById('sec_group_id').innerHTML     = list_type +'::'+list_value;
            document.getElementById('gtot_value').innerHTML       = '$'+parseFloat(data.stats.tot_value).formatMoney(2);
            // save data.stats.tot_value
            document.getElementById('ginvested').innerHTML        = '$'+parseFloat(data.stats.invested).formatMoney(2);
            document.getElementById('gbasis').innerHTML        		= '$'+parseFloat(data.stats.basis).formatMoney(2);
            document.getElementById('gprofit').innerHTML        	= '$'+parseFloat(data.stats.profit).formatMoney(2);
            document.getElementById('sec_count').innerHTML 		    = data.stats.sec_count
            document.getElementById('gtot_return').innerHTML      = data.stats.tot_return.toFixed(1)+'%';
            document.getElementById('gpct_of_tot').innerHTML      = data.stats.pct_of_tot.toFixed(1)+'%';
            $('[data-toggle="tooltip"]').tooltip(); 
            document.getElementById('security_list_div_id').style.background = '#d9ffb3'; 
            document.getElementById("security_table").style.background = '#d9ffb3';
		}
//             table = document.getElementById("security_table");
//                 rows = table.getElementsByTagName("tr");
//                 for(i = 0; i < rows.length; i++){
//                     rows[i].style.background = '#d9ffb3'; //'#fff';
//                     rows[i].style.fontStyle = 'normal';
//                 }
    };
    xmlhttp.send(args);
    

}

function get_group_info(list_type, list_value){

		var args  = 'type='+list_type;
		args += '&value='+list_value;
		var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "/get_group_info", true);

	  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function() {
    		if (xmlhttp.readyState == 4 ) {
					var data = JSON.parse(xmlhttp.responseText);
					//alert(data)
					document.getElementById('gtot_value').innerHTML = parseFloat(data.tot_value).formatMoney(2);
					//document.getElementById('security_info_div_id').innerHTML = data.query

					//document.getElementById('security_list_div_id').scrollTop = 0;
					
				}
    };
    xmlhttp.send(args);

};
function save_transaction(){
		//alert('in savet')
		form = document.getElementById('new_trans_form_id')
    secid = document.getElementById('tcurrent_name').value;
    var tprice = document.getElementById('tprice').value
  	var tshares = document.getElementById('tshares').value
  	var tvalue = document.getElementById('tvalue').value
  	var ttype = document.getElementById('ttype').value;
  	if( isNumber(tprice) && isNumber(tshares) ){
			// OKAY
		}else if(isNumber(tvalue) && isNumber(tshares) ){
			//okay
		}else if(isNumber(tvalue) && isNumber(tprice) ){
			//okay
		}else{
			alert('Incomplete values for: tprice, tshares, and/or tvalue')
  		return;
    }
    //alert(secid)
    var input1 = document.createElement('input');
    input1.type = 'hidden';
    input1.name = 'tsecid';
    input1.value = secid;
    form.appendChild(input1);

		var input2 = document.createElement('input');
    input2.type = 'hidden';
    input2.name = 'ttype'; // new or edit
    input2.value = ttype;
    form.appendChild(input2);
    
    form.submit();
    //$transPop.hide();
    clear_tform();
}
//
//
//
function save_security_validation(){
		form = document.getElementById('sec_form_id')
    var secname = document.getElementById('inputName').value
    var kind = document.getElementById('kind').value
    if(!secname){
    	alert('no secname')
    	return;
    }
    //alert(kind)
    if(kind == 'new'){
    	var iprice = document.getElementsByName('init_price')[0].value
    	var ishares = document.getElementsByName('init_shares')[0].value
    	var ivalue = document.getElementsByName('init_value')[0].value
    	if( isNumber(iprice) && isNumber(ishares) ){
				// OKAY
			}else if(isNumber(ivalue) && isNumber(ishares) ){
				//okay
			}else if(isNumber(ivalue) && isNumber(iprice) ){
				//okay
			}else{
				alert('no adequate initials: price, shares, and/or value')
    		return;
	    }
	  }
    //alert(document.getElementsByName('name')[0].value)
    form.submit()
}
//
function edit_transaction(transid, action, date, price, shares){
		//alert(action+' - '+date+' - '+price+' - '+shares);
		//$owner = $(this);
    //ß$('input[value="' + $owner.text() + '"]').attr('checked', true);
    document.getElementById('actionsSelect').value = action;
		document.getElementById('inputDate').value = date;
		document.getElementById('tprice').value = parseFloat(price).toFixed(2);
		document.getElementById('tshares').value = parseFloat(shares).toFixed(3);
		value = price*shares;
		document.getElementById('tvalue').value = parseFloat(value).toFixed(2);
		document.getElementById('ttype').innerHTML = 'Edit';
		document.getElementById('ttype').value = 'edit';
		document.getElementById('tid').value = transid;
		$transPop.show();
		
}
function delete_security(secid){
		// id
		ans = confirm('are you sure? (y/N)');
		if(ans){
			var args = '&secid='+secid;
			var xmlhttp = new XMLHttpRequest();
	    xmlhttp.open("POST", "/delete_security", true);

		  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	    xmlhttp.onreadystatechange = function() {
	    		if (xmlhttp.readyState == 4 ) {
	    			var data = JSON.parse(xmlhttp.responseText);
						window.location = data.redirect;
						
						
					}
	    };
	    xmlhttp.send(args);
	}
}
function delete_transaction(transid){
	clear_tform();
	ans = confirm('Are you sure?')
	
	if(ans){
			var args  = 'transid='+transid;
			//args += '&secid='+secid;
			//alert(args)
			var xmlhttp = new XMLHttpRequest();
	    xmlhttp.open("POST", "/delete_transaction", true);

		  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	    xmlhttp.onreadystatechange = function() {
	    		if (xmlhttp.readyState == 4 ) {
						var data = JSON.parse(xmlhttp.responseText);
						window.location = data.redirect;
						
					}
	    };
	    xmlhttp.send(args);
	}
}
//
//
//
function apply(kind,value){
	document.getElementById(kind).value = value;
}
	
//
//
//
function clear_tform(){
		
		$transPop.hide();
		var d = new Date();
		//var sqldate = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate() ;
		var sqldate = dateFormat(d, "yyyy-mm-dd") ;
  	document.getElementById('actionsSelect').value = 'Choose...';
		document.getElementById('inputDate').value = sqldate;
		document.getElementById('tprice').value = '';
		document.getElementById('tshares').value = '';
		document.getElementById('tvalue').value = '';
		document.getElementById('tnote').value = '';
		document.getElementById('ttype').innerHTML = '';
		document.getElementById('ttype').value = '';
		document.getElementById('tid').value = '';
}
//
//
function update_all_prices(){
	var xmlhttp = new XMLHttpRequest();
	    xmlhttp.open("POST", "/update_prices", true);

		  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	    xmlhttp.onreadystatechange = function() {
	    		if (xmlhttp.readyState == 4 ) {
						var data = JSON.parse(xmlhttp.responseText);
						window.location = data.redirect;
						//alert(data)
						//document.getElementById('gtot_value').innerHTML = parseFloat(data.tot_value).formatMoney(2);
						//document.getElementById('security_info_div_id').innerHTML = data.query

						//document.getElementById('security_list_div_id').scrollTop = 0;
						
					}
	    };
	    xmlhttp.send();

}
//
//
//
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
//
//
//
function change_secview(view){
	
	//get_security_list('default','default',hide, view,'');
	
	var args  = 'view='+view;
	
	var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "/change_secview", true);

	  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function() {
    		if (xmlhttp.readyState == 4 ) {
					var data = JSON.parse(xmlhttp.responseText);
					//alert(data.ssid)
					document.getElementById('security_list_div_id').innerHTML = data.html
					document.getElementById(data.ssid).style.background = 'lightgreen'
					document.getElementById(data.ssid).style.fontStyle = 'italic'
					document.getElementById('security_list_div_id').scrollTop = rowHeight - scrollBy;
				}
		};
	  xmlhttp.send(args);

}
var $owner = undefined;
//var $transPop = $('#select_new_transaction');
var $transPop = $('#transaction_form');

// $('.edit_transaction').on('click', function() {
//     alert('edit t')
//     $owner = $(this);
//     $('input[value="' + $owner.text() + '"]').attr('checked', true);
//     $transPop.show();
// });
$('#new_transaction').on('click', function() {
    $owner = $(this);
    $('input[value="' + $owner.text() + '"]').attr('checked', true);
    clear_tform();
    document.getElementById('ttype').innerHTML = 'New';
		document.getElementById('ttype').value = 'new';

    $transPop.show();
});


// $('input[type=radio]').on('click', function() {
//     $owner.text($(this).val());
//     $ratingPop.hide();
// });

