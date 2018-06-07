// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details

import m from "mithril";
import eosjs from 'eosjs';
import Humanize from 'humanize-plus';
import {DetectScatterModal} from './detect-scatter-modal.js';
import {ConnectingToScatter} from './connecting-to-scatter-modal.js';
import {VoteModal} from './vote-modal.js';
import {modal_stack} from './eosvoter-modal.js';
import {StakeModal} from './stake-modal.js';
import {ErrorModal, errorDisplay, ErrorOKModal} from './error-modal.js';

var globals = require('./globals.js');

var root = document.body

var active_block_producers = JSON.parse(document.getElementById('allblockproducers').getAttribute('data-active-block-producers'));
var backup_block_producers = JSON.parse(document.getElementById('allblockproducers').getAttribute('data-backup-block-producers'));
var chain_addr = document.getElementById('allblockproducers').getAttribute('data-chain-addr');
var chain_port = document.getElementById('allblockproducers').getAttribute('data-chain-port');
var chain_secure_port = document.getElementById('allblockproducers').getAttribute('data-chain-secure-port');
var chain_protocol = document.getElementById('allblockproducers').getAttribute('data-chain-protocol');
var chain_name = document.getElementById('allblockproducers').getAttribute('data-chain-name');
var chain_id = document.getElementById('allblockproducers').getAttribute('data-chain-id');
var voting_page_content = document.getElementById('allblockproducers').getAttribute('data-voting-page-content');
var total_activated_stake = document.getElementById('allblockproducers').getAttribute('data-total-activated-stake');
var min_activated_stake = document.getElementById('allblockproducers').getAttribute('data-min-activated-stake');
var activated_percent = document.getElementById('allblockproducers').getAttribute('data-activated-percent');
var has_activated_message = document.getElementById('allblockproducers').getAttribute('data-has-activated-message');

var votes = [];
var proxy_name = ''; 
var balance = 'Unknown';
var delegated_cpu_weight = 'Unknown';
var delegated_net_weight = 'Unknown';
var has_activated = parseFloat(activated_percent) > 15.0

globals.network = {
    blockchain:'eos',
    host: chain_addr,
    port: chain_port,
}

const network_secure = {
    blockchain:'eos',
    host: chain_addr,
    port: chain_secure_port,
}

const requiredFields = {
    accounts:[ globals.network ],
};

globals.eosOptions = {chainId: chain_id,};

// If the list of block producers is empty reload the page. This usually means the server just started and is loading it's list of
// block producers

if (active_block_producers.length == 0 && backup_block_producers.length == 0) {
    setTimeout(() => document.location.reload(true), 2000);
} else {
    modal_stack.push_modal([DetectScatterModal, {}, null]);
    modal_stack.set_pop_listener_fn(redrawAll);
}


function recalcVotes() {
    proxy_name = document.getElementById('id-proxy-name').value;
    var checkboxes = Array.prototype.slice.call(document.getElementsByClassName("vote-checkbox"));
    votes = checkboxes.filter(cb => cb.checked).map(cb => cb.getAttribute('id'));
    votes.sort()
}

function cast_vote() {
    if (proxy_name === '' && votes.length > 30)
        modal_stack.push_modal([ErrorOKModal, {error_messages: ['Too many votes. You can only vote for 30 producers']}, null]);
    else
        modal_stack.push_modal([VoteModal, {proxy_name: proxy_name, votes: votes}, null]);
}

function current_vote() {
    return m('div', {'style': {'text-align':'center'}},
             m("span.vote_info", (proxy_name == '' ? 
                ['You have voted for ', m('strong.bolded-vote-info', votes.length), ' producer candidates.'] : 
                m('strong.bolded-vote-info', 'You have proxied your vote to ' + proxy_name)) 
             )
           ) 
}

function eos_to_float(s) {
    var ret = s ? s.split(" ")[0] : 0;
    return parseFloat(ret);
}

document.addEventListener('scatterLoaded', scatterExtension => {
    console.log('scatterLoaded called');

    if (active_block_producers.length == 0 && backup_block_producers.length == 0) {
        return;
    }
    // Scatter will now be available from the window scope.
    // At this stage the connection to Scatter from the application is
    // already encrypted.
    globals.scatter = window.scatter;

    // It is good practice to take this off the window once you have
    // a reference to it.
    window.scatter = null;

    // If you want to require a specific version of Scatter
    var ret = globals.scatter.requireVersion(4.0);

    //Display the connecting screen
    modal_stack.push_modal([ConnectingToScatter, {on_close: modal_stack.pop_modal}, null]);
    m.redraw();

    redrawAll();
})

