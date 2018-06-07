// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details

import m from "mithril";
import eosjs from 'eosjs';
import Humanize from 'humanize-plus';
import {DetectScatterModal} from './detect-scatter-modal.js';
import {ConnectingToScatter} from './connecting-to-scatter-modal.js';
import {VoteModal} from './vote-modal.js';
import {modal_stack} from './eosvoter-modal.js';
import {StakeModal} from './stake-modal.js';

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
var is_voting = false;
var balance = 'Unknown';
var delegated_cpu_weight = 'Unknown';
var delegated_net_weight = 'Unknown';
var is_staking = false;
var needs_to_stake = false;
var allow_staking_close = false;
var new_delegated_cpu_weight = '0';
var new_delegated_net_weight = '0';
var has_activated = parseFloat(activated_percent) > 15.0

var ScatterStatus = {'DETECTING': 'DETECTING', // Detecting scatter
                     'CONNECTING': 'CONNECTING', // Connecting to scatter
                     'CONNECTED': 'CONNECTED', // Scatter is connected and working correctly
                     'FAILED': 'FAILED',
                    }

const network = {
    blockchain:'eos',
    host: chain_addr,
    port: chain_port,
    //chainId: chain_id,
    //chainId: 'a628a5a6123d6ed60242560f23354c557f4a02826e223bb38aad79ddeb9afbca',
}

globals.network = {
    blockchain:'eos',
    host: chain_addr,
    port: chain_port,
    //chainId: chain_id,
    //chainId: 'a628a5a6123d6ed60242560f23354c557f4a02826e223bb38aad79ddeb9afbca',
}

const network_secure = {
    blockchain:'eos',
    host: chain_addr,
    port: chain_secure_port,
    //chainId: chain_id,
    //chainId: 'a628a5a6123d6ed60242560f23354c557f4a02826e223bb38aad79ddeb9afbca',
}

const requiredFields = {
    accounts:[ network ],
};

globals.eosOptions = {chainId: chain_id/*'a628a5a6123d6ed60242560f23354c557f4a02826e223bb38aad79ddeb9afbca'*/,};

var scatter_status = ScatterStatus.DETECTING;

// If the list of block producers is empty reload the page. This usually means the server just started and is loading it's list of
// block producers

