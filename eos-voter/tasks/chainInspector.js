var exports = module.exports = {};

// Connect to EOS
var Eos = require('eosjs'); // Eos = require('./src')
var config = require('../config/index.js');
 
var options = {
  httpEndpoint: config.protocol + '://' + config.chain_addr + ':' + config.chain_port, 
  debug: false,
  fetchConfiguration: {}
}

eos = Eos.Testnet(options) // testnet at eos.io

var active_block_producers = [];
var last_irreversible_block_num = 0;
var recent_blocks = {};

function get_recent_producers() {
    var blocks = Object.keys(recent_blocks).map((key) => recent_blocks[key]);
    return blocks.map((block) => block.producer);
}

exports.get_active_block_producers = function() {
    var recent_producers = get_recent_producers();
    console.log('get_active_block_producers recent_producers=', recent_producers);
    active_block_producers.filter((producer) => { return console.log('producer=', producer); });
    return active_block_producers.filter((producer) => { return recent_producers.includes(producer.owner); });
};

exports.get_backup_block_producers = function() {
    var recent_producers = get_recent_producers();
    return active_block_producers.filter((producer) => { return !recent_producers.includes(producer.owner); });
};

var first_run = true;

function inspectChain()
{
    console.log('Calling getInfo');
    eos.getInfo({}).then(
        (result) => {
        console.log('getInfo returned');
        last_irreversible_block_num = result.last_irreversible_block_num;
        var head_block_num = result.head_block_num;
        eos.getTableRows({'json': true, 'code': 'eosio', 'scope': 'eosio', 'table': 'producers', 'limit': 500}).then(
            (result) => {
                console.log('getTableRows returned');
                active_block_producers = result.rows;
                for (let i = 0 ; i < result.rows.length ; i++ ) {
                    let producer_info = result.rows[i];
                }
                setTimeout(inspectChain, config.refresh_secs * 1000);
            }
            );
        // Iterate over recent blocks. We consider a BP to be active if it has recently produced a block
        // Note the algorithm may strangely change the state if the elected BP's have changed since the 
        // last iireversible block and there has been a chain fork

        console.log(Object.keys(recent_blocks).length, ' blocks in the recent block list');

        // Firstly trim the list of blocks to get rid of old ones.
        var blocks_to_remove = [];
        Object.keys(recent_blocks).forEach(function(key) {
            if (key < last_irreversible_block_num - 63) {
                blocks_to_remove.push(key);
                }
            });

        // Delete old blocks from the in memory list
        for (let i = 0 ; i < blocks_to_remove.length ; i++) {
            delete recent_blocks[blocks_to_remove[i]];
        }

        // Download the blocks we are missing
        var blocks_to_download = [];
        for (let i = head_block_num; i >= last_irreversible_block_num - 63 && i >= 0 ; i--) {
            if (!(i in recent_blocks)) {
                eos.getBlock(i).then((result) => {
                                                   recent_blocks[result.block_num] = result;
                                                 });
            }
        }
    }).catch(
        (result) => {
                    console.error('Error result=', result);
                     setTimeout(inspectChain, config.refresh_secs * 1000);
                    });

    
}

inspectChain();

