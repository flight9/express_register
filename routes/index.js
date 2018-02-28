var express = require('express');
var router = express.Router();
var mysql = require('mysql');

// setup Mysql
var config = require('../db/config');
var userSql = require('../db/user_sql');
var db = mysql.createConnection(config.mysql);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET register page. */
router.route("/register").get(function(req,res){ 
	res.render("register", {
		title:'User register'
	});
}).post(function(req,res){
	var param = req.body;
	db.query(userSql.getUserByNamePass, [param.username,param.password], function (err, results){
		if(err) {
			throw err
		}
		else {
			if (results.length == 0) {
				// 用户不存在(存在问题: 相同用户名，不同密码)
				db.query(userSql.insert, [param.username,param.password,Date.parse(new Date())/1000,0,''],function (err, results) {
					if(err){
						throw err
					}else{
						res.send({status:100, msg:'新用户注册成功!'});
					}
				})
			}
			else {
				// 用户已存在
				res.send({status:101, msg:'错误: 该用户名已经被注册'});
			}
			//待定 req.session.error = '用户名已存在！';
		}
	})
});

/* GET login page. */
router.route("/login").get(function(req,res){
    res.render("login",{title:'User Login'});
}).post(function(req,res){ 
	var param = req.body;
	db.query(userSql.getUserByNamePass, [param.username,param.password], function (err, results){
		if(err) {
			throw err
		}
		else {
			console.log('getUserByNamePass:', results[0])
			if (results.length == 0) {
				// 用户不存在
				res.send({status:102, msg:'错误: 用户名或密码错误!'});
			}
			else {
				// 用户已存在
				req.session.user = results[0] // session 一定要先于 send 赋值，否则不保存
				res.send({status:100, msg:'用户登录成功！'});
			}
		}
	})
});

/* GET home page. */
router.get("/home", function(req,res){
	console.log('home:', req.session)
	if(!req.session.user){                     	
		//到达/home路径首先判断是否已经登录
		req.session.error = "请先登录"
		res.redirect("/login");
	}
	else {
		res.render("home", {title:'Home'});
	}
});

/* GET logout page. */
router.get("/logout", function(req,res){    
    req.session.user = null;
    req.session.error = null;
    res.redirect("/");
});

module.exports = router;
