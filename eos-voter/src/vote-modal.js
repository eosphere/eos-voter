// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details
let exports = module.exports = {};

var m = require("mithril");
var {EosVoterModal} = require('./eosvoter-modal.js');
var globals = require('./globals.js');
var eosjs = require('eosjs');
var {modal_stack} = require('./eosvoter-modal.js');
var {OKModal} = require('./ok-modal.js');
var {errorDisplay} = require('./error-modal.js');

class VoteModal extends EosVoterModal {
    constructor(vnode) {
        super(vnode);
        this.proxy_name = vnode.attrs.proxy_name;
        this.votes = vnode.attrs.votes;
        this.is_voting = false;
    }

    can_close() { return !this.is_voting; };

    vote_now() {
        if (this.is_voting)
            return;
        this.is_voting = true;

        const requiredFields = {
            accounts:[ globals.network ],
        };

        globals.scatter.suggestNetwork(globals.network).then((result) => {
            globals.scatter.getIdentity(requiredFields).then(identity => {

                var eos = globals.scatter.eos( globals.network, eosjs.Localnet, globals.eosOptions );
                 
                eos.contract('eosio', requiredFields).then(c => {
                        eos.voteproducer({'voter': identity.accounts[0].name, 'proxy': this.proxy_name, 'producers': this.proxy_name != '' ? [] : this.votes}/*,
                                       { authorization: [scatter.identity.accounts[0].name]}*/ )
                            .then((result) => {
                                console.log('voteproducer result=', result);
                                modal_stack.push_modal([OKModal, {info_message: 'Your vote was submitted successfully.\n Transaction id = \'' + result.transaction_id + '\''}, null]);
                                m.redraw();
                                //alert('Your vote was submitted successfully.\n Transaction id = \'' + result.transaction_id + '\'');
                                //confirming_vote = false;
                                //modal_stack.pop_modal();
                                //m.redraw();
                                //redrawAll();
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

    get_internal_content() {
        return [
                 m('h2', {'style': {'text-align': 'center'}}, 'Confirm your vote'),
                 (this.proxy_name != '' ? 
                   m('div', {'style': {'width': '100%', 'height': 'calc(100% - 120px - 49px)'}},
                     m('h2', {'style': {'text-align':'center'}}, 'You are voting for proxy - ' + this.proxy_name)
                   )
                 :
                 (this.votes.length > 0 ?
                 m('div', {'style': {'width': '100%', 'height': 'calc(100% - 120px - 49px)'}},
                   this.votes.map((x) => {
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
                     m("Button", {'class': 'big-vote-now-button', 'onclick': e => this.vote_now()}, 
                       (this.is_voting == false ? "Cast Vote" : "Voting")),
                   ]),
                 ].concat(this.is_voting ? [] : [
                   m('div', [
                     m("Button", {'class': 'vote-helper-button', 'onclick': e => this.close(),
                                  'style': {'float': 'right'}}, "Cancel"),
                   ]),
                 ])),
               ];
    }
}

exports.VoteModal = VoteModal;

