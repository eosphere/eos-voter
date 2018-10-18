// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details
// This file holds global state relating to the voting front end

let globals = module.exports = {};

globals.scatter = null;
globals.network = {};
globals.eosOptions = {};
globals.network_secure = {};
globals.registered_producers = new Set();