function redrawAll() {
    if (active_block_producers.length == 0 && backup_block_producers.length == 0)
        return;

    var eos = globals.scatter.eos( globals.network, eosjs.Localnet, globals.eosOptions, chain_protocol );

    globals.scatter.suggestNetwork(globals.network).then((result) => {
            globals.scatter.getIdentity(requiredFields).then(identity => {
                // Set up any extra options you want to use eosjs with. 
                if (identity.accounts[0].authority != 'active'){
                    modal_stack.push_modal([ErrorModal, {error_messages: ['You have chosen an account with the ' + identity.accounts[0].authority + 
                          ' authority only the active authority can stake EOS. You should change identity'], show_retry: true}, null]);
                    m.redraw();
                    return;
                }

                 
                // Get a reference to an 'Eosjs' instance with a Scatter signature provider.
                eos = globals.scatter.eos( network_secure, eosjs.Localnet, globals.eosOptions, chain_protocol );

                eos.getAccount({'account_name': identity.accounts[0].name}).then((result) => { 
                        modal_stack.pop_entire_stack();

                        // Get our EOS balance
                        eos.getTableRows({
                            json:true,
                            code:'eosio.token',
                            scope:identity.accounts[0].name,
                            table:'accounts',
                            limit:500
                        }).then(
                            (result) => {
                                const row = result.rows.find(row => row.balance.split(" ")[1].toLowerCase() === 'eos');
                                balance = row ? row.balance.split(" ")[0] : 0;
                                m.redraw();
                        }).catch(
                            (error) => {
                                errorDisplay('Scatter returned an error from getTableRows', error);
                                console.error('getTableRows error = ', error);
                        })

                        if (result.voter_info) {
                            votes = result.voter_info.producers;
                            proxy_name = result.voter_info.proxy;
                        } else {
                            votes = [];
                            proxy_name = '';
                        }
                        if (result.delegated_bandwidth == null || (eos_to_float(result.delegated_bandwidth.cpu_weight) == 0
                            && eos_to_float(result.delegated_bandwidth.net_weight) == 0))
                        {
                            delegated_cpu_weight = '0';
                            delegated_net_weight = '0';
                        } else {
                            delegated_cpu_weight = result ? result.delegated_bandwidth.cpu_weight.split(" ")[0] : 0;
                            delegated_net_weight = result ? result.delegated_bandwidth.net_weight.split(" ")[0] : 0;
                        }
                        if (parseFloat(delegated_cpu_weight) == 0 && parseFloat(delegated_net_weight) == 0) {
                            modal_stack.push_modal([StakeModal, {delegated_cpu_weight: delegated_cpu_weight, delegated_net_weight: delegated_net_weight, balance: balance}, null]);
                        }
        
                        m.redraw();
                    })
                    .catch(   (e) => {
                                    console.error('Error returned by getAccount = ', e);
                                    errorDisplay('Scatter returned an error from getAccount', e);
                                    }
                    );
    
            }).catch(error => {
                console.error('scatter.getIdentity() gave error=', error);
                if (error.type == 'identity_rejected') {
                    modal_stack.push_modal([ErrorModal, {error_messages: ['No identity was chosen. Please config an identity in Scatter and link it to your private key'], show_retry: true}, null]);
                    m.redraw();
                } else
                    errorDisplay('Scatter returned an error from getIdentity', error);
            });


            m.redraw();



        }).catch((error) => {
            console.error('Suggested network was rejected result=', error);
            if (error.type == "locked") {
                modal_stack.push_modal([ErrorModal, {error_messages: ['Scatter is locked. Please unlock it and then retry'], show_retry: true}, null]);
                m.redraw();
            } else
                errorDisplay('Scatter returned an error from suggestNetwork', error);
        });
}

function block_producers_grid(block_producer_list, description) {
    if (block_producer_list.length == 0)
        return [];
    else
        return [
           m("h2.centre", description),
           m('div', {'class': 'block-producer-list'}, [
             m('div', {'class': 'block-producer-row'}, [
               m('div', {'class': 'block-producer-cell block-producer-cell-1 block-producer-column-header'}, 'Vote'),
               m('div', {'class': 'block-producer-cell block-producer-cell-2 block-producer-column-header'}, 'Block Producer'),
               m('div', {'class': 'block-producer-cell block-producer-cell-3 block-producer-column-header'}, 'Current Vote Total'),
               m('div', {'class': 'block-producer-cell block-producer-cell-4 block-producer-column-header'}, 'Information'),
             ]),

           ].concat(block_producer_list.map((block_producer) => {
             return m('div', {'class': 'block-producer-row'}, [
               m('div', {'class': 'block-producer-cell block-producer-cell-1 block-producer-column-header'}, [
                 m('label', {'class': 'checkbox-container'}, [
                   m.trust('&nbsp;'),
                   m('input', Object.assign({}, {'class': 'vote-checkbox', 'id': block_producer.id,'type': 'checkbox', 'onchange': recalcVotes}, 
                        ((votes.includes(block_producer.id)) ? {'checked': 'checked'} : {}))),
                   m('span', {'class': 'checkmark'}),
                 ]),
               ]),
               m('div', {'class': 'block-producer-cell block-producer-cell-2'}, block_producer.name),
               m('div', {'class': 'block-producer-cell block-producer-cell-3 right'}, [
                 m('span.small-vote-total', block_producer.votes_absolute + 'M'),
                 ' ', block_producer.votes_percent,
               ]),
               m('div', {'class': 'block-producer-cell block-producer-cell-4'}, block_producer.valid_url ? 
                 [m('a', {'href': block_producer.statement, 'class': 'statement', 'target': '_blank'}, block_producer.statement)] : 
                   [block_producer.statement, m.trust('&nbsp;')]),
             ]);              
            }))

           ),
    ];
}



