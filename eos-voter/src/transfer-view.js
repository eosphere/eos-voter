// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details
let exports = module.exports = {};

let {VoteView} = require('./vote-view.js');
let {StakeModal} = require('./stake-modal.js');
let m = require("mithril");
var {EosVoterModal} = require('./eosvoter-modal.js');
var {errorDisplay} = require('./error-modal.js');
var eosjs = require('eosjs');
var {OKModal} = require('./ok-modal.js');
var {float_to_eos} = require('./utils.js');

let ScatterJS = require('scatterjs-core');
let ScatterEOS = require('scatterjs-plugin-eosjs');
let Eos = require('eosjs');
ScatterJS = ScatterJS.default;
ScatterEOS = ScatterEOS.default;
ScatterJS.plugins( new ScatterEOS() );

let globals = require('./globals.js');
let utils = require('./utils.js');

class TransferModal extends EosVoterModal {
    constructor(vnode) {
        super(vnode);
        this.delegated_cpu_weight = vnode.attrs.delegated_cpu_weight;
        this.delegated_net_weight = vnode.attrs.delegated_net_weight;
        this.balance = vnode.attrs.balance;
        this.is_transfering = false;
        this.transfer_amount = '0';
        this.destination_account = '';
        this.memo_field = '';
    }

    can_close() { return !this.is_transfering; };

    stake_now() {
        if (this.is_transfering)
            return;
        this.is_transfering = true;

    const requiredFields = {
        accounts:[ utils.get_network() ],
    };
    ScatterJS.scatter.suggestNetwork(globals.network_secure).then((result) => {
        ScatterJS.scatter.getIdentity(requiredFields).then(identity => {
            // Set up any extra options you want to use eosjs with.
            // Get a reference to an 'Eosjs' instance with a Scatter signature provider.
            var eos = ScatterJS.scatter.eos(utils.get_network(), Eos, globals.eosjsOptions, globals.chain_protocol);
              eos.transfer(identity.accounts[0].name, this.destination_account, float_to_eos(this.transfer_amount), this.memo_field)
                  .then((result) => {
                  console.log('transfer result=', result);
                  this.owner.push_modal([OKModal, {owner: this.owner, info_message: 'Transfer was succesful. Transaction id = \'' + result.transaction_id + '\''}]);
                  m.redraw();
                  })
                  .catch(e => {
                      errorDisplay(this.owner, 'eosio.transfer returned an error', e);
                      console.log('transfer error e=', e)
                  });
            })
            .catch(e => {
                errorDisplay(this.owner, 'getidentity returned an error', e);
                console.log('getidentity error e=', e)
            });
        })
        .catch(e => {
            errorDisplay(this.owner, 'suggestNetwork returned an error', e);
            console.log('suggestNetwork error e=', e)
        });
    }

    get_internal_content() {
        return [
                 m('h2', {'style': {'text-align': 'center'}}, 'Transfer your ' + globals.token_symbol + '.'),
                 m('div', {'style': {'width': '100%', 'height': 'calc(100% - 120px - 49px)'}}, [
                   m('p', {'class': 'constitution-agreement-text', 'style': {'text-align': 'center', 'color': 'red'}}, [
                     'By sending EOS you are agreeing to the ',
                     m('a', {'class': 'constitution-agreement-link',
                             'href': 'https://resources.telosfoundation.io/governance_documents/TBNOA_Adopted_2018-11-20.pdf',
                             'target': '_blank'},
                             'Telos network operators agreement detailed here'),
                   ]),
                   m('p', 'Send ' + globals.token_symbol + ' to another account.'),
                   m("p", 'Your available EOS balance is ' + this.balance + ' ' + globals.token_symbol + '.'),
                   m("p", 'You currently have ' + this.delegated_cpu_weight + ' ' + globals.token_symbol + ' staked to CPU.'),
                   m("p", 'You currently have ' + this.delegated_net_weight + ' ' + globals.token_symbol + ' staked to Net.'),
                   m('div', {'style': {'margin-bottom': '3px'}}, [
                     m('div', {'style': {'width': '140px', 'display': 'inline-block'}}, [
                       m('label', {'for': 'id-CPU-stake'}, 'Destination account'),
                     ]),
                     m('input', {'type': 'text', 'id': 'id-destination-account',
                                 'value': this.destination_account,
                                 'onchange': (e) => { this.destination_account = e.target.value; },
                                 }),
                   ]),
                   m('div', {'style': {'margin-bottom': '3px'}}, [
                     m('div', {'style': {'width': '140px', 'display': 'inline-block'}}, [
                       m('label', {'for': 'id-transfer-amount', 'style': {'width': '70px'}}, 'Amount'),
                     ]),
                     m('input', {'type': 'text', 'id': 'id-transfer-amount',
                                 'value': this.transfer_amount,
                                 'onchange': (e) => { this.transfer_amount = e.target.value; },
                                }),
                     m('span', {'style': {'margin-left': '3px'}}, globals.token_symbol),
                   ]),
                   m('div', {'style': {'margin-bottom': '3px'}}, [
                     m('div', {'style': {'width': '140px', 'display': 'inline-block'}}, [
                       m('label', {'for': 'id-memo-field', 'style': {'width': '70px'}}, 'Memo field'),
                     ]),
                     m('input', {'type': 'text', 'id': 'id-transfer-amount',
                                 'value': this.memo_field,
                                 'onchange': (e) => { this.memo_field = e.target.value; },
                                }),
                   ]),

                 ]),
                 m('div', {'style': {'width': '100%', 'height': '120px'}}, [
                   m('div', {'style': {'text-align': 'center'}}, [
                     m("Button", {'class': 'big-vote-now-button', 'onclick': e => this.stake_now()},
                       (this.is_transfering == false ? ('Transfer ' + globals.token_symbol + '.') : [
                       m('span', {'style': {'display': 'inline-block'}}, "Transfering"),
                       m('div', {'class': 'loader', 'style': {'display': 'inline-block', 'margin-left': '5px'}}),
                     ])),
                   ]),
                   m('div', [
                     m("a", {'class': 'vote-helper-button popup-cancel-button', 'href': '#!', 'onclick': (e) => {m.route.set('#!m');}
                              }, "Cancel"),
                   ]),
                 ]),
               ]
    }
}

class TransferView extends VoteView {
  oncreate() {
    super.oncreate();
  }
  get_current_modal() {
    let ret =  super.get_current_modal();
    if (ret.length === 0) {
      let inst = m(TransferModal, {owner: this,
        delegated_cpu_weight: globals.delegated_cpu_weight,
        delegated_net_weight: globals.delegated_net_weight,
        balance: globals.balance});
      return [inst];
    } else {
      return ret;
    }
  }
}
exports.TransferView = TransferView
