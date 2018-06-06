// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details
// This file is a base class for all eosvoter modals
let exports = module.exports = {};
var globals = require('./globals.js');

//import m from "mithril";
var m = require("mithril");


class EosVoterModal {
    view() {
       return m('.dialog', {'onclick': e => this.close()},
         m('.dialogContent', {'onclick': e => e.stopPropagation()}, [
           m('div', {'class': 'scatterPopupText'}, this.get_internal_content()),
         ]),
       );
    }

    can_close() { return true; };

    close() {
        // This assumes we are the top modal on the stack
        if (this.can_close()) globals.modal_stack.pop();
    }
}


exports.EosVoterModal = EosVoterModal;


