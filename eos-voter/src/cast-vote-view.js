// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details
let exports = module.exports = {};

let {VoteView} = require('./vote-view.js');
let {VoteModal} = require('./vote-modal.js');
let m = require("mithril");
var globals = require('./globals.js');

class CastVoteView extends VoteView {
  oncreate() {
    super.oncreate();
    //this.push_modal([VoteModal, {owner: this, proxy_name: this.proxy_name, votes: this.votes}, null]);
  }
  get_current_modal() {
    let ret =  super.get_current_modal();
    if (ret.length === 0) {
      let inst = m(VoteModal, {owner: this, proxy_name: globals.proxy_name, votes: globals.votes});
      return [inst];
    } else {
      return ret;
    }
  }
}
exports.CastVoteView = CastVoteView
