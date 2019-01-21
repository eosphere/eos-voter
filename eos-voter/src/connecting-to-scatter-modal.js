// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details
let exports = module.exports = {};

var m = require("mithril");
var {EosVoterModal} = require('./eosvoter-modal.js');

class ConnectingToScatter extends EosVoterModal {
    canclose() { return false; };
    get_internal_content() {
        return [
                 m('h2', {'style': {'text-align': 'center'}}, 'Connecting to Scatter'),
               ];
    }
}

exports.ConnectingToScatter = ConnectingToScatter;
