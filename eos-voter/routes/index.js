var express = require('express');
var router = express.Router();
var chaininspector = require('../tasks/chainInspector')
var utils = require('../utils/utils.js');
var config = require('../config');

/* GET home page. */
router.get('/', function(req, res, next) {

    let active_block_producers = chaininspector.get_active_block_producers().map(utils.format_block_producer);
    let backup_block_producers = chaininspector.get_backup_block_producers().map(utils.format_block_producer);
    res.render('index', { title: 'EOS Voter',
                          chainname: config.chain_name,
                         'activeblockproducers': active_block_producers,
                         'backupblockproducers': backup_block_producers,
                         'block_producer_list_empty': (active_block_producers.length + backup_block_producers.length) == 0,
                         'landing_page_content': config.landing_page_content,
                         'chainid': chaininspector.get_chainid(),
                         });
});

module.exports = router;
