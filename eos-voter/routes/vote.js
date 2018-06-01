var express = require('express');
var router = express.Router();
var chaininspector = require('../tasks/chainInspector');
var config = require('../config');
var utils = require('../utils/utils.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
    let total_votes = utils.get_total_votes();
    console.log('total_votes=', total_votes);
    let active_block_producers = chaininspector.get_active_block_producers().map((x) => utils.format_block_producer(x, total_votes));
    let backup_block_producers = chaininspector.get_backup_block_producers().map((x) => utils.format_block_producer(x, total_votes));
    res.render('vote', { title: 'EOS Voter - Cast my vote',
                          chainname: config.chain_name,
                         'activeblockproducers': active_block_producers,
                         'backupblockproducers': backup_block_producers,
                         'protocol': config.protocol,
                         'chainaddr': config.chain_addr,
                         'chainport': config.chain_port,
                         'chainid': chaininspector.get_chainid(),
                         'voting_page_content': config.voting_page_content,
                         'total_activated_stake': chaininspector.get_total_activated_stake(),
                         'min_activated_stake': config.min_activated_stake,
                         'activated_percent': (chaininspector.get_total_activated_stake() / config.min_activated_stake * (15.0 / 100.0) * 100.0).toFixed(2),
                         });

});

module.exports = router;
