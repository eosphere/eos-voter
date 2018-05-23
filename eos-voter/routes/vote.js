var express = require('express');
var router = express.Router();
var chaininpector = require('../tasks/chainInspector');
var settings = require('../config/settings.js');
var utils = require('../utils/utils.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
    let active_block_producers = chaininpector.get_active_block_producers().map(utils.format_block_producer);
    let backup_block_producers = chaininpector.get_backup_block_producers().map(utils.format_block_producer);
    res.render('vote', { title: 'EOS Voter - Cast my vote',
                          chainname: settings.chain_name,
                         'activeblockproducers': active_block_producers,
                         'backupblockproducers': backup_block_producers,
                         'chainaddr': settings.chain_addr,
                         'chainport': settings.chain_port,
                         });

});

module.exports = router;
