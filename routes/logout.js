var express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    res.render('logout');
})

//router.get('')

module.exports = router;