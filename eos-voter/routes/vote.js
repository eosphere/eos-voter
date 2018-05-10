var express = require('express');
var router = express.Router();
var blockproducers = require('./blockproducers')
var chaininpector = require('../tasks/chainInspector')

/* GET users listing. */
router.get('/', function(req, res, next) {
    return blockproducers.get_block_producers_from_db().then(
        (result) => {
        console.log('chaininpector.chain_name=',chaininpector.chain_name);
                       res.render('vote', { title: 'EOS Voter - Cast my vote',
                                            chainname: chaininpector.chain_name,
                                            'allblockproducers': result,
                                             //'backupblockproducers': blockproducers.getBackupBlockProducers(),
                                             });
                     }
    );

});

module.exports = router;
