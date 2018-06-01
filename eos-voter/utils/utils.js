var chaininspector = require('../tasks/chainInspector');
var config = require('../config');

var exports = module.exports = {};

function to_engineering(f) {
    // Return a f formatted as a string in engineering notation
    // Defintion of engineering notation https://en.wikipedia.org/wiki/Engineering_notation
    if (f == 0) {
        return '0e+0';
    }
    let exponent = Math.floor(Math.log10(f));
    exponent = exponent - exponent % 3;
    mantissa = f / Math.pow(10, exponent);
    return mantissa.toFixed(3) + 'e' + (exponent >= 0 ? '+' : '') + exponent.toFixed(0)
}

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

exports.format_block_producer = (x, total_votes) => {
    // Format the block producers information for the frontend
    return { 'id': x.owner, 'name': x.owner, 'votes_absolute': (x.total_votes / config.timefactor / 1000000.0).toFixed(2),
              'votes_percent': ((parseFloat(x.total_votes) / total_votes * 100.0).toFixed(2) + '%'),
              'statement': x.url, 'valid_url': ValidURL(x.url),
              'last_produced_block_time': x.last_produced_block_time };
}

exports.get_total_votes = function() {
    var block_producers = chaininspector.get_all_block_producers();
    if (block_producers.length == 0)
        // Fake returning some votes for display purposes
        return 1;
    return block_producers.reduce((accumulator, x) => accumulator + parseFloat(x.total_votes), 0);
}

