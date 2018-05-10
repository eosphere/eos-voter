var express = require('express');
var router = express.Router();
var blockproducers = require('./blockproducers')
var chaininpector = require('../tasks/chainInspector')

/* GET home page. */
router.get('/', function(req, res, next) {
    return blockproducers.get_block_producers_from_db().then(
        (result) => {
                       res.render('index', { title: 'EOS Voter',
                                             chainname: chaininpector.chain_name,
                                             'activeblockproducers': result,
                                             'backupblockproducers': blockproducers.getBackupBlockProducers(),
                                             });
                     }
    );
});

module.exports = router;
