// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details
let exports = module.exports = {};

var m = require("mithril");
var {EosVoterModal} = require('./eosvoter-modal.js');

class NotDetectedModal extends EosVoterModal {
    canclose() { return false; };
    get_internal_content() {
    return [
             m('h2', 'You need to install Scatter'),
             m('a', { href: 'https://scatter-eos.com', target: '_blank'}, 'Download scatter'),
             m('h2', 'Go back'),
             m('a', { href: '/'}, 'Go back'),
           ];
    }
}

exports.NotDetectedModal = NotDetectedModal;
