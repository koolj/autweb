/*
Created by koolj@
Oct 22, 2021.
*/

var sockhost = '';
var roothost = '';

//var apiroot = apiroot;
let ipport = "";
var apiroot = ipport + "/api";
roothost =  ipport;
sockhost = ipport;


function gethttpapi(url, dataget){
	var settings = {
	  "async": true,
	  "crossDomain": true,
	  "url": url,
	  "method": "GET",
	  "headers": {
		"Content-Type": "application/json",
	  },
	  "data": dataget
	}
	$.ajax(settings).done(function (response) {
		//console.log(response);
		if(response.rep.result == "0"){
            apiroot = response.rep.message + "api";
            sockhost = response.rep.message + "";
			roothost = response.rep.message + "";
			console.log(roothost);
			console.log(apiroot);
		}
		else{
			//alert(response.rep.message);
		}
	});

};
//gethttpapi(apiroot + "/apilink?api=auto",{});

function isOdd(num) { return num % 2;}

function disAll(){
	$('#loginview').hide();
	$('#borrow').hide();
	$('#lend').hide();
	$('#ob').hide();
	$('#yourwallet').hide();
	$('#helpview').hide();
	$('#biztoken').hide();
	$('#qrpay').hide();
	$('#dohcoin').hide();
	
	$('#linklogout').hide();
	$('#linklogin').show();
}
function disAlllogged(){
	$('#loginview').hide();
	$('#borrow').hide();
	$('#lend').hide();
	$('#ob').hide();
	$('#yourwallet').hide();
	$('#helpview').hide();
	$('#biztoken').hide();
	$('#qrpay').hide();
	$('#dohcoin').hide();

	$('#linklogin').hide();
	$('#linklogout').show();
}

function displaySideNav(){
}
displaySideNav();

$("#droptest1menu a").on('click', function(e) {
	e.preventDefault(); // cancel the link behaviour
	var selText = $(this).text();
	$("#droptest1").text(selText);
});

function viewUD(){
	//viewDash();
	$('#borrow').show();
	startloading();
	var url = apiroot+"/listitem";
	var jsonvar =  `{}`;
	currentget = 1;
	gethttp(url, jsonvar, currentget);
		
	closeNav();
}

function buyrec(){
	$('#lendrec').empty();
	if(currenthis && currenthis.indexOf("\n") != -1)
		currenthis.split("\n").forEach(function (item) {
			if(item != "undefined")
				$('#lendrec').append(item + "<br>");
		});
}

function viewOB(){
	//viewDash();
	$('#ob').show();
	//buyrec();
	startloading();
	currentget = 2
	var url = apiroot+"/listitem";
	var jsonvar =  `{}`;

	gethttp(url, jsonvar, currentget);
		
	closeNav();
}
function viewShopping(){
	//viewDash();
	$('#lend').show();
	buyrec();
	startloading();
	currentget = 2
	var url = apiroot+"/listitem";
	var jsonvar =  `{}`;

	gethttp(url, jsonvar, currentget);
		
	closeNav();
}

function viewWallet(){
	//viewDash();
	$('#yourwallet').show();
	console.log(currentearn);
	$('#userearn').text( currentearn+ " VND");
	currentget = 1
	stoploading();
}

