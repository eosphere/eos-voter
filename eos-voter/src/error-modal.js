// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details
let exports = module.exports = {};

var m = require("mithril");
var {EosVoterModal, modal_stack} = require('./eosvoter-modal.js');

class ErrorModal extends EosVoterModal {
    constructor(vnode) {
        super(vnode);
        this.error_messages = vnode.attrs.error_messages;
        this.show_retry = vnode.attrs.show_retry;
    }
    canclose() { return false; };
    retry_now() {
        document.location.reload(true)
    }
    get_internal_content() {
        return [
                 m('h2', {'style': {'text-align': 'center'}}, 'Error'),
                 this.error_messages.map((message) => m('p', {'class': 'error-paragraph'}, message)),
                (this.show_retry ? [
                   m('div', {'style': {'text-align': 'center'}}, [
                     m("Button", {'class': 'big-vote-now-button', 'onclick': e => this.retry_now()}, "Retry"),
                   ]),
                ] : []),
               ];
    }
}

function errorDisplay(description, e) {
    console.log('errorDisplay e=', e);
    let message = 'Null message';
    let details = 'Null details';
    try {
        let error = JSON.parse(e['message']);
        try {
            message = error.message;
        } catch (e2) {
            // Silently ignore if message does not exists
        }
        try {
            details = error.error.details.map((d) => d.message).join(' ');
        } catch (e2) {
            // Silently ignore if error details does not exists
        }
    } catch (e2) {
        // Silently ignore if error details does not exists Ie because the error message isn't JSON
        message = e;
    }
    modal_stack.push_modal([ErrorModal, {error_messages: [description, 'Message:' + message, 'Details: ' + details], show_retry: false}, null]);
    m.redraw();
}

exports.ErrorModal = ErrorModal;
exports.errorDisplay = errorDisplay;

