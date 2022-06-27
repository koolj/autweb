/*
Created by anhpt@
Jan 18, 2021.
*/
const masterhost = "./_shared/";
//const {dblog,dbexp,dbuser,dbitem} = require('../database/database')
const bcrypt = require('bcrypt')

const atob = require("atob");
var Blob = require('node-blob');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const dateFormat = require('dateformat')
const util = require('util');

var currentGtoken = "";
var currentrule = 3;
var currentUsername = "";

//===========================================================================================
//API
//===========================================================================================
const readFile = util.promisify(fs.readFile);
function readIMG(data) {
	return readFile(data, {encoding: 'base64'});
}

const FileType = require('file-type');
const readChunk = require('read-chunk');

const { exec } = require("child_process");
function execPromise(command) {
    return new Promise(function(resolve, reject) {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);				
                return;
            }

            resolve(stdout.trim());
        });
    });
}

const jwt = require("jsonwebtoken");
const loginUser = async (email, password,idobject) => {
    try {
		if(email.trim() == "" || password.trim() == "")
			return {result: '1',message:'Login needs ID and password!'}
		else	
			return {result: '0',message:3, id: 'abc', earn:270000, token:'abctoken', his:'abchis'}	
    } catch(error) {
        return {result: '1',message:error};
    }
}

//insert new user
var currunixtime = Math.floor(new Date().getTime() / 1000);
const registerUser = async (recover,email,password,confpass,idobject) => {
    try {
			currunixtime = Math.floor(new Date().getTime() / 1000);
			return dbuser.get(email).then((body) => {
				//console.log(body);
				return {result: '1',message:'User is existed! Take a new ID.'}
			}).catch(async(err) => {
				
				if(recover.trim() =="")
					return {result: '1',message:'Member should have email to recover!'}

				else if(password.length < 8)
					return {result: '1',message:'Password should be 8 chars!'}

				else if(password.trim() != confpass.trim())
					return {result: '1',message:'Confirm password and password should be the same!'}
					
				else if(email.trim() == "" || password.trim() == "" || recover.indexOf("@") == -1 || recover.indexOf(".") == -1)
					return {result: '1',message:'Member needs ID unique, recover email, and password to login/recover!'}

				else if(!(recover.indexOf("@") != -1 && recover.indexOf(".") != -1))
					return {result: '1',message:'Recover email should be corrected!'}

				else

					return {result: "0",message:"New member #"+email+"# created!"}
			})
    } catch(error) {
        return {result: '1',message:error};
    }
}
//const FileType = require('file-type');
var newitem= async (tokenkey,img, itemname,itemvol,itemprice,idobject) => {
    try {
		return {result: '0',message:'Thank you for adding new item #'+itemname+'#!'}
    } catch(error) {
        throw error
    }
}
var edititem= async (tokenkey,itemid,img, itemname,itemvol,itemprice,idobject) => {
    try {
		return {result: '1',message:'Thank you for add saving item #'+itemname+'#!'}
    } catch(error) {
        throw error
    }
}
var listitem= async () => {
    try {
		var mylist =[
			{doc: {_id:'001',img:"./img/g1.jpeg", itemname: "Rau muong",itemvol: "20",itemprice:"4000", email:'abcemail',timecreated:dateFormat(new Date(), "yyyy-mm-dd h:MM:ss")}},
			{doc: {_id:'002',	img:"./img/g2.jpeg", itemname: "Thit",itemvol: "20",itemprice:"6000", email:'abcemail',timecreated:dateFormat(new Date(), "yyyy-mm-dd h:MM:ss")}},
			{doc: {_id:'003',	img:"./img/g3.jpeg", itemname: "Gao",itemvol: "20",itemprice:"1200", email:'abcemail',timecreated:dateFormat(new Date(), "yyyy-mm-dd h:MM:ss")}},
		]	
		
		return {result: '0',message:mylist}
    } catch(error) {
        throw error
    }
}
var revitem= async (tokenkey,itemid,idobject) => {
    try {
		return {result: '1',message:'You have deleted item #'+itemid+'#!'}
    } catch(error) {
        throw error
    }
}
var exmomo= async (tokenkey,idobject) => {
    try {
		return {result: '0',message:'You have earned # 30000 VND.', earn: '260000'}
    } catch(error) {
        throw error
    }
}
var order= async (tokenkey,amount,val,items,idobject) => {
    try {
		return {result: '0',message:'Thank you for ordering!\n' + val, earn: '250000', his:items}
    } catch(error) {
        throw error
    }
}
//const { exec } = require("child_process");
var reset= async (tokenkey,idobject) => {
    try {
		return {result: '0',message:'System has been reset!',earn:200000}
    } catch(error) {
        throw error
    }
}
var exptok= async (tokenkey,idobject) => {
    try {
		return {result: '0',message:'Logged out!'}
    } catch(error) {
        throw error
    }
}
module.exports = {
	exptok,loginUser, registerUser,edititem,newitem,listitem,revitem,exmomo,order,reset
}