function viewLogin(){
	//startloading();
	disAll();
	$('#linklogin').show();
	$('#loginview').show();
	console.log("------------------");
}
var myfilebase64 = "";
function editItem(obj){
	//console.log(obj);
	$('#itemname').val(obj.itemname);
	$('#itemvol').val(obj.itemvol);
	$('#itemprice').val(obj.itemprice);
	$('#itemid').val(obj._id);
	$("#previewImg").empty();
	htmlimg = `
	<img id="iddocsource" src="`+ obj.img +`" style="width: 350px" class="img-thumbnail" alt="c1"/>
	`;
	$("#previewImg").append(htmlimg);
	myfilebase64 = obj.img;
};
/*
	var htmltopbag = `
	<table><tbody>
	`;
	$("#mybag").append(htmltopbag);
*/
var currentamount = 0;
var currentorderitem = "";
var itemobj = "";
var htmlbodybag = ``;
var myItemArr = [];
function remitemBag(id){
	//localStorage.removeItem(id);
	//localStorage.removeItem(id+"price");

	for (key in localStorage) {
		if (key.indexOf(id) != -1) {
		  localStorage.removeItem(key);
		}
	}

	if(confirm("Are you sure to delete?")){
		$("#mybag").empty();
		$("#subtotal").text("0");
		currentamount = 0;
		if(myItemArr.length > 0)
			for(var i =0; i < myItemArr.length; i++){
				if(myItemArr[i] != id){
					htmlbodybag = getLocalValue(myItemArr[i]);
					$("#mybag").append(htmlbodybag);
					currentamount = currentamount + Number(getLocalValue(myItemArr[i]+"price"));
					$("#subtotal").text("Total: "+currentamount);


				}

			}
		for (key in localStorage) {
			if (key.indexOf("@") != -1) {
				itemobj = itemobj + "#" + localStorage.key;
				currentorderitem = currentorderitem + "..." + localStorage.getItem(key);
			}
		}	
		console.log(itemobj);
		console.log("------------------------");
		console.log(currentorderitem);
	}
    else{
        return false;
    }

}
localStorage.clear();
function createLocalValue(item,data) {
	localStorage.setItem(item, data); 
} 
function getLocalValue(item) {
	return localStorage.getItem(item);  
}

