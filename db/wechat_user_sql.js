var wechatUserSQL = {  
    insert:'INSERT INTO wechat_login_user(openid,uid,user_link_type,nickname,sex,language,city,province,country,headimgurl) VALUES(?,?,?,?,?,?,?,?,?,?)', 
    queryAll:'SELECT * FROM wechat_login_user',  
    getByOpenid:'SELECT * FROM wechat_login_user WHERE openid = ? ', 
    getByUid:'SELECT * FROM wechat_login_user WHERE uid = ? ',
		updateLinkType:'UPDATE wechat_login_user SET user_link_type = ? WHERE uid = ?',
    deleteByUid:'DELETE FROM wechat_login_user WHERE uid = ?',
};
module.exports = wechatUserSQL;