import m from "mithril";
import Eos from 'eosjs'

var root = document.body

var active_block_producers = JSON.parse(document.getElementById('allblockproducers').getAttribute('data-active-block-producers'));
var backup_block_producers = JSON.parse(document.getElementById('allblockproducers').getAttribute('data-backup-block-producers'));
var chain_addr = document.getElementById('allblockproducers').getAttribute('data-chain-addr');
var chain_port = document.getElementById('allblockproducers').getAttribute('data-chain-port');
var chain_name = document.getElementById('allblockproducers').getAttribute('data-chain-name')

var votes = [];
var proxy_name = ''; 
var is_voting = false;
var balance = 'Unknown';
var delegated_cpu_weight = 'Unknown';
var delegated_net_weight = 'Unknown';
var is_staking = false;
var needs_to_stake = false;


var ScatterStatus = {'DETECTING': 'DETECTING', // Detecting scatter
                     'CONNECTING': 'CONNECTING', // Connecting to scatter
                     'CONNECTED': 'CONNECTED', // Scatter is connected and working correctly
                     'FAILED': 'FAILED',
                    }

var scatter_status = ScatterStatus.DETECTING;

// If the list of block producers is empty reload the page. This usually means the server just started and is loading it's list of
// block producers
if (active_block_producers.length == 0 && backup_block_producers.length == 0) {
    setTimeout(() => document.location.reload(true), 2000);
}

function recalcVotes() {
    proxy_name = document.getElementById('id-proxy-name').value;
    var checkboxes = Array.prototype.slice.call(document.getElementsByClassName("vote-checkbox"));
    votes = checkboxes.filter(cb => cb.checked).map(cb => cb.getAttribute('id'));
}

function cast_vote() {
    confirming_vote = true;
}

function current_vote() {
    return m('div', {'style': {'text-align':'center'}},
             m("span.vote_info", (proxy_name == '' ? 
                ['You have voted for ', m('strong.bolded-vote-info', votes.length), ' producer candidates.'] : 
                m('strong.bolded-vote-info', 'You have proxied your vote to ' + proxy_name)) 
             )
           ) 
}

var scatter = null;
var custom_candidates = [];
var confirming_vote = false;

var eos = null; // The eosjs instance provided by scatter

function eos_to_float(s) {
    var ret = s ? s.split(" ")[0] : 0;
    return parseFloat(ret);
}

document.addEventListener('scatterLoaded', scatterExtension => {
    console.log('scatterLoaded called');

    // Scatter will now be available from the window scope.
    // At this stage the connection to Scatter from the application is
    // already encrypted.
    scatter = window.scatter;

    // It is good practice to take this off the window once you have
    // a reference to it.
    window.scatter = null;

    // If you want to require a specific version of Scatter
    var ret = scatter.requireVersion(4.0);

    scatter_status = ScatterStatus.CONNECTING;
    m.redraw();

    /*
    console.log('scatter=', scatter);

    if (scatter.identity != null) {
        //scatter.forgetIdentity();
    }
    */
    redrawAll();
})

function redrawAll() {
    const network = {
        blockchain:'eos',
        host: chain_addr, // ( or null if endorsed chainId )
        port: chain_port, // ( or null if defaulting to 80 )
    }

    scatter.suggestNetwork(network).then((result) => {
            //console.log('suggestNetwork result=',result);
            //console.log('suggestNetwork scatter=',scatter);
            const requiredFields = {
                accounts:[
                    {blockchain:'eos', host:chain_addr, port:chain_port},
                ]
            };

            scatter.getIdentity(requiredFields).then(identity => {
                // Set up any extra options you want to use eosjs with. 
                const eosOptions = {};
                 
                // Get a reference to an 'Eosjs' instance with a Scatter signature provider.
                eos = scatter.eos( network, Eos.Localnet, eosOptions );

                eos.getAccount({'account_name': identity.accounts[0].name}).then((result) => { 
                        scatter_status = ScatterStatus.CONNECTED;
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
                                alert('Scatter returned an error from getTableRows\nmessage:' + error.message);
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
                        if (result.delegated_bandwidth === null || (eos_to_float(result.delegated_bandwidth.cpu_weight) == 0
                            && eos_to_float(result.delegated_bandwidth.net_weight) == 0))
                        {
                            console.log('You have not staked any EOS and therefore cannot vote');
                            delegated_cpu_weight = '0';
                            delegated_net_weight = '0';
                            needs_to_stake = true;
                        } else {
                            delegated_cpu_weight = result ? result.delegated_bandwidth.cpu_weight.split(" ")[0] : 0;
                            delegated_net_weight = result ? result.delegated_bandwidth.net_weight.split(" ")[0] : 0;
                        }
        
                        m.redraw();
                    })
                    .catch(   (result) => {
                                    console.error('Error returned by getAccount = ', result);
                                    let error = JSON.parse(result['message']);
                                    alert('Scatter returned an error from getAccount\nmessage:' + error.message + 
                                           '\nDetails: ' + error.error.details.map((d) => d.message).join(' ') );
                                    }
                    );
    
            }).catch(error => {
                console.error('scatter.getIdentity() gave error=', error);
                alert('Scatter returned an error from getIdentity\nmessage:' + error.message);
            });


            m.redraw();



        }).catch((error) => {
            console.error('Suggested network was rejected result=', error);
            alert('Scatter returned an error from suggestNetwork\nmessage:' + error.message);
        });
}