if (active_block_producers.length == 0 && backup_block_producers.length == 0) {
    scatter_status = ScatterStatus.CONNECTED; // Impersonate being connected so we don't display the connecting to scatter dialog
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
    confirming_vote = true;
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

//var scatter = null;
var confirming_vote = false;

var eos = null; // The eosjs instance provided by scatter

function eos_to_float(s) {
    var ret = s ? s.split(" ")[0] : 0;
    return parseFloat(ret);
}

document.addEventListener('scatterLoaded', scatterExtension => {
    console.log('scatterLoaded called');

    if (active_block_producers.length == 0 && backup_block_producers.length == 0) {
        scatter_status = ScatterStatus.CONNECTED; // Impersonate being connected so we don't display the connecting to scatter dialog
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

    //scatter_status = ScatterStatus.CONNECTING;
    //Display the connecting screen
    modal_stack.push_modal([ConnectingToScatter, {on_close: modal_stack.pop_modal}, null]);
    m.redraw();

    /*
    console.log('scatter=', scatter);

    if (scatter.identity != null) {
        //scatter.forgetIdentity();
    }
    */
    redrawAll();
})

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

function redrawAll() {
    console.log('redrawAll called');
    if (active_block_producers.length == 0 && backup_block_producers.length == 0)
        return;

    eos = globals.scatter.eos( network, eosjs.Localnet, globals.eosOptions, chain_protocol );
    //eos.getInfo({}).then((result) => { console.log('getInfo result=', result); })
    //               .catch((result) => { console.log('getInfo error=', result); });

    console.log('Calling suggest network = ', network);
    globals.scatter.suggestNetwork(network).then((result) => {
            console.log('suggestNetwork result=',result);
            console.log('suggestNetwork globals.scatter=',globals.scatter);

            globals.scatter.getIdentity(requiredFields).then(identity => {
                // Set up any extra options you want to use eosjs with. 
                console.log('getIdentity identity=',identity);

                if (identity.accounts[0].authority != 'active'){
                    alert('You have chosen an account with the ' + identity.accounts[0].authority + 
                          ' authority only the active authority can stake EOS. You should change identity');
                }

                 
                // Get a reference to an 'Eosjs' instance with a Scatter signature provider.
                console.log('api.Localnet=',eosjs.Localnet);
                //console.log('eosjs.Mainnet=',eosjs.Mainnet);
                //console.log('eosjs=', eosjs);
                console.log('globals.scatter=', globals.scatter);
                console.log('network_secure=', network_secure);
                console.log('chain_protocol=', chain_protocol);
                eos = globals.scatter.eos( network_secure, eosjs.Localnet, globals.eosOptions, chain_protocol );

                eos.getAccount({'account_name': identity.accounts[0].name}).then((result) => { 
                        scatter_status = ScatterStatus.CONNECTED;
                        while (!modal_stack.is_empty()) {
                            modal_stack.pop_modal();
                        }
                        console.log('getAccount result=', result);

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
                            
                                //console.log('getTableRows result = ', result);
                                //console.log('getTableRows balance = ', balance);
                        }).catch(
                            (error) => {
                                errorDisplay('Scatter returned an error from getTableRows', error);
                                //alert('Scatter returned an error from getTableRows\nmessage:' + error.message);
                                console.error('getTableRows error = ', error);
                        })

                        if (result.voter_info) {
                            votes = result.voter_info.producers;
                            proxy_name = result.voter_info.proxy;
                        } else {
                            votes = [];
                            proxy_name = '';
                        }
                        console.log('Testing delegation result=', result);
                        if (result.delegated_bandwidth == null || (eos_to_float(result.delegated_bandwidth.cpu_weight) == 0
                            && eos_to_float(result.delegated_bandwidth.net_weight) == 0))
                        {
                            //console.log('You have not staked any EOS and therefore cannot vote');
                            delegated_cpu_weight = '0';
                            delegated_net_weight = '0';
                            allow_staking_close = false;
                        } else {
                            //console.log('You have staked EOS');
                            delegated_cpu_weight = result ? result.delegated_bandwidth.cpu_weight.split(" ")[0] : 0;
                            delegated_net_weight = result ? result.delegated_bandwidth.net_weight.split(" ")[0] : 0;
                            allow_staking_close = true;
                        }
                        needs_to_stake = (parseFloat(delegated_cpu_weight) == 0 && parseFloat(delegated_net_weight) == 0);
        
                        m.redraw();
                    })
                    .catch(   (e) => {
                                    console.error('Error returned by getAccount = ', e);
                                    errorDisplay('Scatter returned an error from getAccount', e);
                                    //let error = JSON.parse(e['message']);
                                    //alert('Scatter returned an error from getAccount\nmessage:' + error.message + 
                                    //       '\nDetails: ' + error.error.details.map((d) => d.message).join(' ') );
                                    }
                    );
    
            }).catch(error => {
                console.error('scatter.getIdentity() gave error=', error);
                //alert('Scatter returned an error from getIdentity\nmessage:' + error.message);
                errorDisplay('Scatter returned an error from getIdentity', error);
            });


            m.redraw();



        }).catch((error) => {
            console.error('Suggested network was rejected result=', error);
            //alert('Scatter returned an error from suggestNetwork\nmessage:' + error.message);
            errorDisplay('Scatter returned an error from suggestNetwork', error);
        });
}

setTimeout(() => { if (scatter_status == ScatterStatus.DETECTING) {
                     scatter_status = ScatterStatus.FAILED; 
                     m.redraw();
                   }
                  }, 2000);

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

