var express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    res.render('home');
})

//router.get('')

module.exports = router;