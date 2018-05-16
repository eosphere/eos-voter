import m from "mithril";

var root = document.body

var active_block_producers = JSON.parse(document.getElementById('allblockproducers').getAttribute('data-active-block-producers'));
var backup_block_producers = JSON.parse(document.getElementById('allblockproducers').getAttribute('data-backup-block-producers'));
var chain_name = document.getElementById('allblockproducers').getAttribute('data-chain-name')

var votes = [];
var proxy_name = '';

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


function recalcVotes() {
    proxy_name = document.getElementById('id-proxy-name').value;
    var checkboxes = Array.prototype.slice.call(document.getElementsByClassName("vote-checkbox"));
    votes = checkboxes.filter(cb => cb.checked).map(cb => cb.getAttribute('id'));
}

function cast_vote() {
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
}

function current_vote() {
    return m("p", (proxy_name == '' ? 'You have voted for ' + votes.length + ' producer candidates.' : 'You have proxied your vote to ' + proxy_name))
}

var scatter = null;
var waiting_for_scatter = true;
var custom_candidates = [];

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
    scatter.requireVersion(3.0);

    //...
    waiting_for_scatter = false;
    m.redraw();

    console.log('scatter=', scatter);

    if (scatter.identity == null) {
        //scatter.forgetIdentity();
    }

    const network = {
        blockchain:'eos',
        host:'dev.cryptolions.io', // ( or null if endorsed chainId )
        port:28888, // ( or null if defaulting to 80 )
        //chainId:1 || 'abcd', // Or null to fetch automatically ( takes longer )
    }

    scatter.suggestNetwork(network).then((result) => {
        console.log('Suggested network was accepted result=', result);
        });
})

setTimeout(() => { waiting_for_scatter = false; m.redraw();}, 2000);

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
                   m('input', {'class': 'vote-checkbox', 'id': block_producer.id,'type': 'checkbox', 'onchange': recalcVotes}),
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
                 m("div", {'class': 'content-container'}, [
                   m("p", 'You may  vote for up to 30 block producer candidates. Or you can proxy your vote to another EOS user.'),
                   current_vote(),
                   m("p", 'Currently connected to the ' + chain_name + ' network'),
                 ].concat(block_producers_grid(active_block_producers, "Active Producers").
                 concat(block_producers_grid(backup_block_producers, "Backup Producers").
                 concat(block_producers_grid(custom_candidates, "Custom Candidates").concat([
                   m("div", [
                     m("div", {'style': 'margin-top: 15px;'}, [
                       m('div', {'style': 'display: inline-block; width: 240px;'}, [
                         m("span", "Proxy my vote to another user"),
                       ]),
                       m("span", "@"),
                       m("input", {'id': 'id-proxy-name', 'type': 'text', 'style': 'height:25px;width:200px;'}),
                       m("Button", {'class': 'vote-helper-button', 'onclick': recalcVotes}, "Set Proxy"),
                     ]),
                     m("div", {'style': 'margin-top: 15px;'}, [
                       m('div', {'style': 'display: inline-block; width: 240px;'}, [
                         m("span", {'style': 'min-width:240px;'}, "You can add a candidate to the list"),
                       ]),
                       m("span", "@"),
                       m("input", {'id': 'id-add-custom-candidate', 'type': 'text', 'style': 'height:25px;width:200px;'}),
                       m("Button", {'class': 'vote-helper-button', 'onclick': addcustomcandidate}, "Add candidate"),
                     ]),
                     current_vote(),
                   ]),
                 ]))))),
               ].concat( scatter ? [] : (
                 [
                   m('.dialog', 
                     m('.dialogContent', [
                       m('div', {'class': 'scatterPopupText'}, waiting_for_scatter ? 
                       [
                         m('h2', 'Detecting Scatter'),
                       ]
                       :
                       [
                         m('h2', 'You need to install Scatter'),
                         m('a', {href:'https://scatter-eos.com', target: '_blank'}, 'Download scatter')
                       ])
                     ])
                   )
                 ]
                 )
               )
        )
    }
}   
m.mount(root, Hello)

