import m from "mithril";

var root = document.body

var all_block_producers = JSON.parse(document.getElementById('allblockproducers').getAttribute('data-block-producers'));

var votes = [];
var proxy_name = '';

function recalcVotes() {
    proxy_name = document.getElementById('id-proxy-name').value;
    var checkboxes = Array.prototype.slice.call(document.getElementsByClassName("vote-checkbox"));
    votes = checkboxes.filter(cb => cb.checked).map(cb => cb.getAttribute('id'));
}

var network_name = 'Jungle Testnet';

function cast_vote() {
    alert('Voted');
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
                   m("p", (proxy_name == '' ? 'You have voted for ' + votes.length + ' producer candidates.' : 'You have proxied your vote to ' + proxy_name)),
                   m("p", 'Currently connected to the ' + network_name + ' network'),
                   m('div', {'class': 'block-producer-list'}, [
                     m('div', {'class': 'block-producer-row'}, [
                       m('div', {'class': 'block-producer-cell block-producer-cell-1 block-producer-column-header'}, 'Vote'),
                       m('div', {'class': 'block-producer-cell block-producer-cell-2 block-producer-column-header'}, m.trust('&nbsp;')),
                       m('div', {'class': 'block-producer-cell block-producer-cell-3 block-producer-column-header'}, m.trust('&nbsp;')),
                       m('div', {'class': 'block-producer-cell block-producer-cell-4 block-producer-column-header'}, m.trust('&nbsp;')),
                     ]),

                     ].concat(all_block_producers.map((block_producer) => {
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
                       m('div', {'class': 'block-producer-cell block-producer-cell-4'}, block_producer.statement != '' ? block_producer.statement : m.trust('&nbsp;')),
                     ]);              
                    })

                   )),
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
                       m("input", {'type': 'text', 'style': 'height:25px;width:200px;'}),
                       m("Button", {'class': 'vote-helper-button'}, "Add candidate"),
                     ]),
                   ]),
                 ]),
               ])
    }
}   
m.mount(root, Hello)