/*
function stake_now(e) {
    console.log('stake_now called');
    if (is_staking)
        return;
    is_staking = true;

    const requiredFields = {
        accounts:[ network ],
    };
    globals.scatter.suggestNetwork(network).then((result) => {
        globals.scatter.getIdentity(requiredFields).then(identity => {
            // Set up any extra options you want to use eosjs with. 
            // Get a reference to an 'Eosjs' instance with a Scatter signature provider.
            eos = globals.scatter.eos( network, eosjs.Localnet, globals.eosOptions );
            //console.log('stake_now identity=', identity);
            //const account = identity.networkedAccount(eos.fromJson(network));
            //console.log('stake_now account=', account);
            eos.contract('eosio', requiredFields).then(c => {
                console.log('contract c=', c);
                console.log('stake_now globals.scatter.identity.accounts[0].name=',globals.scatter.identity.accounts[0].name);
                console.log('stake_now delegated_net_weight=',delegated_net_weight);
                console.log('stake_now delegated_cpu_weight=',delegated_cpu_weight);
                
                //c.delegatebw({'from':identity.accounts[0].name, 'receiver':identity.accounts[0].name,
                //             'stake_net_quantity': delegated_net_weight + ' EOS', 'stake_cpu_quantity': delegated_cpu_weight + ' EOS', 'transfer':0})
                c.delegatebw(identity.accounts[0].name, identity.accounts[0].name, new_delegated_net_weight + ' EOS', new_delegated_cpu_weight + ' EOS', 0)
                    .then((result) => {
                    console.log('delegatebw result=', result);
                    needs_to_stake = false;
                    alert('Staking was succesfull');
                    redrawAll();
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
*/

