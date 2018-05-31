var express = require('express');
var router = express.Router();
var chaininspector = require('../tasks/chainInspector');
var config = require('../config');
var utils = require('../utils/utils.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
    let active_block_producers = chaininspector.get_active_block_producers().map(utils.format_block_producer);
    let backup_block_producers = chaininspector.get_backup_block_producers().map(utils.format_block_producer);
    res.render('vote', { title: 'EOS Voter - Cast my vote',
                          chainname: config.chain_name,
                         'activeblockproducers': active_block_producers,
                         'backupblockproducers': backup_block_producers,
                         'protocol': config.protocol,
                         'chainaddr': config.chain_addr,
                         'chainport': config.chain_port,
                         'chainid': chaininspector.get_chainid(),
                         });

});

module.exports = router;
