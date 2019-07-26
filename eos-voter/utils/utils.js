// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details

var config = require('../config');
var {countries, regions} = require('./country-codes.js');

var exports = module.exports = {};

function ValidURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locater
  return pattern.test(str);
}

exports.ValidURL = ValidURL;

// Kudos to CryptoLions
// Copied from EOS portal - ML 15062018
function calculateVoteWeight() {

    //time epoch:
    //https://github.com/EOSIO/eos/blob/master/contracts/eosiolib/time.hpp#L160

    //stake to vote
    //https://github.com/EOSIO/eos/blob/master/contracts/eosio.system/voting.cpp#L105-L109
    return 1;

    let timestamp_epoch = 946684800000;
    let dates_ = (Date.now() / 1000) - (timestamp_epoch / 1000);
    let weight_ = Math.floor(dates_ / (86400 * 7)) / 52;  //86400 = seconds per day 24*3600
    let ret = Math.pow(2, weight_);
    console.log('calculateVoteWeight ret=', ret);
    return ret;
}


exports.format_block_producer = (x, total_votes, bp_info) => {
    // Format the block producers information for the frontend
    var country_code = '';
    if (x.owner in bp_info) {
      try {
        country_code = bp_info[x.owner].org.location.country;
      } catch (err) {
          //console.log('format_block_producer err=', err);
          // Lots of BPs don't conform to the standard just continue as best as possible
      }
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
    try {
      if (!(bp_logo_256.slice(0, 7) === 'http://' || bp_logo_256.slice(0, 8) === 'https://') && ValidURL(x.url) &&  bp_logo_256 != '') {
          //console.log('INvalid fixable url=',bp_logo_256);
          let url = x.url;
          if (url.substr(-1) != '/') url += '/';
          bp_logo_256 = url + bp_logo_256;
      }
      if (bp_logo_256.slice(0, 7) === 'http://') {
          bp_logo_256 = "";
      }
      if (bp_logo_256.indexOf('cypherglass') > -1) {
          // A temporary work around since cypherglasses logo just timesout instead we ignore it.
          // Fix in a better way later
          bp_logo_256 = "";
      }
    } catch (err) {
        //console.log('format_block_producer err=', err);
        // Lots of BPs don't conform to the standard just continue as best as possible
    }
    let fake_bp = false;
    try {
        fake_bp = bp_info[x.owner].producer_account_name != x.owner;
    } catch (err) {
        //console.log('format_block_producer err=', err);
        // Lots of BPs don't conform to the standard just continue as best as possible
    }

    var country_name = country_code;
    let region_name = '';
    if (country_code in countries) {
        country_name = countries[country_code];
        if (country_code in regions) {
          region_name = regions[country_code];
          //console.log('country=', country_name, ' region=', region_name);
        }
    } else {
        country_name = country_code;
    }

    return { 'id': x.owner, 'name': x.owner, 'votes_absolute': (x.total_votes / calculateVoteWeight() / 10000.0 / 1000000.0).toFixed(2),
              'votes_percent': ((parseFloat(x.total_votes) / total_votes * 100.0).toFixed(2) + '%'),
              'statement': x.url, 'valid_url': ValidURL(x.url),
              'last_produced_block_time': x.last_produced_block_time,
              'country_code' : country_name, 'bp_logo_256': bp_logo_256,
              'fake_bp': fake_bp, 'position': x.position, 'region': region_name };
}

/*
exports.has_activated = function() {
    return chaininspector.get_total_activated_stake() > config.min_activated_stake;
}
*/