function toBag(obj){
	//console.log($("#mybag").length());
	if(!Number($('#input'+obj.itemvol).val()))
		alert("Amount should be >0!")
	else{	
		var currnum = 0;
		var singleamount = 0;
		singleamount = (obj.itemprice * Number($('#input'+obj.itemvol).val()));
		for (key in localStorage) {
			if (key.indexOf(obj.itemvol) != -1) {
				if (key.indexOf("price") != -1)
					singleamount = singleamount + Number(getLocalValue(key));
				if (key.indexOf("vol") != -1)
					currnum = currnum + Number(getLocalValue(key));

				for (key in localStorage) {
					if (key.indexOf(obj.itemvol) != -1) {
						localStorage.removeItem(key);
					}
				}
			}
		}
		if(currnum == 0)
			currnum = $('#input'+obj.itemvol).val();
		
		htmlbodybag = `
		<div class="d-flex justify-content-left" style="padding-bottom: 6px" id="`+obj.itemvol+$('#input'+obj.itemvol).val()+`">
				<a>`+obj.itemname+`&nbsp;&nbsp;&nbsp;</a>
				<a >`+currnum+`&nbsp;&nbsp;&nbsp;</a>
				<a >`+obj.itemprice+`&nbsp;&nbsp;&nbsp;</a>
				<a >`+singleamount+`&nbsp;&nbsp;&nbsp;</a>
				<button id="order" name="x" class="btn btn-info" onclick="remitemBag('`+obj.itemvol+$('#input'+obj.itemvol).val()+`');">Remove</button>
		</div>
		`;
		createLocalValue(obj.itemvol+$('#input'+obj.itemvol).val(),htmlbodybag);
		createLocalValue(obj.itemvol+$('#input'+obj.itemvol).val()+"price",singleamount);
		createLocalValue(obj.itemvol+$('#input'+obj.itemvol).val()+"vol",Number($('#input'+obj.itemvol).val()));
		createLocalValue(obj.itemvol + "@" + Number($('#input'+obj.itemvol).val()),obj.itemname + "-" + Number($('#input'+obj.itemvol).val())+ "-" + singleamount);

		currentamount = 0;
		myItemArr = [];
		currentorderitem = "";
		itemobj = "";
		for(var i =0; i < localStorage.length; i++){
			var mykey = localStorage.key(i);
			var myval = localStorage.getItem(localStorage.key(i));
			if(mykey.indexOf("price") != -1){
				myItemArr.push(mykey);
				currentamount = currentamount + Number(myval);
			}
			
			if(mykey.indexOf("@") != -1){
				itemobj = itemobj + "#" + mykey; 
				currentorderitem = currentorderitem + "..." + myval;
			}	
		}

		//myItemArr.push(obj.itemvol+$('#input'+obj.itemvol).val());
		//currentamount = currentamount + singleamount;
		//currentorderitem = currentorderitem + "..." + obj.itemname + "-" + Number($('#input'+obj.itemvol).val())+ "-" + singleamount + "...Tong: "+currentamount
		//itemobj = itemobj + "#" + obj.itemvol + "@" + Number($('#input'+obj.itemvol).val());


		$("#subtotal").text("Total: "+currentamount);
		$("#mybag").append(htmlbodybag);

	}
};
function deleteItem(id){
	if(confirm("Are you sure to delete?")){
		startloading();
		var url = apiroot+"/revitem";
		var jsonvar =  `{"tokenkey\":\"` 
		+ currentGtoken 
		+`","itemid\":\"` 
		+ id
		+`","email\":\"` 
		+ currentacc
		+ `\"}`;
		currentpost = 6; //remove item
		posthttp(url, jsonvar, currentpost);
		closeNav();
    }
    else{
        return false;
    }
}
function makePay(id){
	if(confirm("Are you sure to make payment?")){
		startloading();
		var url = apiroot+"/order";
		var jsonvar =  `{"tokenkey\":\"` 
		+ currentGtoken 
		+`","email\":\"` 
		+ currentacc
		+`","amount\":\"` 
		+ currentamount
		+`","val\":\"` 
		+ currentorderitem
		+`","items\":\"` 
		+ itemobj
		+ `\"}`;
		currentpost = 8; //order
		localStorage.clear();
		posthttp(url, jsonvar, currentpost);
			
		closeNav();
    }
    else{
        return false;
    }
}
function buildItemList(tohtml, myarr){
	let htmltop = `
	<table>
			  <thead>
				  <tr>
					  <th>
						  &nbsp;
					  </th>
					  <th class="token-cell">
						<div class="symbol-icon-container">
							<div class="centered">
							<a href="#">Avail</a>
							</div>
						</div>
					  </th>
					  <th>
						&nbsp;
					  </th>

					  <th class="token-cell">
						  <div class="symbol-icon-container">
							  <div class="centered">
							  <a href="#">Price</a>
							  </div>
						  </div>
					  </th>
					  <th>
						  &nbsp;
					  </th>
					  <th>
						&nbsp;
					</th>
		  
				  </tr>
			  </thead>
			  <tbody>
	`;
	let htmlbottom = `
	</tbody>
	</table>  
	`;
	$(tohtml).empty();
	$(tohtml).append(htmltop);
	for(i=0; i< myarr.length ;i++){
		var obj = myarr[i].doc;
		var htmlbody = `
		<tr>
					<td>
						<div class="symbol-cell">
							<div class="symbol-content">   
								<div class="centered">
									<a href="#"><img class="icon" src="`+myarr[i].doc.img+`" alt="rau" style="width: 150px;"></a>
								</div>
							</div>
						</div>
					</td>
					<td>
					<div class="symbol-cell">
						<div class="symbol-content">   
							<div class="left">
								<a>`+myarr[i].doc.itemname+`</a>
							</div>
						</div>
					</div>
					</td>
					<td>
					<div class="symbol-cell">
						<div class="symbol-content">   
							<div class="centered">
								<a>`+myarr[i].doc.itemvol+`</a>
							</div>
						</div>
					</div>
					</td>
					
					<td>
						<div class="symbol-cell">
							<div class="symbol-content">   
								<div class="centered">
									<a >`+myarr[i].doc.itemprice+`</a>
								</div>
							</div>
						</div>
					</td>
					<td>
						<div class="symbol-cell">
							<div class="symbol-content">   
								<div class="centered">
									<button id="edit`+myarr[i].doc._id+`" name="x" class="btn btn-info" onclick="editItem({`
									+`itemname:'`+myarr[i].doc.itemname
									+`',itemvol:'`+myarr[i].doc.itemvol
									+`',itemprice:'`+myarr[i].doc.itemprice
									+`',_id:'`+myarr[i].doc._id
									+`',img:'`+myarr[i].doc.img
									+`'});">Edit</button>
								</div>
							</div>
						</div>
					</td>
					<td>
					<div class="symbol-cell">
						<div class="symbol-content">   
							<div class="centered">
								<button id="del`+myarr[i].doc._id+`" name="x" class="btn btn-info" onclick="deleteItem('`+myarr[i].doc._id+`');">Delete</button>
							</div>
						</div>
					</div>
				</td>
				</tr>
		`;

		$(tohtml + " tr:last").after(htmlbody);
	};
}
function buildItemShop(tohtml, myarr){
	let htmltop = `
	<table>
			  <thead>
				  <tr>
					  <th>
						  &nbsp;
					  </th>
					  <th class="token-cell">
						<div class="symbol-icon-container">
							<div class="centered">
							<a href="#">Avail</a>
							</div>
						</div>
					  </th>
					  <th>
						&nbsp;
					  </th>

					  <th class="token-cell">
						  <div class="symbol-icon-container">
							  <div class="centered">
							  <a href="#">Price</a>
							  </div>
						  </div>
					  </th>
					  <th>
						  &nbsp;
					  </th>
					  <th>
						&nbsp;
					</th>
		  
				  </tr>
			  </thead>
			  <tbody>
	`;
	let htmlbottom = `
	</tbody>
	</table>  
	`;
	$(tohtml).empty();
	$(tohtml).append(htmltop);
	for(i=0; i< myarr.length ;i++){
		var htmlbody = `
		<tr>
					<td>
						<div class="symbol-cell">
							<div class="symbol-content">   
								<div class="centered">
									<a href="#"><img class="icon" src="`+myarr[i].doc.img+`" alt="rau" style="width: 150px;"></a>
								</div>
							</div>
						</div>
					</td>
					<td>
					<div class="symbol-cell">
						<div class="symbol-content">   
							<div class="left">
								<a>`+myarr[i].doc.itemname+`</a>
							</div>
						</div>
					</div>
					</td>
					<td>
					<div class="symbol-cell">
						<div class="symbol-content">   
							<div class="centered">
								<a>`+myarr[i].doc.itemvol+`</a>
							</div>
						</div>
					</div>
					</td>
					
					<td>
						<div class="symbol-cell">
							<div class="symbol-content">   
								<div class="centered">
									<a >`+myarr[i].doc.itemprice+`</a>
								</div>
							</div>
						</div>
					</td>
					<td>
						<div class="symbol-cell">
							<div class="symbol-content">   
								<div class="centered">
									<input type="itemin" id="input`+myarr[i].doc._id+`" style="width:50px" autocomplete="on"  name="itemin"></input>
								</div>
							</div>
						</div>
					</td>
					<td>
					<div class="symbol-cell">
						<div class="symbol-content">   
							<div class="centered">
								<button id="del`+myarr[i].doc._id+`" name="x" class="btn btn-info" onclick="toBag({`
								+`itemname:'`+myarr[i].doc.itemname
								+`',itemvol:'`+ myarr[i].doc._id
								+`',itemprice:'`+myarr[i].doc.itemprice
								+`'});">To Bag</button>
							</div>
						</div>
					</div>
				</td>
				</tr>
		`;

		$(tohtml + " tr:last").after(htmlbody);
	};
}
function gethttp(url, dataget, num){
	startloading()

	var settings = {
	  "async": true,
	  "crossDomain": true,
	  "url": url,
	  "method": "GET",
	  "headers": {
		"Content-Type": "application/json",
	  },
	  "data": dataget
	}
	$.ajax(settings).done(function (response) {
		stoploading()
		if(response.rep.result)
		if(response.rep.result == "0"){
			console.log(response.rep.message);
			//get all items
			if(num == 1){
				buildItemList("#itemlist", response.rep.message);
			}
			else if(num == 2){
				buildItemShop("#itemshop", response.rep.message);
			}

		}
		else{
			alert(response.rep.message);
		}
	});

}
$body = $("body");
function startloading(){
    console.log('----------loading');
    $body.addClass("loading");
};
function stoploading(){
    console.log('----------stop load');
    $body.removeClass("loading"); 
};

