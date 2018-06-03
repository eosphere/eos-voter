var config = require('./config.global');

// Jungle TestNet
// IP address or Domain of the API end point

/*
config.chain_addr = 'dev.cryptolions.io'
// Port to connect to the API
config.chain_port = '38888'
// Protocol to use. Valid choices are http or https
config.protocol = 'http'
*/

config.chain_addr = 'node1.eosphere.io'
// Port to connect to the API
config.chain_port = '443'
// Protocol to use. Valid choices are http or https
config.protocol = 'https'

/*
config.chain_addr = 'bp.libertyblock.io'
// Port to connect to the API
config.chain_port = '8890'
// Protocol to use. Valid choices are http or https
config.protocol = 'https'
*/

// User readable name for the chain
config.chain_name = 'Jungle Dawn 4.2 TestNet';


// eosio.sj TestNet
/*
// IP address or Domain of the API end point
config.chain_addr = '13.251.3.82'
// Port to connect to the API
config.chain_port = '8888'
// Protocol to use. Valid choices are http or https
config.protocol = 'http'

// User readable name for the chain
config.chain_name = 'Eosio.sg';
*/

module.exports = config;
