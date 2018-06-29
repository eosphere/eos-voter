// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details

var exports = module.exports = {};

// Connect to EOS
var Eos = require('eosjs'); // Eos = require('./src')
var config = require('../config/index.js');
var rp = require('request-promise');
var utils = require('../utils/utils.js');

var chainid = null;
var total_activated_stake = 0;
var bp_info = {};

var options = {
  httpEndpoint: config.protocol + '://' + config.chain_addr + ':' + config.chain_secure_port,
  //httpEndpoint: 'https://node1.eosphere.io:443',
  debug: false,
  fetchConfiguration: {},
}

eos = Eos(options) // testnet at eos.io

var active_block_producers = [];

exports.get_active_block_producers = function() {
    if (utils.has_activated())
        return active_block_producers.slice(0, 21);
    else
        return active_block_producers;
};

exports.get_backup_block_producers = function() {
    if (utils.has_activated())
        return active_block_producers.slice(21);
    else
        return [];
};

exports.get_all_block_producers =  function() {
    return active_block_producers;
};

exports.get_chainid = function() {
    return chainid;
}

exports.get_total_activated_stake = function() {
    return total_activated_stake;
}

exports.get_bp_info = function() {
    return bp_info;
}

var first_run = true;

function updateBpInfo() {
    console.log('updateBpInfo called');
    if (config.query_bp_json == false)
      return;
    //Iterate over all of the block producers and update their bp info
    active_block_producers.map((bp) => {
        if (utils.ValidURL(bp.url)) {
            // Only try this if a valid URL
            var url = bp.url;
            if (url.substr(-1) != '/') url += '/';
            //request_options.uri = url + chainid + '/bp.json';
            const request_options = {
                uri: url + chainid + '/bp.json',
                headers: {
                    'User-Agent': 'Request-Promise'
                },
                json: true // Automatically parses the JSON string in the response
            };
            function request_bp_info_stage2(bp, result) {
                // bp is the block producers we all getting info for
                // result is the result from the first stage. An empty dict if no valid result
                const request_options = {
                    uri: url + 'bp.json',
                    headers: {
                        'User-Agent': 'Request-Promise'
                    },
                    json: true // Automatically parses the JSON string in the response
                };
                //console.log('called stage2 for bp=', bp.url);
                rp(request_options)
                .then(function (result2) {
                    var is_bp_info = 'producer_account_name' in result2 && 'producer_public_key' in result2 && 'org' in result2
                        && 'location' in result2.org && 'country' in result2.org.location;
                    //console.log('Result for stage2 url ', bp.url, ' = ', is_bp_info);
                    if (is_bp_info) {
                        bp_info[bp.owner] = Object.assign({}, result2, result);
                    }
                })
                .catch(function (err) {
                    // Ignore errors since bp_info is optional
                    //console.error('Error for url ', bp.url, ' = ', err);
                    //console.error('Error for stage2 url ', bp.url);
                    // API call failed...
                });
            };
            rp(request_options)
            .then(function (result) {
                var is_bp_info = 'producer_account_name' in result && 'producer_public_key' in result && 'org' in result
                    && 'location' in result.org && 'country' in result.org.location;
                //console.log('Result for url ', bp.url, ' = ', is_bp_info);
                request_bp_info_stage2(bp, is_bp_info ? result : {});
            })
            .catch(function (err) {
                // Ignore errors since bp_info is optional
                //console.error('Error for url ', bp.url, ' = ', err);
                //console.error('Error for url ', bp.url);
                request_bp_info_stage2(bp, {});
                // API call failed...
            });
        }
    });
    setTimeout(updateBpInfo, config.bp_info_refresh_secs * 1000);
}

function inspectChain()
{
    console.log('Calling getInfo');
    eos.getInfo({}).then(
        (result) => {
        console.log('getInfo returned');
        chainid = result.chain_id;
        eos.getTableRows({'json': true, 'code': 'eosio', 'scope': 'eosio', 'table': 'producers', 'limit': 500}).then(
            (result) => {
                console.log('getTableRows producers returned result') ;
                var new_block_producers = result.rows;
                new_block_producers.sort((a, b) => { return parseFloat(b.total_votes) - parseFloat(a.total_votes); });
                eos.getTableRows({'json': true, 'code': 'eosio', 'scope': 'eosio', 'table': 'global', 'limit': 500}).then(
                    (result) => {
                        //console.log('getTableRows global returned result= ', result) ;
                        console.log('getTableRows global returned') ;
                        total_activated_stake = result.rows[0].total_activated_stake;
                        active_block_producers = new_block_producers;
                        //total_activated_stake = 1;
                        setTimeout(inspectChain, config.refresh_secs * 1000);
                    }).catch(
                    (result) => {
                        console.error('getTableRows global Error result=', result);
                        setTimeout(inspectChain, config.refresh_secs * 1000);
                    });
            }).catch(
                (result) => {
                    console.error('getTableRows global Error result=', result);
                    setTimeout(inspectChain, config.refresh_secs * 1000);
                });
        //var timefactor = Math.pow(2, ((new Date).getTime() - 946684800000.0) / 1000.0 / 86400.0 / 7.0 / 52.0);
        //var timefactor = Math.pow(2, ((new Date).getTime()) / 1000.0 / 86400.0 / 7.0 / 52.0);
        //console.log('timefactor=', timefactor, ' gettime()=', (new Date).getTime());
    }).catch(
        (result) => {
                    console.error('Error result=', result);
                     setTimeout(inspectChain, config.refresh_secs * 1000);
                    });


}

inspectChain();
setTimeout(updateBpInfo, config.refresh_secs * 1000);
