// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details
let exports = module.exports = {};

let {VoteView} = require('./vote-view.js');
let {VoteModal} = require('./vote-modal.js');
let m = require("mithril");
var globals = require('./globals.js');
var {EosVoterModal} = require('./eosvoter-modal.js');

function get_bp_region(bp_name) {
    let all_bps = globals.active_block_producers.concat(globals.backup_block_producers);
    let matching_bps = all_bps.filter((x) => x.name == bp_name);
    if (matching_bps.length !== 1)
        return '';
    return matching_bps[0].region;
}

class MoreInfoMyVotesModal extends EosVoterModal {
    constructor(vnode) {
        super(vnode);
        this.proxy_name = vnode.attrs.proxy_name;
        this.votes = vnode.attrs.votes;
    }

    can_close() { return !this.is_voting; };

    get_internal_content() {

        let region_map = {};

        for (let i = 0; i < globals.votes.length ; i++ ) {
            let bp_name = globals.votes[i];
            let region = get_bp_region(bp_name);
            if (!(region in region_map)) {
                region_map[region] = [bp_name];
            } else {
                region_map[region].push(bp_name);
            }
        }

        let region_map2 = {};
        Object.keys(region_map).map(function(key, index) {
           region_map2[key] = region_map[key].join(', ');
        });
        let region_names = Object.keys(region_map);
        region_names.sort();


        return [
                 m('h2', {'style': {'text-align': 'center'}}, 'You are voting for the following block producers'),
                 m('div', {'style': {'width': '100%', 'height': 'calc(100% - 120px - 49px)'}}, [
                 ].concat(
                   (globals.votes.length > 0 ?
                     region_names.map((x) => {
                       let region_name = x == '' ? 'Not set' : x;
                       return  [
                                 m('h3', region_name),
                                 m('p', region_map2[x])
                               ];
                     })
                   :
                       [ m('h2', {'style': {'text-align':'center'}}, 'You are voting for no block producer') ]
                   ))),
                 m('div', {'style': {'width': '100%', 'height': '120px'}}, [
                 ].concat([
                   m('div', [
                     m("a", {'class': 'vote-helper-button popup-cancel-button', 'href': '#!'
                             }, "Cancel"),
                   ]),
                 ])),
               ];
    }
}


class MoreInfoMyVotesView extends VoteView {
  oncreate() {
    super.oncreate();
    //this.push_modal([VoteModal, {owner: this, proxy_name: this.proxy_name, votes: globals.votes}, null]);
  }
  get_current_modal() {
    let ret =  super.get_current_modal();
    if (ret.length === 0) {
      let inst = m(MoreInfoMyVotesModal, {owner: this, proxy_name: globals.proxy_name, votes: globals.votes});
      return [inst];
    } else {
      return ret;
    }
  }
}
exports.MoreInfoMyVotesView = MoreInfoMyVotesView
