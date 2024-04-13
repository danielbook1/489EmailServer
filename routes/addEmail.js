var express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    res.render('addEmail');
})

//router.get('')

module.exports = router;