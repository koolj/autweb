/*
Created by anhpt@
Oct 10, 2021.
*/

//const {dblog} = require('../database/database')
const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const {
	exptok,loginUser, registerUser,edititem,newitem,listitem,revitem,exmomo,order,reset
} = require('../implements/implements')
//const { itestredis } = require('../database/models/coremap');
var path    = require("path");
const fs = require('fs');
var chatbot = '';
router.get('/',function(req,res){
	//res.sendFile(path.join(__dirname+'/web/index.html'));
	  //__dirname : It will resolve to your project folder.
	  throw 'Xin chào bạn tới Đất học .NET/ Welcome to Dathoc.NET!'
});
const requestIp = require('request-ip');
var currentip = "";
var reqip = "";
const axios = require('axios');
const dateFormat = require('dateformat')
let reqPath = path.join(__dirname, '../web');

var currvalid = false;
module.exports = function(io) {
	router.post('/exptok', async (req, res) =>{
		let {tokenkey,appid} = req.body
	try {
			
			let rep = await exptok(tokenkey,appid)
			var appname = "";
			if(appid == 2) appname = "vhs"
			else if (appid == 1)  appname = "nft"
			else if (appid == 3)  appname = "worm telehealth"
			else if (appid == 4)  appname = "dongha defi"
			console.log("-----from ip: " +reqip+"---LOGOUT "+appname+"--- at "+ dateFormat(new Date(), "yyyy-mm-dd h:MM:ss")+"-----")
			res.json({
				rep
			})
		} catch(error) {
			res.json({
			result: '1',
			message: `${error}`
			})
		}
	})

	//api login
router.post('/loginUser', async (req, res) =>{
	let {email, password} = req.body
    try {
		//get ip
		clientIp = requestIp.getClientIp(req); 
		reqip = clientIp.toString().replace(":fff:","");
		reqip = reqip.replace(":ffff:","");
		reqip = reqip.replace(":","");
		let idobject = {
			ip: reqip,
			id: email,
			act: "login"
		}
		let rep = await loginUser(email, password,idobject)
		//console.log(rep)
		res.json({
			 rep
	  	})
	} catch(error) {
		res.json({
            result: '1',
            message: `Error: ${error}`
        })
	}
})

//api registration
router.post('/registerUser', async (req, res) =>{
	let {recover,email,password,confpass} = req.body
    try {
		//get ip
		clientIp = requestIp.getClientIp(req); 
		reqip = clientIp.toString().replace(":fff:","");
		reqip = reqip.replace(":ffff:","");
		reqip = reqip.replace(":","");
		let idobject = {
			ip: reqip,
			id: email,
			act: "registration"
		}
		let rep = await registerUser(recover,email,password,confpass,idobject)
		//console.log(rep)
		res.json({
			rep
	  	})
	} catch(error) {
		res.json({
            result: '1',
            message: `Error: ${error}`
        })
	}
})	
router.post('/newitem', async (req, res) =>{
	let {tokenkey,img, itemname,itemvol,itemprice,email} = req.body
    try {
		//get ip
		clientIp = requestIp.getClientIp(req); 
		reqip = clientIp.toString().replace(":fff:","");
		reqip = reqip.replace(":ffff:","");
		reqip = reqip.replace(":","");
		let idobject = {
			ip: reqip,
			id: email,
			act: "newitem"
		}
		let rep = await newitem(tokenkey,img, itemname,itemvol,itemprice,idobject)
		console.log(rep)
		res.json({
			 rep
	  	})
	} catch(error) {
		res.json({
            result: '1',
            message: `Error: ${error}`
        })
	}
})
router.post('/edititem', async (req, res) =>{
	let {tokenkey,itemid,img, itemname,itemvol,itemprice,email} = req.body
    try {
		//get ip
		clientIp = requestIp.getClientIp(req); 
		reqip = clientIp.toString().replace(":fff:","");
		reqip = reqip.replace(":ffff:","");
		reqip = reqip.replace(":","");
		let idobject = {
			ip: reqip,
			id: email,
			act: "edititem"
		}
		//console.log(img)
		let rep = await edititem(tokenkey,itemid, img, itemname,itemvol,itemprice,idobject)
		//console.log(rep)
		res.json({
			 rep
	  	})
	} catch(error) {
		res.json({
            result: '1',
            message: `Error: ${error}`
        })
	}
})

/*
const kafka = require('kafka-node');
const dateFormat = require('dateformat')
const client = new kafka.KafkaClient({
  kafkaHost:'localhost:9092'
});
var topicsToCreate = [{
	topic: 'divolteshoppingweb',
	partitions: 1,
	replicationFactor: 1
}];
client.createTopics(topicsToCreate, (error, result) => {
	console.log('create topic...');
	console.log(error);
	console.log(result);
	// result is an array of any errors if a given topic could not be created
});

const Producer = kafka.Producer;
const Consumer = kafka.Consumer;
const myProducer = new Producer(client);
myProducer.on('ready', () => {
	console.log('sending buy order...');
	//setInterval(() => {

	

	//}, 5000);
});
const myConsumer = new Consumer(
	client,
	[
		{
		topic: 'divolteshoppingweb',
		partition: 0,
		},
	],
	{
		autoCommit: false,
	},
);
//console.log('<---------  getting order...');
myProducer.on('error', err => {
	console.log(err);
});

myConsumer.on('error', err => {
	console.log(err);
});
*/
router.get('/obb', async (req, res) =>{
	//let {tokenkey,itemid,img, itemname,itemvol,itemprice,email} = req.body
    try {
		//get ip
		clientIp = requestIp.getClientIp(req); 
		reqip = clientIp.toString().replace(":fff:","");
		reqip = reqip.replace(":ffff:","");
		reqip = reqip.replace(":","");
		let idobject = {
			ip: reqip,
			id: "",
			act: "listitem"
		}
		const payloads = [
		{
			topic: 'divolteshoppingweb',
			key: Date.now(),
			messages: [`${dateFormat(new Date(), "yyyy-mm-dd h:MM:ss")},BUY,30,220`],
		}
		];
		
		myProducer.send(payloads, (err, data) => {
			if (err) {
				console.log(err);
			}
			console.log('.....done SELL order!');
		});
		//console.log(rep)
		res.json({
			 
	  	})
	} catch(error) {
		res.json({
            result: '1',
            message: `Error: ${error}`
        })
	}
})
router.get('/obs', async (req, res) =>{
	//let {tokenkey,itemid,img, itemname,itemvol,itemprice,email} = req.body
    try {
		//get ip
		clientIp = requestIp.getClientIp(req); 
		reqip = clientIp.toString().replace(":fff:","");
		reqip = reqip.replace(":ffff:","");
		reqip = reqip.replace(":","");
		let idobject = {
			ip: reqip,
			id: "",
			act: "listitem"
		}
		const payloads = [
		{
			topic: 'divolteshoppingweb',
			key: Date.now(),
			messages: [`${dateFormat(new Date(), "yyyy-mm-dd h:MM:ss")},SELL,20,250`],
		}
		];
		
		myProducer.send(payloads, (err, data) => {
			if (err) {
				console.log(err);
			}
			console.log('.....done BUY order!');
		});


		//}
		//console.log(rep)
		res.json({
			 
	  	});
	} catch(error) {
		res.json({
            result: '1',
            message: `Error: ${error}`
        })
	}
})
router.get('/listitem', async (req, res) =>{
	//let {tokenkey,itemid,img, itemname,itemvol,itemprice,email} = req.body
    try {
		//get ip
		clientIp = requestIp.getClientIp(req); 
		reqip = clientIp.toString().replace(":fff:","");
		reqip = reqip.replace(":ffff:","");
		reqip = reqip.replace(":","");
		let idobject = {
			ip: reqip,
			id: "",
			act: "listitem"
		}
		let rep = await listitem()
		//console.log(rep)
		res.json({
			 rep
	  	})
	} catch(error) {
		res.json({
            result: '1',
            message: `Error: ${error}`
        })
	}
})
router.post('/reset', async (req, res) =>{
	let {tokenkey} = req.body
    try {
		//get ip
		clientIp = requestIp.getClientIp(req); 
		reqip = clientIp.toString().replace(":fff:","");
		reqip = reqip.replace(":ffff:","");
		reqip = reqip.replace(":","");
		let idobject = {
			ip: reqip,
			id: "",
			act: "reset"
		}
		let rep = await reset(tokenkey,idobject)
		//console.log(rep)
		res.json({
			 rep
	  	})
	} catch(error) {
		res.json({
            result: '1',
            message: `Error: ${error}`
        })
	}
})
router.post('/li', async (req, res) =>{
	//let {tokenkey,itemid,img, itemname,itemvol,itemprice,email} = req.body
    try {
		//get ip
		clientIp = requestIp.getClientIp(req); r
		reqip = clientIp.toString().replace(":fff:","");
		reqip = reqip.replace(":ffff:","");
		reqip = reqip.replace(":","");
		let idobject = {
			ip: reqip,
			id: "",
			act: "listitem"
		}
		let rep = await listitem()
		//console.log(rep)
		res.json({
			 rep
	  	})
	} catch(error) {
		res.json({
            result: '1',
            message: `Error: ${error}`
        })
	}
})
router.post('/revitem', async (req, res) =>{
	let {tokenkey,itemid,email} = req.body
    try {
		//get ip
		clientIp = requestIp.getClientIp(req); 
		reqip = clientIp.toString().replace(":fff:","");
		reqip = reqip.replace(":ffff:","");
		reqip = reqip.replace(":","");
		let idobject = {
			ip: reqip,
			id: email,
			act: "removeitem"
		}
		let rep = await revitem(tokenkey,itemid,idobject)
		console.log(rep)
		res.json({
			 rep
	  	})
	} catch(error) {
		res.json({
            result: '1',
            message: `Error: ${error}`
        })
	}
})
router.post('/exmomo', async (req, res) =>{
	let {tokenkey,email} = req.body
    try {
		//get ip
		clientIp = requestIp.getClientIp(req); 
		reqip = clientIp.toString().replace(":fff:","");
		reqip = reqip.replace(":ffff:","");
		reqip = reqip.replace(":","");
		let idobject = {
			ip: reqip,
			id: email,
			act: "earn"
		}
		let rep = await exmomo(tokenkey,idobject)
		//console.log(rep)
		res.json({
			 rep
	  	})
	} catch(error) {
		res.json({
            result: '1',
            message: `Error: ${error}`
        })
	}
})
router.post('/order', async (req, res) =>{
	let {tokenkey,email,amount,val,items} = req.body
    try {
		//get ip
		clientIp = requestIp.getClientIp(req); 
		reqip = clientIp.toString().replace(":fff:","");
		reqip = reqip.replace(":ffff:","");
		reqip = reqip.replace(":","");
		let idobject = {
			ip: reqip,
			id: email,
			act: "earn"
		}
		let rep = await order(tokenkey,amount,val,items,idobject)
		//console.log(rep)
		res.json({
			 rep
	  	})
	} catch(error) {
		res.json({
            result: '1',
            message: `Error: ${error}`
        })
	}
})
return router;
}
