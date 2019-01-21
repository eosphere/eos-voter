// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details
let exports = module.exports = {};

var m = require("mithril");
var {EosVoterModal} = require('./eosvoter-modal.js');
var eosjs = require('eosjs');
//var {modal_stack} = require('./eosvoter-modal.js');
var {OKModal} = require('./ok-modal.js');
var {errorDisplay} = require('./error-modal.js');
var {float_to_eos} = require('./utils.js');

let ScatterJS = require('scatterjs-core');
let ScatterEOS = require('scatterjs-plugin-eosjs');
let Eos = require('eosjs');
ScatterJS = ScatterJS.default;
ScatterEOS = ScatterEOS.default;
ScatterJS.plugins( new ScatterEOS() );

let globals = require('./globals.js');
let utils = require('./utils.js');

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
        accounts:[ utils.get_network() ],
    };

    /*
    const network = ScatterJS.Network.fromJson({
        blockchain:'eos',
        chainId:'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
        host:'nodes.get-scatter.com',
        port:443,
        protocol:'https'
    });

    ScatterJS.connect('EosVoter - Eosphere.io', {network}).then(connected => {
        if(!connected) return console.error('no scatter');

        const eos = ScatterJS.eos(network, Eos);

        ScatterJS.login().then(id => {
            if(!id) return console.error('no identity');
            const account = ScatterJS.account('eos');
            const options = {authorization:[`${account.name}@${account.authority}`]};
            c.undelegatebw({'from':identity.accounts[0].name, 'receiver': identity.accounts[0].name,
                           'unstake_net_quantity': float_to_eos(this.new_delegated_net_weight),
                           'unstake_cpu_quantity': float_to_eos(this.new_delegated_cpu_weight)}).then(res => {
                console.log('sent: ', res);
            }).catch(err => {
                console.error('error: ', err);
            });
        });
    });*/

    ScatterJS.scatter.suggestNetwork(globals.network_secure).then((result) => {
    //ScatterJS.scatter.connect('EosVoter - eosphere.io').then(connected => {
    //     if(!connected) return false;
        ScatterJS.scatter.getIdentity(requiredFields).then(identity => {
            // Set up any extra options you want to use eosjs with.
            // Get a reference to an 'Eosjs' instance with a Scatter signature provider.
            var eos = ScatterJS.scatter.eos(utils.get_network(), Eos, globals.eosjsOptions, globals.chain_protocol);
            eos.contract('eosio', requiredFields).then(c => {
                const account = identity.accounts[0];
                const transactionOptions = { authorization:[`${account.name}@${account.authority}`] };
                c.undelegatebw({'from':account.name, 'receiver': account.name,
                               'unstake_net_quantity': float_to_eos(this.new_delegated_net_weight),
                               'unstake_cpu_quantity': float_to_eos(this.new_delegated_cpu_weight)}, transactionOptions)
                    .then((result) => {
                    //console.log('undelegatebw result=', result);
                    this.owner.push_modal([OKModal, {owner: this.owner, info_message: 'Unstaking was succesful. Transaction id = \'' + result.transaction_id + '\'. Unstaked coins take 3 days to become available.'}]);
                    m.redraw();
                    })
                    .catch(e => {
                        errorDisplay(this.owner, 'eosio.undelegatebw returned an error', e);
                        console.log('undelegatebw error e=', e)
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
                 m('h2', {'style': {'text-align': 'center'}}, 'Unstake your ' + globals.token_symbol + '.'),
                 m('div', {'style': {'width': '100%', 'height': 'calc(100% - 120px - 49px)'}}, [
                   m('p', {'class': 'constitution-agreement-text', 'style': {'text-align': 'center', 'color': 'red'}}, [
                     'By unstaking you are agreeing to the ',
                     m('a', {'class': 'constitution-agreement-link',
                             'href': 'https://resources.telosfoundation.io/governance_documents/TBNOA_Adopted_2018-11-20.pdf',
                             'target': '_blank'},
                             'Telos network operators agreement detailed here'),
                   ]),
                   m('h2', {'style': {'text-align': 'center'}}, 'You must unstake ' + globals.token_symbol + ' from CPU and Net to trade'),
                   ((this.delegated_cpu_weight == 0 && this.delegated_net_weight == 0) ? [
                     m('h2', {'style': {'text-align': 'center', 'color': 'red'}}, 'You currently have no staked ' + globals.token_symbol + '.'),
                   ]:[]),
                   m("p", 'Your available ' + globals.token_symbol + ' balance is ' + this.balance + ' ' + globals.token_symbol + '.'),
                   m("p", 'You currently have ' + this.delegated_cpu_weight + ' ' + globals.token_symbol + ' staked to CPU.'),
                   m("p", 'You currently have ' + this.delegated_net_weight + ' ' + globals.token_symbol + ' staked to Net.'),
                   m("p", 'Enter the number of ' + globals.token_symbol + ' tokens you wish to remove from the stake and return to your account.'),
                   m('div', {'style': {'margin-bottom': '3px'}}, [
                     m('div', {'style': {'width': '160px', 'display': 'inline-block'}}, [
                       m('label', {'for': 'id-CPU-stake'}, 'CPU amount to unstake'),
                     ]),
                     m('input', {'type': 'text', 'id': 'id-CPU-stake',
                                 'value': this.new_delegated_cpu_weight,
                                 'onchange': (e) => { this.new_delegated_cpu_weight = e.target.value; },
                                 }),
                     m('span', {'style': {'margin-left': '3px'}}, globals.token_symbol),
                   ]),
                   m('div', {'style': {'margin-bottom': '3px'}}, [
                     m('div', {'style': {'width': '160px', 'display': 'inline-block'}}, [
                       m('label', {'for': 'id-Net-stake'}, 'Net amount to unstake'),
                     ]),
                     m('input', {'type': 'text', 'id': 'id-Net-stake',
                                 'value': this.new_delegated_net_weight == 'Unknown' ? '0' : this.new_delegated_net_weight,
                                 'onchange': (e) => { this.new_delegated_net_weight = e.target.value; },
                                }),
                     m('span', {'style': {'margin-left': '3px'}}, globals.token_symbol),
                   ]),

                 ]),
                 m('div', {'style': {'width': '100%', 'height': '120px'}}, [
                   m('div', {'style': {'text-align': 'center'}}, [
                     m("Button", {'class': 'big-vote-now-button', 'onclick': e => this.unstake_now()},
                       (this.is_staking == false ? 'Unstake ' + globals.token_symbol + '.' : [
                       m('span', {'style': {'display': 'inline-block'}}, "Unstaking"),
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

exports.UnstakeModal = UnstakeModal;
