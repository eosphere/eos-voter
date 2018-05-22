var express = require('express');
var router = express.Router();
var blockproducers = require('./blockproducers')
var chaininpector = require('../tasks/chainInspector')

/*
function ValidURL(str) {
  var pattern = new RegExp('^(https?:\/\/)?'+ // protocol
    '((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|'+ // domain name
    '((\d{1,3}\.){3}\d{1,3}))'+ // OR ip (v4) address
    '(\:\d+)?(\/[-a-z\d%_.~+]*)*'+ // port and path
    '(\?[;&a-z\d%_.~+=-]*)?'+ // query string
    '(\#[-a-z\d_]*)?$','i'); // fragment locater
  if(!pattern.test(str)) {
    alert("Please enter a valid URL.");
    return false;
  } else {
    return true;
  }
}
*/
function ValidURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locater
  if(!pattern.test(str)) {
    //alert("Please enter a valid URL.");
    return false;
  } else {
    return true;
  }
}

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

    /*
    return blockproducers.get_block_producers_from_db().then(
        (result) => {
                       res.render('index', { title: 'EOS Voter',
                                             chainname: chaininpector.chain_name,
                                             'activeblockproducers': result,
                                             'backupblockproducers': blockproducers.getBackupBlockProducers(),
                                             });
                     }
    );
    */

    let active_block_producers = chaininpector.get_active_block_producers().map((x) => {
        return { 'id': x.owner, 'name': x.owner, 'votes': parseFloat(x.total_votes).toPrecision(4),
                  'statement': x.url, 'valid_url': ValidURL(x.url),
                  'last_produced_block_time': x.last_produced_block_time };
    });
    let backup_block_producers = chaininpector.get_backup_block_producers().map((x) => {
        return { 'id': x.owner, 'name': x.owner, 'votes': parseFloat(x.total_votes).toPrecision(4),
                  'statement': x.url, 'valid_url': ValidURL(x.url),
                  'last_produced_block_time': x.last_produced_block_time };
    });
    res.render('index', { title: 'EOS Voter',
                          chainname: chaininpector.chain_name,
                         'activeblockproducers': active_block_producers,
                         'backupblockproducers': backup_block_producers,
                         'block_producer_list_empty': (active_block_producers.length + backup_block_producers.length) == 0,
                         });
});

module.exports = router;
