var exports = module.exports = {};

// Connect to EOS
var Eos = require('eosjs') // Eos = require('./src')
var settings = require('../config/settings.js');
 
// eos = Eos.Localnet() // 127.0.0.1:8888

var options = {
  //httpEndpoint: 'http://dev.cryptolions.io:28888', // default
  httpEndpoint: 'http://' + settings.chain_addr + ':' + settings.chain_port, 
  //httpEndpoint: 'http://ec2-34-215-187-15.us-west-2.compute.amazonaws.com:8888', //Private test net
  debug: false,
  fetchConfiguration: {}
}

exports.chain_name = 'Jungle Testnet';
//exports.chain_name = 'EOS Main Net';


eos = Eos.Testnet(options) // testnet at eos.io

var db = null;
var block_producers_collection = [];
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

//var block_producers = new Set()
var first_run = true;

function inspectChain()
{
    /*
     block_producers_collection.find({}).sort({'name': 1}).toArray(function(err, result) {
       if (err) throw err;
       //console.log('block producers in mongodb=', result);
     });
    */

    /*
    //console.log('Known block producers =', block_producers);
    eos.getInfo({}).then(
        (result) => {
                     for (var i = result.last_irreversible_block_num; i > result.last_irreversible_block_num - 21 * 9 && i >= 0; i--) {
                         //eos.getBlock(i).then(result => { block_producers.add(result.producer); })
                         eos.getBlock(i).then(result => { //console.log('getBlock esult.producer=', result.producer);
                                                          block_producers_collection.replaceOne({'id': result.producer}, {'id': result.producer,
                                                                                                 'name': result.producer,
                                                                                                 'votes': 0,
                                                                                                 'statement': ''}, {upsert: true});
                                                         });
                     }
                     setTimeout(inspectChain, (first_run ? 5 : 60) * 1000);
                     first_run = false;
                    }).catch(
        (result) => {
                     setTimeout(inspectChain, 5 * 1000);
                    })
    */

    //console.log('Getting block producers');
    //console.log('Calling getAccount');
    //eos.getAccount('alskjdfhls').then((results) => { console.log('results=', results); });
    //eos.getTableRows({'json': true, 'code': 'eosio', 'scope': 'eosio', 'table': 'voteproducers', 'table_key': 'voter', 'lower_bound': 'block21genic', 'upper_bound': 'block21genic', 'limit': 10}).then(

    /*
    eos.getTableRows({'json': true, 'code': 'eosio', 'scope': 'eosio', 'table': 'voters', 'limit': 100}).then(
        (result) => {
                     console.log('getTableRows returned rows= ', result.rows);
                     console.log('getTableRows returned rows.length= ', result.rows.length);
                     var fun = result.rows.filter((x) => x.producers.length > 1);
                     console.log('fun=', fun);
                    }
        ).catch(
            (result) => {
                        console.error('Error result=', result);
                        }
        );
    */


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
                //console.log('getTableRows active_block_producers=', active_block_producers);
                for (let i = 0 ; i < result.rows.length ; i++ ) {
                    let producer_info = result.rows[i];
                    //console.log('Adding producer_info.owner=', producer_info.owner);
                    //console.log('typeof producer_info.total_votes=', typeof producer_info.total_votes);
                    //console.log('producer_info=', producer_info);
                    /*
                    block_producers_collection.replaceOne({'id': producer_info.owner}, {'id': producer_info.owner,
                                                                                        'name': producer_info.owner,
                                                                                        'votes': producer_info.total_votes,
                                                                                        'statement': producer_info.url}, {upsert: true});
                    */
                }
                 //setTimeout(inspectChain, (first_run ? 5 : 60) * 1000);
                 //first_run = false;
                 setTimeout(inspectChain, 5 * 1000);
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
                //console.log('Getting block to trim', key);
                blocks_to_remove.push(key);
                }
            });

        // Delete old blocks from the in memory list
        for (let i = 0 ; i < blocks_to_remove.length ; i++) {
            //console.log('Trimming key ', blocks_to_remove[i]);
            delete recent_blocks[blocks_to_remove[i]];
        }

        // Download the blocks we are missing
        var blocks_to_download = [];
        for (let i = head_block_num; i >= last_irreversible_block_num - 63 && i >= 0 ; i--) {
            if (!(i in recent_blocks)) {
                //console.log('Block ', i, ' not in the list downloading it');
                eos.getBlock(i).then((result) => {
                                                   recent_blocks[result.block_num] = result;
                                                 });
            }
        }
    }).catch(
        (result) => {
                    console.error('Error result=', result);
                     setTimeout(inspectChain, 5 * 1000);
                    });

    
}

inspectChain();
 
// All API methods print help when called with no-arguments.
//eos.getBlock()
 
// Next, your going to need eosd running on localhost:8888

//eos.getInfo() 
//eos.getInfo({}).then(result => console.log(result)).catch(result => console.error(result))
//inspectChain();
 
// If a callback is not provided, a Promise is returned
/*
eos.getBlock(1).then(result => {console.log(result)})
 
// Parameters can be sequential or an object
eos.getBlock({block_num_or_id: 1}).then(result => console.log(result))
 
// Callbacks are similar
callback = (err, res) => {err ? console.error(err) : console.log(res)}
eos.getBlock(1, callback)
eos.getBlock({block_num_or_id: 1}, callback)
 
// Provide an empty object or a callback if an API call has no arguments
eos.getInfo({}).then(result => {console.log(result)})
*/
 

/*
console.log('Attempt to retreive block producer info from the eosio system contract');
eos.getTableRows({'json': true, 'code': 'eosio', 'scope': 'eosio', 'table': 'producers', 'limit': 500}).then(
    (result) => {
        console.log(result);
        console.log('result.length=',result.rows.length);
    }
);
*/
