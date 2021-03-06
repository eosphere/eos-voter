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

class StakeModal extends EosVoterModal {
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

    stake_now() {
        if (this.is_staking)
            return;
        this.is_staking = true;

    const requiredFields = {
        accounts:[ utils.get_network() ],
    };
    globals.scatter.suggestNetwork(globals.network_secure).then((result) => {
        ScatterJS.scatter.getIdentity(requiredFields).then(identity => {
            // Set up any extra options you want to use eosjs with.
            // Get a reference to an 'Eosjs' instance with a Scatter signature provider.
            var eos = ScatterJS.scatter.eos(utils.get_network(), Eos, globals.eosjsOptions, globals.chain_protocol);
            eos.contract('eosio', requiredFields).then(c => {
                const account = identity.accounts[0];
                const transactionOptions = { authorization:[`${account.name}@${account.authority}`] };
                //console.log('deletegatebw this.new_delegated_net_weight=', this.new_delegated_net_weight)
                c.delegatebw(account.name, account.name,
                             float_to_eos(this.new_delegated_net_weight),
                             float_to_eos(this.new_delegated_cpu_weight), 0,
                             transactionOptions)
                    .then((result) => {
                    console.log('delegatebw result=', result);
                    this.owner.push_modal([OKModal, {owner: this.owner, info_message: 'Staking was succesful. Transaction id = \'' + result.transaction_id + '\''}]);
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
                 m('h2', {'style': {'text-align': 'center'}}, 'Stake your EOS'),
                 m('div', {'style': {'width': '100%', 'height': 'calc(100% - 120px - 49px)'}}, [
                   m('p', {'class': 'constitution-agreement-text', 'style': {'text-align': 'center', 'color': 'red'}}, [
                     'By staking EOS you are agreeing to the ',
                     m('a', {'class': 'constitution-agreement-link',
                             'href': 'https://github.com/EOS-Mainnet/governance/blob/master/eosio.system/eosio.system-clause-constitution-rc.md',
                             'target': '_blank'},
                             'EOS Constitution detailed here'),
                   ]),
                   m('h2', {'style': {'text-align': 'center'}}, 'You must stake EOS to CPU and Net to vote'),
                   ((this.delegated_cpu_weight == 0 && this.delegated_net_weight == 0) ? [
                     m('h2', {'style': {'text-align': 'center', 'color': 'red'}}, 'You currently have no staked EOS'),
                   ]:[]),
                   m("p", 'Your available EOS balance is ' + this.balance + ' EOS.'),
                   m("p", 'You currently have ' + this.delegated_cpu_weight + ' EOS staked to CPU.'),
                   m("p", 'You currently have ' + this.delegated_net_weight + ' EOS staked to Net.'),
                   m('div', {'style': {'margin-bottom': '3px'}}, [
                     m('div', {'style': {'width': '70px', 'display': 'inline-block'}}, [
                       m('label', {'for': 'id-CPU-stake'}, 'CPU stake'),
                     ]),
                     m('input', {'type': 'text', 'id': 'id-CPU-stake',
                                 'value': this.new_delegated_cpu_weight,
                                 'onchange': (e) => { this.new_delegated_cpu_weight = e.target.value; },
                                 }),
                     m('span', {'style': {'margin-left': '3px'}}, 'EOS'),
                   ]),
                   m('div', {'style': {'margin-bottom': '3px'}}, [
                     m('div', {'style': {'width': '70px', 'display': 'inline-block'}}, [
                       m('label', {'for': 'id-Net-stake', 'style': {'width': '70px'}}, 'Net stake'),
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
                     m("Button", {'class': 'big-vote-now-button', 'onclick': e => this.stake_now()},
                       (this.is_staking == false ? "Stake EOS" : [
                       m('span', {'style': {'display': 'inline-block'}}, "Staking"),
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

exports.StakeModal = StakeModal;
