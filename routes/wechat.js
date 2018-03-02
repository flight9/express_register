var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var oauthApi = require('../wechat/oauth_api')

// setup Mysql
var config = require('../db/config');
var userSql = require('../db/user_sql');
var wcUserSql = require('../db/wechat_user_sql');
var db = mysql.createConnection(config.mysql);

var prefix = '/wechat'

/* GET entrance page. */
router.get(prefix, function(req, res, next) {
	console.log('Entrance sessionId:', req.session.id)
	if(req.session.user){
		res.redirect('/wechat/home')
	}
	else {
		var callbackURL = 'http://flight9.free.ngrok.cc/wechat/callback'
		var url = oauthApi.getAuthorizeURL(callbackURL,'state','snsapi_userinfo') 
		console.log('Auth Url:', url) 
		res.redirect(url) 
	}
});

/* GET wait page. */
router.get(prefix+ '/wait', function(req, res, next) {
	res.send('Your account is waiting for approval!')
})

/* GET callback page. */
router.get(prefix+ '/callback', function(req, res, next) {
	console.log('---- Wechat callback start -----') 
	var code = req.query.code 
	console.log('Auth Code:', code) 
	
	// accessToken
	oauthApi.getAccessToken(code, function (err, result) {
		var accessToken, openid
		if(err) {
			console.log('getAccessToken err:', err)
			accessToken = '(no save)'
			openid = req.session.openid
		}
		else {
			accessToken = result.data.access_token
			openid = result.data.openid
			req.session.openid = openid
			// 注意：每次代码修改后 server 重启 session 会丢失
		}
		console.log('Openid:', openid)
		console.log('AccessToken:', accessToken)
		
		// openid
		db.query(userSql.getUserByOpenid, [openid], function (err, results){
			if(err) {
				next(err)
			}
			else {
				//console.log('getUserByOpenid:', results)
				if (results.length !== 0) {
					// user with openid
					var user = results[0]
					if(user.type > 0) { // type =0 未批准/ >0 批准(且代表用户类型)
						req.session.user = results[0]
						res.redirect(prefix+ '/home')
					}
					else {
						res.redirect(prefix+ '/wait')
					}
				}
				else {
					// no user found
					res.render('index', { title: 'Express' });
				}
			}
		})
	})	
})

/* GET register page. */
router.route(prefix+ '/register').get(function(req,res){ 
	console.log('Register openid:', req.session.openid)
	console.log('Register sessionId:', req.session.id)
	res.render('register', { title:'User register' });
}).post(function(req, res, next){
	var param = req.body;
	db.query(userSql.getUserByName, [param.username], function (err, results){
		if(err) {
			next(err)
		}
		else {
			if (results.length == 0) {
				// 用户不存在
				var openid = req.session.openid
				var type = 0
				console.log('Register openid:', openid)
				if(!openid)  return next(new Error('Openid is missing!'))
				
				// Detail info
				oauthApi.getUser(openid, function (err, result1) { 
					console.log('getUser err+user: ', err, result1)
					if(err)  return next(err)
					var ou = result1
					
					// Insert db
					db.query(userSql.insert, [param.username,param.password,Date.parse(new Date())/1000,type,openid], function (err, results) {
						console.log('userSql.insert:', err, results)
						if(err)  return next(err)
						var uid = results.insertId
						var link_type = 0
						db.query(wcUserSql.insert, [
							openid,
							uid,
							link_type,
							ou.nickname,
							ou.sex,
							ou.language,
							ou.city,
							ou.province,
							ou.country,
							ou.headimgurl
						], function (err, results) {
							console.log('wcUserSql.insert:', err, results)
							if(err)  return next(err)
							res.send({status:100, msg:'新用户注册成功!', redir:prefix+ '/wait'});
						})
					})
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

/* GET bind page. */
router.route(prefix+ '/bind').get(function(req,res){
	console.log('Bind openid:', req.session.openid)
	console.log('Bind sessionId:', req.session.id)
  res.render('bind', {title:'User Bind'});
}).post(function(req,res){ 
	var param = req.body;
	db.query(userSql.getUserByNamePass, [param.username,param.password], function (err, results){
		if(err) {
			next(err)
		}
		else {
			var user = results[0]
			var openid = req.session.openid
			var type = 1
			console.log('Bind openid:', openid)
			if(!openid)  return next(new Error('Openid is missing!'))
			
			if (results.length == 0) {
				// 用户不存在
				res.send({status:102, msg:'错误: 用户名或密码错误!'});
			}
			else {
				// 用户已存在
				if(user.openid) {
					return res.send({status:103, msg:'错误: 该用户已绑定过微信!'}) // 避免重复绑定
				}
				
				// Detail info
				oauthApi.getUser(openid, function (err, result1) { 
					console.log('getUser err+user: ', err, result1)
					if(err)  return next(err)
					var ou = result1
				
					// Update db
					db.query(userSql.bind, [type, openid, user.id], function (err, results){
						console.log('userSql.bind', err, results)
						if(err)  next(err)
						user.openid = openid
						user.type = type
						req.session.user = user // 注意: session 一定要先于 send 赋值，否则不保存
						
						var uid = user.id
						var link_type = 0
						db.query(wcUserSql.insert, [
							openid,
							uid,
							link_type,
							ou.nickname,
							ou.sex,
							ou.language,
							ou.city,
							ou.province,
							ou.country,
							ou.headimgurl
						], function (err, results) {
							console.log('wcUserSql.insert:', err, results)
							if(err)  return next(err)
							res.send({status:100, msg:'用户绑定成功！', redir:prefix+ '/home'});
						})						
					})
				})
				
			}
		}
	})
});

/* GET home page. */
router.get(prefix+ '/home', function(req,res){
	console.log('Home:', req.session)
	//到达/home路径首先判断是否已经登录
	if(!req.session.user){                     	
		res.redirect(prefix);
	}
	else {
		res.render('home', {title:'Home'});
	}
});

/* GET logout page. */
router.get(prefix+ '/logout', function(req,res){    
    req.session.user = null;
    res.redirect('/');
});

module.exports = router;
