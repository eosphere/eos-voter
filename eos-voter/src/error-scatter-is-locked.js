// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details
let exports = module.exports = {};

var m = require("mithril");
var {EosVoterModal} = require('./eosvoter-modal.js');
var {modal_stack} = require('./eosvoter-modal.js');

class ErrorScatterIsLocked extends EosVoterModal {
    canclose() { return false; };
    retry_now() {
        document.location.reload(true)
    }
    get_internal_content() {
        return [
                 m('h2', {'style': {'text-align': 'center'}}, 'Error'),
                 m('p', {'class': 'error-paragraph'}, 'Scatter is locked. Please unlock it and then retry'),
                 m('div', {'style': {'text-align': 'center'}}, [
                   m("Button", {'class': 'big-vote-now-button', 'onclick': e => this.retry_now()}, "Retry"),
                 ]),
               ];
    }
}

exports.ErrorScatterIsLocked = ErrorScatterIsLocked;

