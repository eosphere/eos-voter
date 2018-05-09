var express = require('express');
var router = express.Router();
var blockproducers = require('./blockproducers')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('vote', { title: 'EOS Voter - Cast my vote',
                       'allblockproducers': blockproducers.getAllBlockProducers(),
                       });
});

module.exports = router;