setTimeout(() => { if (scatter_status == ScatterStatus.DETECTING) {
                     scatter_status = ScatterStatus.FAILED; 
                     m.redraw();
                   }
                  }, 2000);

function addcustomcandidate() {
    var name = document.getElementById('id-add-custom-candidate').value;
    var existingnames = active_block_producers.concat(backup_block_producers).concat(custom_candidates).map((x) => x.name);
    if (name != '' && !existingnames.includes(name)) {
        custom_candidates.push({'id': name, 'name': name, 'votes': '0', 'statement': ''});
        recalcVotes();
        m.redraw();
    } else {
        alert('Block producer ' + name + ' is already in the list');
    }
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
               m('div', {'class': 'block-producer-cell block-producer-cell-2 block-producer-column-header'}, m.trust('&nbsp;')),
               m('div', {'class': 'block-producer-cell block-producer-cell-3 block-producer-column-header'}, m.trust('&nbsp;')),
               m('div', {'class': 'block-producer-cell block-producer-cell-4 block-producer-column-header'}, m.trust('&nbsp;')),
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
               m('div', {'class': 'block-producer-cell block-producer-cell-3 right'}, block_producer.votes),
               m('div', {'class': 'block-producer-cell block-producer-cell-4'}, block_producer.valid_url ? 
                 [m('a', {'href': block_producer.statement, 'class': 'statement', 'target': '_blank'}, block_producer.statement)] : 
                   [block_producer.statement, m.trust('&nbsp;')]),
             ]);              
            }))

           ),
    ];
}

function stake_now(e) {
    console.log('stake_now called');
    if (is_staking)
        return;
    is_staking = true;

    const requiredFields = {
        accounts:[
            {blockchain:'eos', host:chain_addr, port:chain_port},
        ]
    };

    const network = {
        blockchain:'eos',
        host: chain_addr, // ( or null if endorsed chainId )
        port: chain_port, // ( or null if defaulting to 80 )
    }

    scatter.suggestNetwork(network).then((result) => {
        scatter.getIdentity(requiredFields).then(identity => {
            // Set up any extra options you want to use eosjs with. 
            const eosOptions = {};
            // Get a reference to an 'Eosjs' instance with a Scatter signature provider.
            eos = scatter.eos( network, Eos.Localnet, eosOptions );
            console.log('stake_now identity=', identity);
            //const account = identity.networkedAccount(eos.fromJson(network));
            //console.log('stake_now account=', account);
             
            eos.contract('eosio', requiredFields).then(c => {
                console.log('contract c=', c);
                console.log('stake_now scatter.identity.accounts[0].name=',identity.accounts[0].name);
                
                c.delegatebw({'from':identity.accounts[0].name, 'receiver':identity.accounts[0].name,
                             'stake_net_quantity': delegated_net_weight + ' EOS', 'stake_cpu_quantity': delegated_cpu_weight + ' EOS', 'transfer':1, requiredFields})
                    .then((result) => {
                    console.log('delegatebw result=', result);
                    needs_to_stake = false;
                    m.redraw();
                    })
                    .catch(e => {
                        alert('eosio.delegatebw returned an error\nmessage:' + e.message);
                        console.log('delegatebw error e=', e)
                    });
                })
                .catch(e => {
                    alert('get contract returned an error\nmessage:' + e.message);
                    console.log('contract error e=', e)
                });
            })
            .catch(e => {
                alert('getidentity returned an error\nmessage:' + e.message);
                console.log('getidentity error e=', e)
            });
        })
        .catch(e => {
            alert('suggestNetwork returned an error\nmessage:' + e.message);
            console.log('suggestNetwork error e=', e)
        });
}

