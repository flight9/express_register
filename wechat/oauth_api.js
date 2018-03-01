var fs = require('fs')
var c = require('./config')

var OAuth = require('wechat-oauth') 
var oauthApi = new OAuth(c.appId, c.appSecret, function (openid, callback) {
	  // TODO: 传入一个根据 openid 获取对应的全局 token 的方法
	  fs.readFile(__dirname+ '/token/'+ openid +'.token.txt', 'utf8', function (err, txt) {
			if (err) {return callback(err)}
			callback(null, JSON.parse(txt))
	  })
}, function (openid, token, callback) {
	  // TODO: 请将 token 存储到全局，跨进程、跨机器级别的全局，比如写到数据库、redis 等
	  fs.writeFile(__dirname+ '/token/'+ openid + '.token.txt', JSON.stringify(token), callback)
})

module.exports = oauthApi


