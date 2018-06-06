// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details
// This file is a base class for all eosvoter modals
let exports = module.exports = {};

//import m from "mithril";
var m = require("mithril");


class EosVoterModal {
    view() {
       return m('.dialog', 
         m('.dialogContent', [
           m('div', {'class': 'scatterPopupText'}, this.get_internal_content()),
         ]),
       );
    }


}


exports.EosVoterModal = EosVoterModal;