function vote_now(e) {
    if (is_voting)
        return;
    is_voting = true;

    eos.contract('eosio').then(c => {
        console.log('contract c=', c);
        
        /*c.delegatebw({'from':scatter.identity.accounts[0].name, 'receiver':scatter.identity.accounts[0].name,
                     'stake_net_quantity': '50.0000 EOS', 'stake_cpu_quantity':'50.0000 EOS', 'transfer':1})
            .then(() => {
            console.log('delegatebw result=', result);*/
            c.voteproducer(scatter.identity.accounts[0].name, proxy_name, proxy_name != '' ? [] : votes)
                .then((result) => {
                    console.log('voteproducer result=', result);
                    alert('Your vote was cast successfully');
                    confirming_vote = false;
                    redrawAll();
                })
                .catch((error) => {
                    console.error('voteproducer error=', error);
                    alert('eosio.voteproducer returned an error\nmessage:' + error.message);
                })
            /*})
            .catch(e => {console.log('delegatebw error e=', e)});*/
        })
        .catch(e => {
            alert('get contract returned an error\nmessage:' + error.message);
            console.log('contract error e=', e)
        });
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
                   m("p", 'You may  vote for up to 30 block producer candidates. Or you can proxy your vote to another EOS user.'),
                   current_vote(),
                   m("p", 'Currently connected to the ' + chain_name + ' network'),
                   m("p", 'Your EOS balance is ' + balance + ' EOS. Delegated CPU = ' + delegated_cpu_weight + ' EOS. Delegated Net = ' + delegated_net_weight + ' EOS.'),
                 ].concat(block_producers_grid(active_block_producers, "Active Producers")).
                 concat(block_producers_grid(backup_block_producers, "Backup Producers")).
                 concat(block_producers_grid(custom_candidates, "Custom Candidates")).concat([
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
                       m('div', {'style': 'display: inline-block; width: 240px;'}, [
                         m("span", {'style': 'min-width:240px;'}, "You can add a candidate to the list"),
                       ]),
                       m("span", "@"),
                       m("input", {'id': 'id-add-custom-candidate', 'type': 'text', 'style': 'height:25px;width:200px;'}),
                       m("Button", {'class': 'vote-helper-button', 'onclick': addcustomcandidate}, "Add candidate"),
                     ]),
                     current_vote(),
                   ]),
                 ])),
               ].concat( !(scatter_status != ScatterStatus.CONNECTED) ? [] : (
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
                               m('a', { href: 'https://scatter-eos.com', target: '_blank'}, 'Download scatter')
                             ]
                         }  
                       })())
                     ])
                   )
                 ]
                 )
               ).concat( confirming_vote ? (
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
             ).concat( (parseFloat(delegated_cpu_weight) == 0 && parseFloat(delegated_net_weight) == 0) ? (
                 [
                   m('.dialog', {'onclick': e => confirming_vote = false}, 
                     m('.dialogContent', {'onclick': e => e.stopPropagation()}, [
                       m('div', {'class': 'scatterPopupText'}, [
                         m('h2', {'style': {'text-align': 'center'}}, 'Stake your EOS'),
                         m('div', {'style': {'width': '100%', 'height': 'calc(100% - 120px - 49px)'}}, [
                           m('h2', {'style': {'text-align': 'center'}}, 'You must stake EOS to CPU and Net to vote'),
                           m("p", 'Your EOS balance is ' + balance + ' EOS.'),
                           m('div', {'style': {'margin-bottom': '3px'}}, [
                             m('div', {'style': {'width': '70px', 'display': 'inline-block'}}, [
                               m('label', {'for': 'id-CPU-stake'}, 'CPU stake'),
                             ]),
                             m('input', {'type': 'text', 'id': 'id-CPU-stake',
                                         'value': delegated_cpu_weight == 'Unknown' ? '0' : delegated_cpu_weight,
                                         'onchange': (e) => { delegated_cpu_weight = e.target.value; console.log('onchange called e=', e)},
                                         }),
                             m('span', {'style': {'margin-left': '3px'}}, 'EOS'),
                           ]),
                           m('div', {'style': {'margin-bottom': '3px'}}, [
                             m('div', {'style': {'width': '70px', 'display': 'inline-block'}}, [
                               m('label', {'for': 'id-Net-stake', 'style': {'width': '70px'}}, 'Net stake'),
                             ]),
                             m('input', {'type': 'text', 'id': 'id-Net-stake',
                                         'value': delegated_net_weight == 'Unknown' ? '0' : delegated_net_weight,
                                         'onchange': (e) => { delegated_net_weight = e.target.value; console.log('onchange called e=', e)},
                                        }),   
                             m('span', {'style': {'margin-left': '3px'}}, 'EOS'),
                           ]),
                         ]),
                         m('div', {'style': {'width': '100%', 'height': '120px'}}, [
                           m('div', {'style': {'text-align': 'center'}}, [
                             m("Button", {'class': 'big-vote-now-button', 'onclick': stake_now}, 
                               (is_staking == false ? "Stake EOS" : "Staking")),
                           ]),
                         ]),

                       ])
                     ])
                   )
                 ]
                 ) : []
             )
        )
    }
}   
m.mount(root, View)