function viewLoggedin(rule){
	disAlllogged();
	$('#adminfunc').hide();
	//if admin
	if((rule == 1) || (rule == 0)){
		viewDashboard();
		if (rule == 1)
			currentrule = 1;
		else if (rule == 0){
			currentrule = 0;
			$('#adminfunc').show();
		}	
	}//if mod
	else if (rule == 2){
		currentrule = 2;
		viewDiagnosis();
	}//if normal
	else if (rule == 3){
		currentrule = 3;
		viewWallet();
	}//if normal
	else{
		viewLogin();
	}
	stoploading();
	closeNav();
}
function posthttp(url, jsonvar, currentpostVar){
	//$("#loadingx").show();
	startloading();
	var settings = {
	  "async": true,
	  "crossDomain": true,
	  "url": url,
	  "method": "POST",
	  "headers": {
		"Content-Type": "application/json",
	  },
	  "data": jsonvar
	}
	$.ajax(settings).done(function (response) {
		//$("#loadingx").hide();
		stoploading();
		console.log(response);
		//console.log(currentpostVar);
		if(response.rep.result == "0"){
			stoploading();
		
			//logout
			if(currentpostVar == 1){
				//console.log(response);
				stoploading();
				currentpost = 0;
				currentGtoken = "";
				disAll();	
				
				currentrule = 3;				
				$('#linklogout').hide();
				$('#linklogin').show();
				$("#hiid").empty();
				$("#hiid").append("Welcome to AutoTest Jenkins Git!" + " &nbsp;&nbsp;");
				
				//logout Google acct
				alert(response.rep.message);

				viewLogin();
			}
			//login - checkGaccout
			else if(currentpostVar == 2){
				stoploading();
				currentpost = 0;
				currentrule = response.rep.message;
				currentGtoken = response.rep.token;
				currentacc = response.rep.id;
				currentearn = response.rep.earn;
				currenthis = response.rep.his;
				$('#userearn').text(currentearn + " VND");
   			    viewLoggedin(currentrule);
				$('#linklogout').show();
				$('#linklogin').hide();
				//return currentrule
			}	
			//registration
			else if(currentpostVar == 3){
				stoploading();
				currentpost = 0;
				//currentrule = response.rep.message;
		
				alert(response.rep.message);
			}	
			//new item
			else if(currentpostVar == 4){
				stoploading();
				currentpost = 0;
				//currentrule = response.rep.message;
				viewUD();
				alert(response.rep.message);				
			}
			//edit item
			else if(currentpostVar == 5){
				stoploading();
				currentpost = 0;
				//currentrule = response.rep.message;
				viewUD();
				alert(response.rep.message);
			}
			//remove item
			else if(currentpostVar == 6){
				stoploading();
				currentpost = 0;
				$("#itemlist").empty();
				//currentrule = response.rep.message;
				viewUD();
				alert(response.rep.message);
				
			}
			//charge money
			else if(currentpostVar == 7){
				stoploading();
				currentpost = 0;
				viewWallet();
				currentearn = response.rep.earn;
				$('#userearn').text(currentearn + " VND");
				alert(response.rep.message);
			}
			//order
			else if(currentpostVar == 8){
				stoploading();
				currentearn = response.rep.earn;
				currenthis = response.rep.his;
				$('#userearn').text(currentearn + " VND");
				$('#mybag').empty();
				$('#subtotal').text("Total: 0");
				buyrec();		
				currentpost = 0;
				viewShopping();
				
				alert(response.rep.message);
			}
			//reset
			else if(currentpostVar == 9){
				stoploading();
				currentpost = 0;
				localStorage.clear();
				
				currentearn = response.rep.earn;
				viewWallet();
				alert(response.rep.message);
			}
		}	
		else{
			stoploading();
			currentpostVar = 19;
			alert(response.rep.message);
			
		}
	});

}


