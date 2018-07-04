// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details
let exports = module.exports = {};

var m = require("mithril");
var {EosVoterModal} = require('./eosvoter-modal.js');
var globals = require('./globals.js');
var eosjs = require('eosjs');
//var {modal_stack} = require('./eosvoter-modal.js');
var {OKModal} = require('./ok-modal.js');
var {errorDisplay} = require('./error-modal.js');

class UnstakeModal extends EosVoterModal {
    constructor(vnode) {
        super(vnode);
        this.delegated_cpu_weight = vnode.attrs.delegated_cpu_weight;
        this.delegated_net_weight = vnode.attrs.delegated_net_weight;
        this.balance = vnode.attrs.balance;
        this.is_staking = false;
        this.new_delegated_cpu_weight = '0';
        this.new_delegated_net_weight = '0';
    }

    can_close() { return !this.is_staking; };

    unstake_now() {
        if (this.is_staking)
            return;
        this.is_staking = true;

    const requiredFields = {
        accounts:[ globals.network ],
    };
    globals.scatter.suggestNetwork(globals.network).then((result) => {
        globals.scatter.getIdentity(requiredFields).then(identity => {
            // Set up any extra options you want to use eosjs with.
            // Get a reference to an 'Eosjs' instance with a Scatter signature provider.
            var eos = globals.scatter.eos( globals.network_secure, eosjs.Localnet, globals.eosOptions, globals.chain_protocol );
            eos.contract('eosio', requiredFields).then(c => {
                c.undelegatebw(identity.accounts[0].name, identity.accounts[0].name, this.new_delegated_net_weight + ' EOS', this.new_delegated_cpu_weight + ' EOS')
                    .then((result) => {
                    console.log('delegatebw result=', result);
                    this.owner.push_modal([OKModal, {owner: this.owner, info_message: 'Unstaking was succesful. Transaction id = \'' + result.transaction_id + '\'. Unstaked coins take 3 days to become available.'}, null]);
                    m.redraw();
                    })
                    .catch(e => {
                        errorDisplay(this.owner, 'eosio.delegatebw returned an error', e);
                        console.log('delegatebw error e=', e)
                    });
                })
                .catch(e => {
                    errorDisplay(this.owner, 'get contract returned an error', e);
                    console.log('contract error e=', e)
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
                 m('h2', {'style': {'text-align': 'center'}}, 'Unstake your EOS'),
                 m('div', {'style': {'width': '100%', 'height': 'calc(100% - 120px - 49px)'}}, [
                   m('p', {'class': 'constitution-agreement-text', 'style': {'text-align': 'center', 'color': 'red'}}, [
                     'By unstaking you are agreeing to the ',
                     m('a', {'class': 'constitution-agreement-link',
                             'href': 'https://github.com/EOS-Mainnet/governance/blob/master/eosio.system/eosio.system-clause-constitution-rc.md',
                             'target': '_blank'},
                             'EOS Constitution detailed here'),
                   ]),
                   m('h2', {'style': {'text-align': 'center'}}, 'You must unstake EOS from CPU and Net to trade'),
                   ((this.delegated_cpu_weight == 0 && this.delegated_net_weight == 0) ? [
                     m('h2', {'style': {'text-align': 'center', 'color': 'red'}}, 'You currently have no staked EOS'),
                   ]:[]),
                   m("p", 'Your available EOS balance is ' + this.balance + ' EOS.'),
                   m("p", 'You currently have ' + this.delegated_cpu_weight + ' EOS staked to CPU.'),
                   m("p", 'You currently have ' + this.delegated_net_weight + ' EOS staked to Net.'),
                   m("p", 'Enter the number of EOS tokens you wish to remove from the stake and return to your account.'),
                   m('div', {'style': {'margin-bottom': '3px'}}, [
                     m('div', {'style': {'width': '160px', 'display': 'inline-block'}}, [
                       m('label', {'for': 'id-CPU-stake'}, 'CPU amount to unstake'),
                     ]),
                     m('input', {'type': 'text', 'id': 'id-CPU-stake',
                                 'value': this.new_delegated_cpu_weight,
                                 'onchange': (e) => { this.new_delegated_cpu_weight = e.target.value; },
                                 }),
                     m('span', {'style': {'margin-left': '3px'}}, 'EOS'),
                   ]),
                   m('div', {'style': {'margin-bottom': '3px'}}, [
                     m('div', {'style': {'width': '160px', 'display': 'inline-block'}}, [
                       m('label', {'for': 'id-Net-stake'}, 'Net amount to unstake'),
                     ]),
                     m('input', {'type': 'text', 'id': 'id-Net-stake',
                                 'value': this.new_delegated_net_weight == 'Unknown' ? '0' : this.new_delegated_net_weight,
                                 'onchange': (e) => { this.new_delegated_net_weight = e.target.value; },
                                }),
                     m('span', {'style': {'margin-left': '3px'}}, 'EOS'),
                   ]),

                 ]),
                 m('div', {'style': {'width': '100%', 'height': '120px'}}, [
                   m('div', {'style': {'text-align': 'center'}}, [
                     m("Button", {'class': 'big-vote-now-button', 'onclick': e => this.unstake_now()},
                       (this.is_staking == false ? "Unstake EOS" : [
                       m('span', {'style': {'display': 'inline-block'}}, "Unstaking"),
                       m('div', {'class': 'loader', 'style': {'display': 'inline-block', 'margin-left': '5px'}}),
                     ])),
                   ]),
                   m('div', [
                     m("a", {'class': 'vote-helper-button popup-cancel-button', 'href': '#!'
                              }, "Cancel"),
                   ]),
                 ]),
               ]
    }
}

exports.UnstakeModal = UnstakeModal;
