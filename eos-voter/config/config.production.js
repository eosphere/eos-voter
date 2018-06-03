var config = require('./config.global');

// IP address or Domain of the API end point
config.chain_addr = '13.251.3.82'
// Port to connect to the API
config.chain_port = '8888'
// Protocol to use. Valid choices are http or https
config.protocol = 'http'
// If https should be the secure port otherwise the same port as chain_port
config.chain_secure_port = '8888'

// User readable name for the chain
config.chain_name = 'Eosio.sg TestNet';

module.exports = config;