function closeNav(){
	jQuery('body').removeClass('sidebar-open');
	jQuery('body').addClass('sidebar-collapse');
	stoploading();
}

/*
====================================================================================================================
MAIN OPERATION
====================================================================================================================
*/
var currentpost = 0;
var currentget = 0;
var currenttoken = "";
var currentGtoken = "";
var currentacc = "";
var currentearn = 0;
var currenthis = "";
var currentamount = 0;
$(document).ready(function () {
	//startloading();
	disAll();
	viewLogin();
	$("#hiid").empty();
	$("#hiid").append("Welcome to AutoTest Jenkins Git!" + " &nbsp;&nbsp;")


	//table
	var table6bs ='';
	table6bs = $('#table6').DataTable( {
		"scrollY":        "300px",
		"scrollCollapse": true,
		"paging":         false,
		"pageLength": 10,
		"lengthChange": false
	} );


	//login with CODE from SMS
	$('#pwd').on('keypress', function(e) {
		//if(appearRecaptcha())
		if (e.keyCode == 13) {
			//$("#loadingx").show();
			startloading();
			var codevar = $("#pwd").val();
			startloading();
			var url = apiroot+"/loginUser";
			var jsonvar =  `{"email\":\"` 
			+ $("#phoneid").val()
			+`","password\":\"` 
			+  $("#pwd").val()
			+ `\"}`;
			currentpost = 2; //login
			posthttp(url, jsonvar, currentpost);
		}
	});


	$('#linklogin').show();


	//login - registration
	$("#loginfunc").click(function(e){
		disAll();
		viewLogin();
		closeNav();
	});

	// Upload Download
	$("#exchangefunc").click(function(e){
		if (currentGtoken == ""){
			alert("You are insufficient right to access!");
			disAll();
			viewLogin();
			
		}
		else{
			
			disAlllogged();
			
			if((currentrule == 0) || (currentrule == 1)|| (currentrule == 3)){
				viewUD();
				//$('#borrow').show();
			}else{
				alert("You are insufficient right to access!");
				viewLoggedin(currentrule);
				
			}			
			
		}
		closeNav();

	})

	// OB
	$("#orderfunc").click(function(e){
		if (currentGtoken == ""){
			alert("You are insufficient right to access!");
			disAll();
			viewLogin();
			
		}
		else{
			disAlllogged();
			if((currentrule == 0) || (currentrule == 1) || (currentrule == 3)){
				//viewMedExam();
				//$('#MedExamView').show();
				viewOB();
			}else{
				alert("You are insufficient right to access!");
				viewLoggedin(currentrule);
				
			}		
			
		}	
		closeNav();

	});
	$("#btnorderS").click(function(e){
		startloading();
		currentget = 2
		var url = apiroot+"/obs";
		var jsonvar =  `{}`;
	
		gethttp(url, jsonvar, currentget);
	});
	$("#btnorderB").click(function(e){
		startloading();
		currentget = 2
		var url = apiroot+"/obb";
		var jsonvar =  `{}`;
	
		gethttp(url, jsonvar, currentget);
	});	

	// Shopping
	$("#nftfunc").click(function(e){
		if (currentGtoken == ""){
			alert("You are insufficient right to access!");
			disAll();
			viewLogin();
			
		}
		else{
			disAlllogged();
			if((currentrule == 0) || (currentrule == 1) || (currentrule == 3)){
				//viewMedExam();
				//$('#MedExamView').show();
				viewShopping();
			}else{
				alert("You are insufficient right to access!");
				viewLoggedin(currentrule);
				
			}		
			
		}	
		closeNav();

	});

	//view YOUR WALLET
	$("#dashboardfunc").click(function(e){
		if (currentGtoken == ""){
			alert("You are insufficient right to access!");
			disAll();
			viewLogin();
		}
		else{
			disAlllogged();
			
			if((currentrule == 0) || (currentrule == 1) || (currentrule == 3)){
				viewWallet();
			}else{
				alert("You are insufficient right to access!");
				viewLoggedin(currentrule);
				
			}	
		}					
		closeNav();
		//disAll();
		//$('#yourwallet').show();

	});

	$("#dashboardfunclogo").click(function(e){
		if (currentGtoken == ""){
			alert("You are insufficient right to access!");
			disAll();
			viewLogin();
		}
		else{
			disAlllogged();
			
			if((currentrule == 0) || (currentrule == 1)){
				viewWallet();
			}else{
				alert("You are insufficient right to access!");
				viewLoggedin(currentrule);
				
			}	
		}		
		closeNav();
	});

	//login
	$("#btnlogin").click(function(e){
		startloading();
		var url = apiroot+"/loginUser";
		var jsonvar =  `{"email\":\"` 
		+ $("#phoneid").val()
		+`","password\":\"` 
		+  $("#pwd").val()
		+ `\"}`;
		currentpost = 2; //login
		posthttp(url, jsonvar, currentpost);
			
		closeNav();
	});


	//register
	$("#btnreg").click(function(e){
		startloading();
		var url = apiroot+"/registerUser";
		var jsonvar =  `{"recover\":\"` 
		+ $("#emailrecover").val() 
		+`","email\":\"` 
		+ $("#idlogin").val() 
		+`","password\":\"` 
		+ $("#pwd1").val() 
		+`","confpass\":\"` 
		+ $("#pwd2").val() 
		+ `\"}`;
		currentpost = 3; //logout
		posthttp(url, jsonvar, currentpost);
			
		closeNav();
	});

	//logout
	$("#logoutfunc").click(function(e){
		startloading();
		var url = apiroot+"/exptok";
		var jsonvar =  `{"tokenkey\":\"` 
		+ currentGtoken 
		+`","appid\":\"` 
		+ 4
		+ `\"}`;
		currentpost = 1; //logout
		posthttp(url, jsonvar, currentpost);
			
		closeNav();
	});

	//new item
	
	$("#btnnew").click(function(e){
		startloading();
		var url = apiroot+"/newitem";
		var jsonvar =  `{"tokenkey\":\"` 
		+ currentGtoken 
		+`","img\":\"` 
		+ myfilebase64 
		+`","itemname\":\"` 
		+ $("#itemname").val() 
		+`","itemvol\":\"` 
		+ $("#itemvol").val() 
		+`","itemprice\":\"` 
		+ $("#itemprice").val() 
		+`","email\":\"` 
		+ currentacc 
		+ `\"}`;
		currentpost = 4; //new
		posthttp(url, jsonvar, currentpost);
			
		closeNav();
	});
	//edit
	$("#btnsave").click(function(e){
		startloading();
		var url = apiroot+"/edititem";
		var jsonvar =  `{"tokenkey\":\"` 
		+ currentGtoken 
		+`","itemid\":\"` 
		+ $("#itemid").val() 
		+`","img\":\"` 
		+ myfilebase64
		+`","itemname\":\"` 
		+ $("#itemname").val() 
		+`","itemvol\":\"` 
		+ $("#itemvol").val() 
		+`","itemprice\":\"` 
		+ $("#itemprice").val() 
		+`","email\":\"` 
		+ currentacc
		+ `\"}`;
		currentpost = 5; //edit
		posthttp(url, jsonvar, currentpost);
			
		closeNav();
	});

	//edit
	$("#exmomo").click(function(e){
		startloading();
		var url = apiroot+"/exmomo";
		var jsonvar =  `{"tokenkey\":\"` 
		+ currentGtoken 
		+`","email\":\"` 
		+ currentacc
		+ `\"}`;
		currentpost = 7; //getmoney
		posthttp(url, jsonvar, currentpost);
			
		closeNav();
	});

	$("#resetfunc").click(function(e){
		startloading();
		var url = apiroot+"/reset";
		var jsonvar =  `{"tokenkey\":\"` 
		+ currentGtoken 
		+ `\"}`;
		currentpost = 9; //reset
		posthttp(url, jsonvar, currentpost);
			
		closeNav();
	});

	
	$("#btnorder").click(function(e){
		makePay();
	});
	//check image
	$("#previewImg").hide();
	$(document).on("click", ".browse", function() {
		$("#previewImg").show();
		//$("#arrresult").show();
		var file = $(this).parents().find(".file");
		file.trigger("click");
	});
	$('input[type="file"]').change(function(e) {
		$("#previewImg").show();
		var fileName = e.target.files[0].name;
		$("#file").val(fileName);
		$("#previewImg").empty();

		var reader = new FileReader();
		reader.onload = function(e) {
			htmlimg = `
			<img id="iddocsource" src="`+e.target.result+`" style="width: 350px" class="img-thumbnail" alt="c1"/>
			`;
			$("#previewImg").append(htmlimg);
			myfilebase64 = e.target.result;
		};
		reader.readAsDataURL(this.files[0]);
	});

});