/*
function vote_now(e) {
    if (is_voting)
        return;
    is_voting = true;

    const requiredFields = {
        accounts:[ network ],
    };

    scatter.suggestNetwork(network).then((result) => {
        scatter.getIdentity(requiredFields).then(identity => {

            eos = scatter.eos( network, eosjs.Localnet, globals.eosOptions );
             
            eos.contract('eosio', requiredFields).then(c => {
                    eos.voteproducer({'voter': identity.accounts[0].name, 'proxy': proxy_name, 'producers': proxy_name != '' ? [] : votes} )
                        .then((result) => {
                            console.log('voteproducer result=', result);
                            alert('Your vote was submitted successfully.\n Transaction id = \'' + result.transaction_id + '\'');
                            confirming_vote = false;
                            redrawAll();
                        })
                        .catch((error) => {
                            console.error('voteproducer error=', error);
                            //alert('eosio.voteproducer returned an error\nmessage:' + error.message);
                            errorDisplay('eosio.voteproducer returned an error', error);
                        })
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
*/

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
               ]./*concat( !(scatter_status != ScatterStatus.CONNECTED) ? [] : (
                 [
                   m('.dialog', 
                     m('.dialogContent', [
                       m('div', {'class': 'scatterPopupText'}, (() => {
                         switch (scatter_status) {
                           case ScatterStatus.DETECTING:
                             return m('h2', {'style': {'text-align': 'center'}}, 'Detecting Scatter');
                           case ScatterStatus.CONNECTING:
                             return m('h2', {'style': {'text-align': 'center'}}, 'Connecting Scatter to EOS');
                           case ScatterStatus.FAILED:
                             return [
                               m('h2', 'You need to install Scatter'),
                               m('a', { href: 'https://scatter-eos.com', target: '_blank'}, 'Download scatter'),
                               m('h2', 'Go back'),
                               m('a', { href: '/'}, 'Go back'),
                             ]
                         }  
                       })())
                     ])
                   )
                 ]
                 )
               ).*//*concat( confirming_vote ? (
                 [
                   m('.dialog', {'onclick': e => confirming_vote = false}, 
                     m('.dialogContent', {'onclick': e => e.stopPropagation()}, [
                       m('div', {'class': 'scatterPopupText'}, [
                         m('h2', {'style': {'text-align': 'center'}}, 'Confirm your vote'),
                         (proxy_name != '' ? 
                           m('div', {'style': {'width': '100%', 'height': 'calc(100% - 120px - 49px)'}},
                             m('h2', {'style': {'text-align':'center'}}, 'You are voting for proxy - ' + proxy_name)
                           )
                         :
                         (votes.length > 0 ?
                         m('div', {'style': {'width': '100%', 'height': 'calc(100% - 120px - 49px)'}},
                           votes.map((x) => {
                             return  m('div', {'style': {'width': '165px',
                                                         'height': '48px',
                                                         'overflow': 'hidden',
                                                         'display': 'inline-block',
                                                         'border': '1px solid black',
                                                         'padding-left': '6px', 'padding-right': '6px'}}, [
                                       m('h3', x)
                                     ]);
                           }),
                         )
                         :
                           m('div', {'style': {'width': '100%', 'height': 'calc(100% - 120px - 49px)'}},
                             m('h2', {'style': {'text-align':'center'}}, 'You are voting for no block producer')
                           )
                         )),
                         m('div', {'style': {'width': '100%', 'height': '120px'}}, [
                           m('div', {'style': {'text-align': 'center'}}, [
                             m("Button", {'class': 'big-vote-now-button', 'onclick': vote_now}, 
                               (is_voting == false ? "Cast Vote" : "Voting")),
                           ]),
                           m('div', [
                             m("Button", {'class': 'vote-helper-button', 'onclick': e => confirming_vote = false,
                                          'style': {'float': 'right'}}, "Cancel"),
                           ]),
                         ]),

                       ])
                     ])
                   )
                 ]
                 ) : []
             ).*//*concat( needs_to_stake ? (
                 [
                   m('.dialog', {'onclick': (e) => {
                        if (allow_staking_close) 
                            needs_to_stake = false;
                     }}, 
                     m('.dialogContent', {'onclick': e => e.stopPropagation()}, [
                       m('div', {'class': 'scatterPopupText'}, [
                         m('h2', {'style': {'text-align': 'center'}}, 'Stake your EOS'),
                         m('div', {'style': {'width': '100%', 'height': 'calc(100% - 120px - 49px)'}}, [
                           m('h2', {'style': {'text-align': 'center'}}, 'You must stake EOS to CPU and Net to vote'),
                         ]
                         .concat((delegated_cpu_weight == 0 && delegated_net_weight == 0) ? [
                           m('h2', {'style': {'text-align': 'center', 'color': 'red'}}, 'You currently have no staked EOS'),
                         ]
                         :
                         [
                         ]).concat([
                           m("p", 'Your available EOS balance is ' + balance + ' EOS.'),
                           m("p", 'You currently have ' + delegated_cpu_weight + ' EOS staked to CPU.'),
                           m("p", 'You currently have ' + delegated_net_weight + ' EOS staked to Net.'),
                           m('div', {'style': {'margin-bottom': '3px'}}, [
                             m('div', {'style': {'width': '70px', 'display': 'inline-block'}}, [
                               m('label', {'for': 'id-CPU-stake'}, 'CPU stake'),
                             ]),
                             m('input', {'type': 'text', 'id': 'id-CPU-stake',
                                         'value': new_delegated_cpu_weight,
                                         'onchange': (e) => { new_delegated_cpu_weight = e.target.value; },
                                         }),
                             m('span', {'style': {'margin-left': '3px'}}, 'EOS'),
                           ]),
                           m('div', {'style': {'margin-bottom': '3px'}}, [
                             m('div', {'style': {'width': '70px', 'display': 'inline-block'}}, [
                               m('label', {'for': 'id-Net-stake', 'style': {'width': '70px'}}, 'Net stake'),
                             ]),
                             m('input', {'type': 'text', 'id': 'id-Net-stake',
                                         'value': new_delegated_net_weight == 'Unknown' ? '0' : new_delegated_net_weight,
                                         'onchange': (e) => { new_delegated_net_weight = e.target.value; },
                                        }),   
                             m('span', {'style': {'margin-left': '3px'}}, 'EOS'),
                           ]),
                         ])),

                       ].concat([
                           m('div', {'style': {'width': '100%', 'height': '120px'}}, [
                             m('div', {'style': {'text-align': 'center'}}, [
                               m("Button", {'class': 'big-vote-now-button', 'onclick': stake_now}, 
                                 (is_staking == false ? "Stake EOS" : "Staking")),
                             ]),
                           ].concat(allow_staking_close ? [
                             m('div', [
                               m("Button", {'class': 'vote-helper-button', 'onclick': e => needs_to_stake = false,
                                            'style': {'float': 'right'}}, "Cancel"),
                             ]),
                           ] : [])),
                       ]))
                     ])
                   )
                 ]
                 ) : []
             ).*/concat(get_current_modal()
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

