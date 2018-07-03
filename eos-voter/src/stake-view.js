// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details
let exports = module.exports = {};

let {VoteView} = require('./vote-view.js');
let {StakeModal} = require('./stake-modal.js');
let m = require("mithril");
var globals = require('./globals.js');

class StakeView extends VoteView {
  oncreate() {
    super.oncreate();
    //this.push_modal([VoteModal, {owner: this, proxy_name: this.proxy_name, votes: this.votes}, null]);
  }
  get_current_modal() {
    let ret =  super.get_current_modal();
    if (ret.length === 0) {
      let inst = m(StakeModal, {owner: this,
        delegated_cpu_weight: globals.delegated_cpu_weight,
        delegated_net_weight: globals.delegated_net_weight,
        balance: globals.balance});
      return [inst];
    } else {
      return ret;
    }
  }
}
exports.StakeView = StakeView
