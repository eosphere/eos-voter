var express = require('express');
var router = express.Router();
var blockproducers = require('./blockproducers')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'EOS Voter',
                        'activeblockproducers': blockproducers.getActiveBlockProducers(),
                        'backupblockproducers': blockproducers.getBackupBlockProducers(),
                        });
});

module.exports = router;
