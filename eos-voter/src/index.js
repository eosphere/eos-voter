import m from "mithril";
import Eos from 'eosjs'

var root = document.body

var active_block_producers = JSON.parse(document.getElementById('allblockproducers').getAttribute('data-active-block-producers'));
var backup_block_producers = JSON.parse(document.getElementById('allblockproducers').getAttribute('data-backup-block-producers'));
var chain_name = document.getElementById('allblockproducers').getAttribute('data-chain-name')

var votes = [];
var proxy_name = ''; 
var is_voting = false;
var account_producers = []; // The producers the current user voted for
var account_proxy = ''; //The proxy the current user voted for

var ScatterStatus = {'DETECTING': 'DETECTING', // Detecting scatter
                     'CONNECTING': 'CONNECTING', // Connecting to scatter
                     'CONNECTED': 'CONNECTED', // Scatter is connected and working correctly
                     'FAILED': 'FAILED',
                    }

var scatter_status = ScatterStatus.DETECTING;

function ValidURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locater
  if(!pattern.test(str)) {
    //alert("Please enter a valid URL.");
    return false;
  } else {
    return true;
  }
}

// If the list of block producers is empty reload the page. This usually means the server just started and is loding it's list of
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
    /*
    const requiredFields = {
        //personal:['firstname', 'email'],
        accounts:[
            {blockchain:'eos', host:'dev.cryptolions.io', port:28888},
        ]
    };

    scatter.getIdentity(requiredFields).then(identity => {
        //alert('scatter.getIdentity() worked identity=', identity);
        console.log('scatter.getIdentity() identityr=', identity);


    }).catch(error => {
        alert('scatter.getIdentity() gave error=', error);
        console.log('scatter.getIdentity() gave error=', error);
    });
    */
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

    const network = {
        blockchain:'eos',
        host:'dev.cryptolions.io', // ( or null if endorsed chainId )
        port:28888, // ( or null if defaulting to 80 )
        //chainId:1 || 'abcd', // Or null to fetch automatically ( takes longer )
    }

    scatter.suggestNetwork(network).then((result) => {
            //console.log('Suggested network was accepted result=', result);
            //...
            //scatter_status = ScatterStatus.CONNECTED;

            const requiredFields = {
                //personal:['firstname', 'email'],
                accounts:[
                    {blockchain:'eos', host:'dev.cryptolions.io', port:28888},
                ]
            };

            scatter.getIdentity(requiredFields).then(identity => {
                //alert('scatter.getIdentity() worked identity=', identity);
                //console.log('scatter.getIdentity() identityr=', identity);

                // Set up any extra options you want to use eosjs with. 
                const eosOptions = {};
                 
                // Get a reference to an 'Eosjs' instance with a Scatter signature provider.
                eos = scatter.eos( network, Eos.Localnet, eosOptions );

                //console.log('eos=', eos);

                //console.log('eos.getTableRows=', eos.getTableRows);
                /*
                eos.getCurrencyBalance({'code': 'capycapybara', 'account': 'capycapybara'})
                .then((result) => {console.log('getCurrencyBalance result=', result);})
                .catch((error) => {console.log('getCurrencyBalance error=', error);})
                */

                eos.getAccount({'account_name': /*'capycapybara'*/identity.accounts[0].name}).then((result) => { 
                        scatter_status = ScatterStatus.CONNECTED;
                        console.log('getAccount result=', result);
                        if (result.voter_info) {
                            account_producers = result.voter_info.producers;
                            account_proxy = result.voter_info.proxy;
                            //for (var i = 0 ; i < account_producers.length ; i++) {
                            //    console.log('Producer = ', account_producers[i]);
                            //}
                        } else {
                            account_producers = [];
                            account_proxy = '';
                        }
                        votes = account_producers; 
                        proxy_name = account_proxy;                       
                        m.redraw();
                    })
                    .catch(   (result) => {
                                    console.error('Error getAccount result=', result);
                                    }
                    );
    
                /*
                eos.getTableRows({'json': true, 'code': 'eosio', 'scope': 'eosio', 'table': 'voters', 'limit': 100, 'table_key': 'owner', 'lower_bound': 'a', 'upper_bound': 'z'}).then(
                    (result) => {
                                 console.log('getTableRows returned rows= ', result.rows);
                                 console.log('getTableRows returned rows.length= ', result.rows.length);
                                 var fun = result.rows.filter((x) => x.producers.length > 1);
                                 console.log('fun=', fun);
                                }
                    ).catch(
                        (result) => {
                                    console.error('Error result=', result);
                                    }
                    );
                */
    
            }).catch(error => {
                //alert('scatter.getIdentity() gave error=', error);
                console.log('scatter.getIdentity() gave error=', error);
            });


            m.redraw();



        }).catch((result) => {
        console.log('Suggested network was rejected result=', result);
        });
})

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
    //console.log(' block_producers_grid account_producers-', account_producers);
    //console.log(' block_producers_grid block_producer_list-', block_producer_list);
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
                        ((account_producers.includes(block_producer.id)) ? {'checked': 'checked'} : {}))),
                   m('span', {'class': 'checkmark'}),
                 ]),
               ]),
               m('div', {'class': 'block-producer-cell block-producer-cell-2'}, block_producer.name),
               m('div', {'class': 'block-producer-cell block-producer-cell-3 right'}, block_producer.votes),
               m('div', {'class': 'block-producer-cell block-producer-cell-4'}, ValidURL(block_producer.statement) ? 
                 [m('a', {'href': block_producer.statement, 'class': 'statement', 'target': '_blank'}, block_producer.statement)] : 
                   [block_producer.statement, m.trust('&nbsp;')]),
             ]);              
            }))

           ),
    ];
}

function vote_now(e) {
    if (is_voting)
        return;
    is_voting = true;
    /*
    setTimeout(() => {
        confirming_vote = false;
        is_voting = false;
        m.redraw();
    }, 3000);*/
    console.log('vote_now called');

    eos.contract('eosio').then(c => {
        console.log('contract c=', c);
        
        /*c.delegatebw({'from':scatter.identity.accounts[0].name, 'receiver':scatter.identity.accounts[0].name,
                     'stake_net_quantity': '50.0000 EOS', 'stake_cpu_quantity':'50.0000 EOS', 'transfer':1})
            .then(() => {
            console.log('delegatebw result=', result);*/
            c.voteproducer(scatter.identity.accounts[0].name, proxy_name, votes)
                .then((result) => {console.log('voteproducer result=', result);})
                .catch((error) => {console.log('voteproducer error=', error);})
            /*})
            .catch(e => {console.log('delegatebw error e=', e)});*/
        })
        .catch(e => {console.log('contract error e=', e)});
}

var Hello = {
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
                 ].concat(block_producers_grid(active_block_producers, "Active Producers")).
                 concat(block_producers_grid(backup_block_producers, "Backup Producers")).
                 concat(block_producers_grid(custom_candidates, "Custom Candidates")).concat([
                   m("div", [
                     m("div", {'style': 'margin-top: 15px;'}, [
                       m('div', {'style': 'display: inline-block; width: 240px;'}, [
                         m("span", "Proxy my vote to another user"),
                       ]),
                       m("span", "@"),
                       m("input", {'id': 'id-proxy-name', 'type': 'text', 'style': 'height:25px;width:200px;', 'value': account_proxy}),
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
                 ) : [])
        )
    }
}   
m.mount(root, Hello)

