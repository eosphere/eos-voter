var express = require('express');
var router = express.Router();
var chaininspector = require('../tasks/chainInspector')
var utils = require('../utils/utils.js');
var config = require('../config');
var Humanize = require('humanize-plus');

/* GET home page. */
router.get('/', function(req, res, next) {
    let total_votes = utils.get_total_votes();

    let active_block_producers = chaininspector.get_active_block_producers().map((x) => utils.format_block_producer(x, total_votes));
    let backup_block_producers = chaininspector.get_backup_block_producers().map((x) => utils.format_block_producer(x, total_votes));
    res.render('index', { title: 'EOS Voter',
                          chainname: config.chain_name,
                         'activeblockproducers': active_block_producers,
                         'backupblockproducers': backup_block_producers,
                         'block_producer_list_empty': (active_block_producers.length + backup_block_producers.length) == 0,
                         'landing_page_content': config.landing_page_content,
                         'chainid': chaininspector.get_chainid(),
                         'total_activated_stake': Humanize.formatNumber(chaininspector.get_total_activated_stake() / 10.0 / 1000),
                         'min_activated_stake': Humanize.formatNumber(config.min_activated_stake / 10.0 / 1000),
                         'activated_percent': (chaininspector.get_total_activated_stake() / config.min_activated_stake * (15.0 / 100.0) * 100.0).toFixed(2),
                         'has_activated': utils.has_activated(),
                         });
});

module.exports = router;
