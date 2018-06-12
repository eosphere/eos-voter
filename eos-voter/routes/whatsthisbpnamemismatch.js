// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details

var express = require('express');
var router = express.Router();
var config = require('../config');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('whatsthisbpnamemismatch', {'message': config.whats_this_bp_name_mismatch});
})

module.exports = router;

