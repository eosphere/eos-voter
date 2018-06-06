// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details
// This file is a base class for all eosvoter modals
let exports = module.exports = {};

var m = require("mithril");
var {EosVoterModal} = require('./eosvoter-modal.js');

class DetectScatterModal extends EosVoterModal {
    get_internal_content() {
        return [
                 m('h2', {'style': {'text-align': 'center'}}, 'Detecting Scatter'),
               ];
    }
}

exports.DetectScatterModal = DetectScatterModal;

