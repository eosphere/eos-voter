// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details
// This file is a base class for all eosvoter modals
let exports = module.exports = {};
var globals = require('./globals.js');

//import m from "mithril";
var m = require("mithril");

class ModalStackMixin {
    // Inherit from this to get the modal stack in your view
    constructor() {
        this.pop_listener_fn = null;
        this.modal_stack = [];
    };

    set_pop_listener_fn(fn) {
        this.pop_listener_fn = fn;
    }

    push_modal(modal) {
        // Push a modal onto the stack
        this.modal_stack.push(modal);
    }

    pop_modal() {
        //pops the top modal off the stack
        this.modal_stack.pop();
        if (this.pop_listener_fn) {
            this.pop_listener_fn();
        }
    }

    is_empty() {
        return this.modal_stack.length == 0;
    }

    get_top() {
        return this.modal_stack.slice(-1)[0];
    }

    pop_entire_stack() {
        while (!this.is_empty()) {
            this.pop_modal();
        }
    }

    get_current_modal() {
        if (this.is_empty()) return [];
        // Returns the modal on the top of the stack
        let top = this.get_top();
        let inst = m(top[0] /*the class*/, top[1] /* the params*/);
        return [inst];
    }
}

exports.ModalStackMixin = ModalStackMixin;

class EosVoterModal {
    constructor(vnode) {
      this.owner = vnode.attrs.owner;
    }

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
        if (this.can_close()) this.force_close();
    }

    force_close() {
        this.owner.pop_modal();
    }
}

exports.EosVoterModal = EosVoterModal;
