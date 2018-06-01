var exports = module.exports = {};

// Connect to EOS
var Eos = require('eosjs'); // Eos = require('./src')
var config = require('../config/index.js');
var chainid = null;
var total_activated_stake = 0;
 
var options = {
  httpEndpoint: config.protocol + '://' + config.chain_addr + ':' + config.chain_port, 
  debug: false,
  fetchConfiguration: {},
}

eos = Eos.Localnet(options) // testnet at eos.io

var active_block_producers = [];

exports.get_active_block_producers = function() {
    return active_block_producers.slice(0, 21);
};

exports.get_backup_block_producers = function() {
    return active_block_producers.slice(21);
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

var first_run = true;

function inspectChain()
{
    console.log('Calling getInfo');
    eos.getInfo({}).then(
        (result) => {
        console.log('getInfo returned');
        chainid = result.chain_id;
        eos.getTableRows({'json': true, 'code': 'eosio', 'scope': 'eosio', 'table': 'producers', 'limit': 500}).then(
            (result) => {
                console.log('getTableRows producers returned') ;
                active_block_producers = result.rows;
                active_block_producers.sort((a, b) => { return parseFloat(b.total_votes) - parseFloat(a.total_votes); });
                eos.getTableRows({'json': true, 'code': 'eosio', 'scope': 'eosio', 'table': 'global', 'limit': 500}).then(
                    (result) => {
                        //console.log('getTableRows global returned result= ', result) ;
                        console.log('getTableRows global returned') ;
                        total_activated_stake = result.rows[0].total_activated_stake;
                        setTimeout(inspectChain, config.refresh_secs * 1000);
                    });
            });
        //var timefactor = Math.pow(2, ((new Date).getTime() - 946684800000.0) / 1000.0 / 86400.0 / 7.0 / 52.0);
        var timefactor = Math.pow(2, ((new Date).getTime()) / 1000.0 / 86400.0 / 7.0 / 52.0);
        console.log('timefactor=', timefactor, ' gettime()=', (new Date).getTime());
    }).catch(
        (result) => {
                    console.error('Error result=', result);
                     setTimeout(inspectChain, config.refresh_secs * 1000);
                    });

    
}

inspectChain();

