var config = require('./config.global');

// Jungle TestNet
// IP address or Domain of the API end point

/*
config.chain_addr = 'dev.cryptolions.io'
// Port to connect to the API
config.chain_port = '38888'
// Protocol to use. Valid choices are http or https
config.protocol = 'http'
config.chain_secure_port = '38888'
*/

/*
config.chain_addr = 'node1.eosphere.io'
// Port to connect to the API
config.chain_port = '443'
// Protocol to use. Valid choices are http or https
config.protocol = 'https'
config.chain_secure_port = '443'
*/

/*
config.chain_addr = 'jungle.eosphere.io'
// Port to connect to the API
config.chain_port = '8888'
// Protocol to use. Valid choices are http or https
config.protocol = 'http'
// If we are using https we need a different port here
config.chain_secure_port = '8888'
*/


config.chain_addr = 'jungle.eosphere.io'
// Port to connect to the API
config.chain_port = '8888'
// Protocol to use. Valid choices are http or https
config.protocol = 'https'
// If we are using https we need a different port here
config.chain_secure_port = '443'


/*
config.chain_addr = 'bp.libertyblock.io'
// Port to connect to the API
config.chain_port = '8890'
// Protocol to use. Valid choices are http or https
config.protocol = 'https'
*/

// User readable name for the chain
config.chain_name = 'Jungle TestNet';


// eosio.sj TestNet
/*
// IP address or Domain of the API end point
config.chain_addr = '13.251.3.82'
// Port to connect to the API
config.chain_port = '8888'
// Protocol to use. Valid choices are http or https
config.protocol = 'http'
config.chain_secure_port = '8888'

// User readable name for the chain
config.chain_name = 'Eosio.sg';
*/

module.exports = config;

