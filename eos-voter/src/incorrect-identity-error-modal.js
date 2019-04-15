// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details
let exports = module.exports = {};

var m = require("mithril");
var {EosVoterModal} = require('./eosvoter-modal.js');
let globals = require('./globals.js');

class IncorrectIdentityErrorModal extends EosVoterModal {
    constructor(vnode) {
        super(vnode);
        this.error_messages = vnode.attrs.error_messages;
        this.show_retry = vnode.attrs.show_retry;
    }
    canclose() { return false; };
    change_identity() {
      globals.scatter.forgetIdentity().then(
        () => { globals.has_loaded = false;
                globals.account_name = '';
                this.owner.pop_modal(); })
    }
    get_internal_content() {
        return [
                 m('h2', {'style': {'text-align': 'center'}}, 'Error'),
                 m('div', {'style': {'width': '100%', 'height': 'calc(100% - 46px - 49px)'}}, [
                   this.error_messages.map((message) => m('p', {'class': 'error-paragraph'}, message)),
                  (this.show_retry ? [
                     m('div', {'style': {'text-align': 'center'}}, [
                       m("Button", {'class': 'big-vote-now-button', 'onclick': e => this.change_identity()}, "Change Identity"),
                     ]),
                  ] : []),
                ]),
                m('div', [
                  m("a", {'class': 'vote-helper-button popup-cancel-button', 'href': '#!', 'onclick': (e) => {m.route.set('#!');}
                }, "Close"),
                ]),
               ];
    }
}

exports.IncorrectIdentityErrorModal = IncorrectIdentityErrorModal;
