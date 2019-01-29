var config = require('./config.global');

config.chain_addr = 'telos.eosphere.io'
// Port to connect to the API
config.chain_port = '443'
// Protocol to use. Valid choices are http or https
config.protocol = 'https'
// If we are using https we need a different port here
config.chain_secure_port = '443'

// User readable name for the chain
config.chain_name = 'Telos Mainnet';

config.mongodb_server = 'localhost';

module.exports = config;
