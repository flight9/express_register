var express = require('express');
var router = express.Router();

/* GET index page. */
router.get('/', function(req, res, next) {
	res.send('Welcome to Index!')
})


module.exports = router;
