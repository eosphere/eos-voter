Eos = require('eosjs') // Eos = require('./src')
 
// eos = Eos.Localnet() // 127.0.0.1:8888

var options = {
  httpEndpoint: 'http://jungle.cryptolions.io:8888', // default
  debug: false,
  fetchConfiguration: {}
}


eos = Eos.Testnet(options) // testnet at eos.io

var block_producers = new Set()

function inspectChain()
{
    console.log('Known block producers =', block_producers);
    eos.getInfo({}).then(
        (result) => {
                     //result.last_irreversible_block_num:
                     //console.log(result);
                     for (var i = result.last_irreversible_block_num; i > result.last_irreversible_block_num - 21 * 9 && i >= 0; i--) {
                         //console.log('querying block i=', i);
                         //eos.getBlock(i).then(result => { block_producers.add(result.producer); console.log('Result returned result=', result.block_num, ' result.producer=', result.producer); })
                         eos.getBlock(i).then(result => { block_producers.add(result.producer); })
                     }
                     //console.log('block_producers.length=', block_producers.size);
                     setTimeout(inspectChain, (block_producers.size == 0 ? 5 : 60) * 1000);
                    }).catch(
        (result) => {
                     //console.error(result);
                     setTimeout(inspectChain, 5 * 1000);
                    })
}
 
// All API methods print help when called with no-arguments.
//eos.getBlock()
 
// Next, your going to need eosd running on localhost:8888

//eos.getInfo() 
//eos.getInfo({}).then(result => console.log(result)).catch(result => console.error(result))
inspectChain();
 
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
 
