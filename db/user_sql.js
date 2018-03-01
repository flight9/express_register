var userSQL = {  
    insert:'INSERT INTO user(username,password,date,type,openid) VALUES(?,?,?,?,?)', 
    bind:'UPDATE user SET type = ?,openid = ? WHERE id = ?',
    queryAll:'SELECT * FROM user',  
    getUserByOpenid:'SELECT * FROM user WHERE openid = ? ', 
    getUserByName:'SELECT * FROM user WHERE username = ? ',
    getUserByNamePass:'SELECT * FROM user WHERE username = ? AND password = ? ',
    deleteUserByNamePass:'DELETE FROM user WHERE username = ? AND password = ? ',
};
module.exports = userSQL;