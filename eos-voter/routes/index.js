var express = require('express');
var router = express.Router();
var chaininpector = require('../tasks/chainInspector')
var utils = require('../utils/utils.js');
var settings = require('../config/settings.js');


function strcmp ( str1, str2 ) {
    // http://kevin.vanzonneveld.net
    // +   original by: Waldo Malqui Silva
    // +      input by: Steve Hilder
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +    revised by: gorthaur
    // *     example 1: strcmp( 'waldo', 'owald' );
    // *     returns 1: 1
    // *     example 2: strcmp( 'owald', 'waldo' );
    // *     returns 2: -1

    return ( ( str1 == str2 ) ? 0 : ( ( str1 > str2 ) ? 1 : -1 ) );
}

/* GET home page. */
router.get('/', function(req, res, next) {

    let active_block_producers = chaininpector.get_active_block_producers().map(utils.format_block_producer);
    let backup_block_producers = chaininpector.get_backup_block_producers().map(utils.format_block_producer);
    res.render('index', { title: 'EOS Voter',
                          chainname: settings.chain_name,
                         'activeblockproducers': active_block_producers,
                         'backupblockproducers': backup_block_producers,
                         'block_producer_list_empty': (active_block_producers.length + backup_block_producers.length) == 0,
                         });
});

module.exports = router;
