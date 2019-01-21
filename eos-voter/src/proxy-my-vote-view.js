// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details
let exports = module.exports = {};

let {VoteView} = require('./vote-view.js');
let m = require("mithril");
var {EosVoterModal} = require('./eosvoter-modal.js');
var {errorDisplay} = require('./error-modal.js');
var eosjs = require('eosjs');
var {OKModal} = require('./ok-modal.js');

let ScatterJS = require('scatterjs-core');
let ScatterEOS = require('scatterjs-plugin-eosjs');
let Eos = require('eosjs');
ScatterJS = ScatterJS.default;
ScatterEOS = ScatterEOS.default;
ScatterJS.plugins( new ScatterEOS() );

let globals = require('./globals.js');
let utils = require('./utils.js');

class ProxyMyVote extends EosVoterModal {
    constructor(vnode) {
        super(vnode);
        this.delegated_cpu_weight = vnode.attrs.delegated_cpu_weight;
        this.delegated_net_weight = vnode.attrs.delegated_net_weight;
        this.balance = vnode.attrs.balance;
        this.is_processing = false;
        this.proxy_name = globals.proxy_name;
    }

    can_close() { return !this.is_processing; };

    proxy_now() {
        if (this.is_processing)
            return;
        this.is_processing = true;

        if (this.proxy_name == '') {
          this.owner.push_modal([OKModal, {
            owner: this.owner,
            info_message: 'Your proxy was cleared you can now cast a standard vote.',
          }]);
          globals.proxy_name = '';
          return;
        }

    const requiredFields = {
        accounts:[ utils.get_network() ],
    };
    ScatterJS.scatter.suggestNetwork(globals.network_secure).then((result) => {
        ScatterJS.scatter.getIdentity(requiredFields).then(identity => {

            var eos = ScatterJS.scatter.eos(utils.get_network(), Eos, globals.eosjsOptions, globals.chain_protocol);

            eos.contract('eosio', requiredFields).then(c => {
                    const account = identity.accounts[0];
                    const transactionOptions = { authorization:[`${account.name}@${account.authority}`] };
                    eos.voteproducer({'voter': identity.accounts[0].name,
                                      'proxy': this.proxy_name,
                                      'producers': this.proxy_name != '' ? [] : this.votes}, transactionOptions )
                        .then((result) => {
                            console.log('voteproducer result=', result);
                            this.owner.push_modal([OKModal, {
                              owner: this.owner,
                              info_message: 'Your vote was submitted successfully.\n Transaction id = \'' + result.transaction_id + '\'',
                            }]);
                            globals.proxy_name = this.proxy_name;
                            m.redraw();
                        })
                        .catch((error) => {
                            console.error('voteproducer error=', error);
                            errorDisplay(this.owner, 'eosio.voteproducer returned an error', error);
                        })
                })
                .catch(e => {
                    errorDisplay('get contract returned an error', e);
                    console.log(this.owner, 'contract error e=', e)
                });
            })
            .catch(e => {
                errorDisplay('getidentity returned an error', e);
                console.log(this.owner, 'getidentity error e=', e)
            });
        })
        .catch(e => {
            errorDisplay('suggestNetwork returned an error', e);
            console.log(this.owner, 'suggestNetwork error e=', e)
        });
    }

    get_internal_content() {
        return [
                 m('h2', {'style': {'text-align': 'center'}}, 'Proxy your Vote'),
                 m('div', {'style': {'width': '100%', 'height': 'calc(100% - 120px - 49px)'}}, [
                   m('p', {'class': 'constitution-agreement-text', 'style': {'text-align': 'center', 'color': 'red'}}, [
                     'By Proxying and voting you are agreeing to the ',
                     m('a', {'class': 'constitution-agreement-link',
                             'href': 'https://resources.telosfoundation.io/governance_documents/TBNOA_Adopted_2018-11-20.pdf',
                             'target': '_blank'},
                             'Telos network operators agreement detailed here'),
                   ]),
                   m('p', 'Proxy you vote to another account.'),
                   m('div', {'style': {'margin-bottom': '3px'}}, [
                     m('div', {'style': {'width': '140px', 'display': 'inline-block'}}, [
                       m('label', {'for': 'id-CPU-stake'}, 'Destination account'),
                     ]),
                     m('input', {'type': 'text', 'id': 'id-destination-account',
                                 'value': this.proxy_name,
                                 'onchange': (e) => { this.proxy_name = e.target.value; },
                                 }),
                   ]),

                 ]),
                 m('div', {'style': {'width': '100%', 'height': '120px'}}, [
                   m('div', {'style': {'text-align': 'center'}}, [
                     m("Button", {'class': 'big-vote-now-button', 'onclick': e => this.proxy_now()},
                       (this.is_processing == false ? "Proxy Now" : [
                       m('span', {'style': {'display': 'inline-block'}}, "Proxying"),
                       m('div', {'class': 'loader', 'style': {'display': 'inline-block', 'margin-left': '5px'}}),
                     ])),
                   ]),
                   m('div', [
                     m("a", {'class': 'vote-helper-button popup-cancel-button', 'href': '#!', 'onclick': (e) => {m.route.set('#!');}
                              }, "Cancel"),
                   ]),
                 ]),
               ]
    }
}

class ProxyView extends VoteView {
  oncreate() {
    super.oncreate();
  }
  get_current_modal() {
    let ret =  super.get_current_modal();
    if (ret.length === 0) {
      let inst = m(ProxyMyVote, {owner: this,
        delegated_cpu_weight: globals.delegated_cpu_weight,
        delegated_net_weight: globals.delegated_net_weight,
        balance: globals.balance});
      return [inst];
    } else {
      return ret;
    }
  }
}
exports.ProxyView = ProxyView
