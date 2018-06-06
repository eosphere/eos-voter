// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details
let exports = module.exports = {};

var m = require("mithril");
var {EosVoterModal} = require('./eosvoter-modal.js');
var globals = require('./globals.js');
var eosjs = require('eosjs');
var {modal_stack} = require('./eosvoter-modal.js');

function errorDisplay(description, e) {
    console.log('errorDisplay e=', e);
    let message = 'Null message';
    let details = 'Null details';
    try {
        let error = JSON.parse(e['message']);
        try {
            message = error.message;
        } catch (e2) {
            // Silently ignore if message does not exists
        }
        try {
            details = error.error.details.map((d) => d.message).join(' ');
        } catch (e2) {
            // Silently ignore if error details does not exists
        }
    } catch (e2) {
        // Silently ignore if error details does not exists Ie because the error message isn't JSON
        message = e;
    }
    alert(description + '\nmessage:' + message + 
           '\nDetails: ' +  details);
}


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
            //console.log('stake_now identity=', identity);
            //const account = identity.networkedAccount(eos.fromJson(network));
            //console.log('stake_now account=', account);
            eos.contract('eosio', requiredFields).then(c => {
                console.log('contract c=', c);
                console.log('stake_now globals.scatter.identity.accounts[0].name=',globals.scatter.identity.accounts[0].name);
                console.log('stake_now delegated_net_weight=',this.delegated_net_weight);
                console.log('stake_now delegated_cpu_weight=',this.delegated_cpu_weight);
                
                //c.delegatebw({'from':identity.accounts[0].name, 'receiver':identity.accounts[0].name,
                //             'stake_net_quantity': delegated_net_weight + ' EOS', 'stake_cpu_quantity': delegated_cpu_weight + ' EOS', 'transfer':0})
                c.delegatebw(identity.accounts[0].name, identity.accounts[0].name, this.new_delegated_net_weight + ' EOS', this.new_delegated_cpu_weight + ' EOS', 0)
                    .then((result) => {
                    console.log('delegatebw result=', result);
                    //needs_to_stake = false;
                    alert('Staking was succesfull');
                    modal_stack.pop_modal();
                    m.redraw();
                    //redrawAll();
                    })
                    .catch(e => {
                        //alert('eosio.delegatebw returned an error\nmessage:' + e.message);
                        errorDisplay('eosio.delegatebw returned an error', e);
                        console.log('delegatebw error e=', e)
                    });
                })
                .catch(e => {
                    //alert('get contract returned an error\nmessage:' + e.message);
                    errorDisplay('get contract returned an error', e);
                    console.log('contract error e=', e)
                });
            })
            .catch(e => {
                //alert('getidentity returned an error\nmessage:' + e.message);
                errorDisplay('getidentity returned an error', e);
                console.log('getidentity error e=', e)
            });
        })
        .catch(e => {
            //alert('suggestNetwork returned an error\nmessage:' + e.message);
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
    

