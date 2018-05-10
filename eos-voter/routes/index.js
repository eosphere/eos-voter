var express = require('express');
var router = express.Router();
var blockproducers = require('./blockproducers')

/* GET home page. */
router.get('/', function(req, res, next) {
    return blockproducers.get_block_producers_from_db().then(
        (result) => {
                       res.render('index', { title: 'EOS Voter',
                                             'networkname': 'Jungle Testnet',
                                             'activeblockproducers': result,
                                             'backupblockproducers': blockproducers.getBackupBlockProducers(),
                                             });
                     }
    );
});

module.exports = router;
