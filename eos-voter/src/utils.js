// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details
let exports = module.exports = {};

function float_to_eos(f) {
  //return a float as a correctly formatted EOS amount
  return parseFloat(f).toFixed(4) + ' EOS';
}

exports.float_to_eos = float_to_eos;
