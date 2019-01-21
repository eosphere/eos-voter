// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details
let exports = module.exports = {};
let globals = require('./globals.js');

function float_to_eos(f) {
  //return a float as a correctly formatted EOS amount
  return parseFloat(f).toFixed(4) + ' ' + globals.token_symbol;
}

function get_network() {
  if (globals.has_scatter_extension) {
    return globals.network;
  } else {
    let network = Object.assign({}, globals.network);
    network.port = globals.network_secure.port;
    return network;
  }
}

exports.float_to_eos = float_to_eos;
exports.get_network = get_network;
