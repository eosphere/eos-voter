var exports = module.exports = {};

// Connect to EOS
var Eos = require('eosjs'); // Eos = require('./src')
var config = require('../config/index.js');
var chainid = null;
 
var options = {
  httpEndpoint: config.protocol + '://' + config.chain_addr + ':' + config.chain_port, 
  debug: false,
  fetchConfiguration: {}
}

eos = Eos.Testnet(options) // testnet at eos.io

var active_block_producers = [];

exports.get_active_block_producers = function() {
    return active_block_producers.slice(0, 21);
};

exports.get_backup_block_producers = function() {
    return active_block_producers.slice(21);

};

exports.get_chainid = function() {
    return chainid;
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
                console.log('getTableRows returned ') ;
                active_block_producers = result.rows;
                active_block_producers.sort((a, b) => { return parseFloat(b.total_votes) - parseFloat(a.total_votes); });
                setTimeout(inspectChain, config.refresh_secs * 1000);
            }
            );
    }).catch(
        (result) => {
                    console.error('Error result=', result);
                     setTimeout(inspectChain, config.refresh_secs * 1000);
                    });

    
}

inspectChain();

