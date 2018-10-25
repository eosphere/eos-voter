// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details
let exports = module.exports = {};

//let ScatterJS = require('scatterjs-core');
//let ScatterEOS = require('scatterjs-plugin-eosjs');
//let Eos = require('eosjs');

var m = require("mithril");
var {EosVoterModal} = require('./eosvoter-modal.js');
var globals = require('./globals.js');
var eosjs = require('eosjs');
//var {modal_stack} = require('./eosvoter-modal.js');
var {OKModal} = require('./ok-modal.js');
var {errorDisplay} = require('./error-modal.js');

let ScatterJS = require('scatterjs-core');
let ScatterEOS = require('scatterjs-plugin-eosjs');
let Eos = require('eosjs');
ScatterJS = ScatterJS.default;
ScatterEOS = ScatterEOS.default;
ScatterJS.plugins( new ScatterEOS() );

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

        //globals.scatter.suggestNetwork(globals.network).then((result) => {
            //globals.scatter.getIdentity(requiredFields).then(identity => { //old
            ScatterJS.scatter.getIdentity(requiredFields).then(identity => { //new
                //var eos = globals.scatter.eos( globals.network_secure, eosjs.Localnet, globals.eosOptions, globals.chain_protocol ); //old
                eos = ScatterJS.scatter.eos(globals.network, Eos, globals.eosjsOptions); // new

                eos.contract('eosio', requiredFields).then(c => {
                        eos.voteproducer({'voter': identity.accounts[0].name, 'proxy': this.proxy_name, 'producers': this.proxy_name != '' ? [] : this.votes} )
                            .then((result) => {
                                console.log('voteproducer result=', result);
                                this.owner.push_modal([OKModal, {
                                  owner: this.owner,
                                  info_message: 'Your vote was submitted successfully.\n Transaction id = \'' + result.transaction_id + '\'',
                                }, null]);
                                m.redraw();
                            })
                            .catch((error) => {
                                console.error('voteproducer error=', error);
                                errorDisplay(this.owner, 'eosio.voteproducer returned an error', error);
                            })
                    })
                    .catch(e => {
                        errorDisplay('get contract returned an error', e);
                        console.log(this.owner, 'contract error e=', e)
                    });
                })
                .catch(e => {
                    errorDisplay('getidentity returned an error', e);
                    console.log(this.owner, 'getidentity error e=', e)
                });
            /*})
            .catch(e => {
                errorDisplay('suggestNetwork returned an error', e);
                console.log(this.owner, 'suggestNetwork error e=', e)
            });*/
    }

    get_internal_content() {
        /*
        get_constitution_agreement

                 m('p', {'class': 'constitution-agreement-text', 'style': {'text-align': 'center', 'color': 'red'}}, [
                   'By voting you are agreeing to the ',
                   m('a', {'class': 'constitution-agreement-link',
                           'href': 'https://github.com/EOS-Mainnet/governance/blob/master/eosio.system/eosio.system-clause-constitution-rc.md',
                           'target': '_blank'},
                           'EOS Constitution detailed here'),
                 ]),
        */

        return [
                 m('h2', {'style': {'text-align': 'center'}}, 'Confirm your vote'),
                 m('div', {'style': {'width': '100%', 'height': 'calc(100% - 120px - 49px)'}}, [
                   m('p', {'class': 'constitution-agreement-text', 'style': {'text-align': 'center', 'color': 'red'}}, [
                     'By voting you are agreeing to the ',
                     m('a', {'class': 'constitution-agreement-link',
                             'href': 'https://github.com/EOS-Mainnet/governance/blob/master/eosio.system/eosio.system-clause-constitution-rc.md',
                             'target': '_blank'},
                             'EOS Constitution detailed here'),
                   ]),
                 ].concat(
                   (this.proxy_name != '' ?
                       [ m('h2', {'style': {'text-align':'center'}}, 'You are voting for proxy - ' + this.proxy_name) ]
                   :
                   (this.votes.length > 0 ?
                     this.votes.map((x) => {
                       return  m('div', {'style': {'width': '165px',
                                                   'height': '48px',
                                                   'overflow': 'hidden',
                                                   'display': 'inline-block',
                                                   'border': '1px solid black',
                                                   'padding-left': '6px', 'padding-right': '6px'}}, [
                                 m('h3', x)
                               ]);
                     })
                   :
                       [ m('h2', {'style': {'text-align':'center'}}, 'You are voting for no block producer') ]
                   )))),
                 m('div', {'style': {'width': '100%', 'height': '120px'}}, [
                   m('div', {'style': {'text-align': 'center'}}, [
                     m("Button", {'class': 'big-vote-now-button', 'onclick': e => this.vote_now()},
                       (this.is_voting == false ? "Cast Vote" : [
                       m('span', {'style': {'display': 'inline-block'}}, "Voting"),
                       m('div', {'class': 'loader', 'style': {'display': 'inline-block', 'margin-left': '5px'}}),
                     ])),
                   ]),
                 ].concat(this.is_voting ? [] : [
                   m('div', [
                     m("a", {'class': 'vote-helper-button popup-cancel-button', 'href': '#!', 'onclick': (e) => {m.route.set('#!');}
                             }, "Cancel"),
                   ]),
                 ])),
               ];
    }
}

exports.VoteModal = VoteModal;
