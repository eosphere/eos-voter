// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details
let exports = module.exports = {};

var m = require("mithril");
var {EosVoterModal} = require('./eosvoter-modal.js');
var globals = require('./globals.js');
var eosjs = require('eosjs');
var {modal_stack} = require('./eosvoter-modal.js');
var {OKModal} = require('./ok-modal.js');
var {errorDisplay} = require('./error-modal.js');

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
        accounts:[ globals.network ],
    };
    globals.scatter.suggestNetwork(globals.network).then((result) => {
        globals.scatter.getIdentity(requiredFields).then(identity => {
            // Set up any extra options you want to use eosjs with. 
            // Get a reference to an 'Eosjs' instance with a Scatter signature provider.
            var eos = globals.scatter.eos( globals.network, eosjs.Localnet, globals.eosOptions );
            eos.contract('eosio', requiredFields).then(c => {
                c.delegatebw(identity.accounts[0].name, identity.accounts[0].name, this.new_delegated_net_weight + ' EOS', this.new_delegated_cpu_weight + ' EOS', 0)
                    .then((result) => {
                    console.log('delegatebw result=', result);
                    modal_stack.push_modal([OKModal, {info_message: 'Staking was succesful'}, null]);
                    m.redraw();
                    })
                    .catch(e => {
                        errorDisplay('eosio.delegatebw returned an error', e);
                        console.log('delegatebw error e=', e)
                    });
                })
                .catch(e => {
                    errorDisplay('get contract returned an error', e);
                    console.log('contract error e=', e)
                });
            })
            .catch(e => {
                errorDisplay('getidentity returned an error', e);
                console.log('getidentity error e=', e)
            });
        })
        .catch(e => {
            errorDisplay('suggestNetwork returned an error', e);
            console.log('suggestNetwork error e=', e)
        });
    }

    get_internal_content() {
        return [
                 m('h2', {'style': {'text-align': 'center'}}, 'Stake your EOS'),
                 m('div', {'style': {'width': '100%', 'height': 'calc(100% - 120px - 49px)'}}, [
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
                       (this.is_staking == false ? "Stake EOS" : "Staking")),
                   ]),
                   m('div', [
                     m("Button", {'class': 'vote-helper-button', 'onclick': e => this.close(),
                                'style': {'float': 'right'}}, "Cancel"),
                   ]),
                 ]),
               ]
    }
}

exports.StakeModal = StakeModal;
    

