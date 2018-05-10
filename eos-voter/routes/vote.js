var express = require('express');
var router = express.Router();
var blockproducers = require('./blockproducers')

/* GET users listing. */
router.get('/', function(req, res, next) {
    return blockproducers.get_block_producers_from_db().then(
        (result) => {
                       res.render('vote', { title: 'EOS Voter - Cast my vote',
                                            'allblockproducers': result,
                                             //'backupblockproducers': blockproducers.getBackupBlockProducers(),
                                             });
                     }
    );

});

module.exports = router;