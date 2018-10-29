// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details
let exports = module.exports = {};

var m = require("mithril");
var {EosVoterModal} = require('./eosvoter-modal.js');

class OKModal extends EosVoterModal {
    constructor(vnode) {
        super(vnode);
        this.info_message = vnode.attrs.info_message;
    }
    canclose() { return false; };
    ok_now() {
        document.location = "#!"
        m.route.set('#!');
        this.owner.forceRedrawAll();
    }
    get_internal_content() {
        return [
                 m('h2', {'style': {'text-align': 'center'}}, 'Success'),
                 m('p', {'class': 'error-paragraph'}, this.info_message),
                 m('div', {'style': {'text-align': 'center'}}, [
                   m("Button", {'class': 'big-vote-now-button', 'onclick': e => this.ok_now()}, "OK"),
                 ]),
               ];
    }
}

exports.OKModal = OKModal;
