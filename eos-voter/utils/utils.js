// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details

var chaininspector = require('../tasks/chainInspector');
var config = require('../config');
var countrycodes = require('./country-codes.js');

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
  var pattern = new RegExp('^(https?:\\/\\/)'+ // protocol
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

exports.ValidURL = ValidURL;

exports.format_block_producer = (x, total_votes) => {
    // Format the block producers information for the frontend
    let bp_info = chaininspector.get_bp_info();
    var country_code = '';
    if (x.owner in bp_info) {
        country_code = bp_info[x.owner].org.location.country;
    }
    let bp_logo_256 = '';
    try {
        bp_logo_256 = bp_info[x.owner].org.branding.logo_256;
        if (!(typeof bp_logo_256 === 'string' || bp_logo_256 instanceof String))
            bp_logo_256 = '';
    } catch (err) {
        //console.log('format_block_producer err=', err);
        // Lots of BPs don't conform to the standard just continue as best as possible
    }
    //console.log('bp_logo_256=',bp_logo_256);
    if (!(bp_logo_256.slice(0, 7) === 'http://' || bp_logo_256.slice(0, 8) === 'https://') && ValidURL(x.url) &&  bp_logo_256 != '') {
        //console.log('INvalid fixable url=',bp_logo_256);
        let url = x.url;
        if (url.substr(-1) != '/') url += '/';
        bp_logo_256 = url + bp_logo_256;
    }
    let fake_bp = false;
    try {
        fake_bp = bp_info[x.owner].producer_account_name != x.owner;
    } catch (err) {
        //console.log('format_block_producer err=', err);
        // Lots of BPs don't conform to the standard just continue as best as possible
    }

    var country_name = country_code;
    if (country_code in countrycodes) {
        country_name = countrycodes[country_code];
    } else {
        country_name = country_code;
    }

    return { 'id': x.owner, 'name': x.owner, 'votes_absolute': (x.total_votes / config.timefactor / 1000000.0).toFixed(2),
              'votes_percent': ((parseFloat(x.total_votes) / total_votes * 100.0).toFixed(2) + '%'),
              'statement': x.url, 'valid_url': ValidURL(x.url),
              'last_produced_block_time': x.last_produced_block_time,
              'country_code' : country_name, 'bp_logo_256': bp_logo_256, 'fake_bp': fake_bp };
}

exports.get_total_votes = function() {
    var block_producers = chaininspector.get_all_block_producers();
    if (block_producers.length == 0)
        // Fake returning some votes for display purposes
        return 1;
    return block_producers.reduce((accumulator, x) => accumulator + parseFloat(x.total_votes), 0);
}

exports.has_activated = function() {
    return chaininspector.get_total_activated_stake() > config.min_activated_stake;
}