function get_current_modal() {
    if (modal_stack.is_empty()) return [];
    // Returns the modal on the top of the stack
    let top = modal_stack.get_top();
    let inst = m(top[0] /*the class*/, top[1] /* the params*/);
    if (top[2] === null) {
        top[2] = inst;
    }
    return inst;
}

var View = {
    view: function() {
        return m("main", [
                 m("div", {'class': 'pageheader'}, [
                   m("div", {'class': 'pageheaderitem'}, [
                     m("img", {'class': 'eoslogo', 'src': '/images/Logo-dark-landscape-v2-1.png'})
                   ]),
                   m("div", {'class': 'centre-header'}, [
                     m("h1", {'class': 'centre-h1'}, "EOS Voter")
                   ]),
                   m("div", {'class': 'pageheaderitem signupbuttoncontainer'}, [
                     m("button", {'class': 'signupbutton', 'onclick': cast_vote}, 'Cast Vote'),
                   ]),
                 ]),
                 m('div', {'class': 'pageheader-spacer'}),
                 m("div", {'class': 'content-container'}, [
                   m("div", m.trust(voting_page_content)),
                   current_vote(),
                   m("p", {'class': 'centre'}, 'Currently connected to the ' + chain_name + ' network'),
                   m("p", {'class': 'centre'}, 'Chain id = ' + chain_id + '.'),
                   m("p.centre", 'Percentage of EOS voting ' + activated_percent + '%'),
                   m("p.centre", Humanize.formatNumber(total_activated_stake) + ' EOS have voted ' + Humanize.formatNumber(min_activated_stake) + ' needed to activate the chain'),
                   (has_activated) ? [m("div", m.trust(has_activated_message))] : [],
                 ].concat(block_producers_grid(active_block_producers, has_activated ? "Active Block Producers" : "Block Producer Candidates")).
                 concat(block_producers_grid(backup_block_producers, "Backup Block Producers")).
                 concat([
                   m("div", [
                     m("div", {'style': 'margin-top: 15px;'}, [
                       m('div', {'style': 'display: inline-block; width: 240px;'}, [
                         m("span", "Proxy my vote to another user"),
                       ]),
                       m("span", "@"),
                       m("input", {'id': 'id-proxy-name', 'type': 'text', 'style': 'height:25px;width:200px;', 'value': proxy_name}),
                       m("Button", {'class': 'vote-helper-button', 'onclick': recalcVotes}, "Set Proxy"),
                     ]),
                     m("div", {'style': 'margin-top: 15px; margin-bottom: 15px;'}, [
                       m('div', {'style': 'display: inline-block; max-width: 458.2px;'}, [
                         'Your EOS balance is ' + balance + ' EOS. Delegated CPU = ' + delegated_cpu_weight + 
                         ' EOS. Delegated Net = ' + delegated_net_weight + ' EOS.',
                       ]),
                       m('button', {'class': 'vote-helper-button', 'onclick': (e) => { modal_stack.push_modal([StakeModal, {delegated_cpu_weight: delegated_cpu_weight, delegated_net_weight: delegated_net_weight, balance: balance}, null]); }}, 'Stake now'),
                     ]),
                     current_vote(),
                   ]),
                 ])),
               ].concat(get_current_modal()
             ).concat([
               m('p', [
                 'A service provided by ',
                 m('a', {'href':'https://eosphere.io', 'target':'_blank'}, 'EOSphere'),
                 ' Source code licenced under Affero GNU GPL ', 
                 m('a', {'href': 'https://github.com/eosphere/eos-voter', 'target':'_blank'},
                 'Download source'),
               ]),
             ]),
        )
    }
}   
m.mount(root, View)

