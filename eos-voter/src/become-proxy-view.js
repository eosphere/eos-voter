// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details
let exports = module.exports = {};

let {VoteView} = require('./vote-view.js');
let m = require("mithril");
var {EosVoterModal} = require('./eosvoter-modal.js');
var {errorDisplay} = require('./error-modal.js');
var eosjs = require('eosjs');
var {OKModal} = require('./ok-modal.js');

let ScatterJS = require('scatterjs-core');
let ScatterEOS = require('scatterjs-plugin-eosjs');
let Eos = require('eosjs');
ScatterJS = ScatterJS.default;
ScatterEOS = ScatterEOS.default;
ScatterJS.plugins( new ScatterEOS() );

let globals = require('./globals.js');
let utils = require('./utils.js');

class BecomeProxyModal extends EosVoterModal {
    constructor(vnode) {
        super(vnode);
        this.delegated_cpu_weight = vnode.attrs.delegated_cpu_weight;
        this.delegated_net_weight = vnode.attrs.delegated_net_weight;
        this.balance = vnode.attrs.balance;
        this.is_processing = false;
        this.is_proxy = globals.is_proxy;
    }

    can_close() { return !this.is_processing; };

    proxy_now() {
        if (this.is_processing)
            return;
        this.is_processing = true;

    const requiredFields = {
        accounts:[ utils.get_network() ],
    };
    //globals.scatter.suggestNetwork(globals.network).then((result) => {
        ScatterJS.scatter.getIdentity(requiredFields).then(identity => {

            var eos = ScatterJS.scatter.eos(utils.get_network(), Eos, globals.eosjsOptions);

            eos.contract('eosio', requiredFields).then(c => {
                    eos.regproxy({'proxy': identity.accounts[0].name, 'isproxy': this.is_proxy} )
                        .then((result) => {
                            console.log('regproxy result=', result);
                            this.owner.push_modal([OKModal, {
                              owner: this.owner,
                              info_message: 'Proxy registration was submitted successfully.\n Transaction id = \'' + result.transaction_id + '\'',
                            }]);
                            globals.is_proxy = this.is_proxy;
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
        return [
                 m('h2', {'style': {'text-align': 'center'}}, 'Register as a Proxy'),
                 m('div', {'style': {'width': '100%', 'height': 'calc(100% - 120px - 49px)'}}, [
                   m('p', {'class': 'constitution-agreement-text', 'style': {'text-align': 'center', 'color': 'red'}}, [
                     'By Proxying and voting you are agreeing to the ',
                     m('a', {'class': 'constitution-agreement-link',
                             'href': 'https://github.com/EOS-Mainnet/governance/blob/master/eosio.system/eosio.system-clause-constitution-rc.md',
                             'target': '_blank'},
                             'EOS Constitution detailed here'),
                   ]),
                   m('div', {'style': {'margin-bottom': '3px'}}, [
                     m('div', {'style': {'width': '140px', 'display': 'inline-block'}}, [
                       m('label', {'for': 'id-is-proxy'}, 'Register as proxy'),
                     ]),
                     m('div', {'style': {'display': 'inline-block'}}, [
                       m('label', {'class': 'checkbox-container', 'style': {'top': '-18px'}}, [
                         m('input', Object.assign({}, {'class': 'vote-checkbox', 'type': 'checkbox', 'id': 'id-is-proxy',
                                       'onchange': (e) => { this.is_proxy = 1 - this.is_proxy;
                                       document.getElementById('id-is-proxy').checked=(this.is_proxy == 1);},
                                       },
                                       ( (this.is_proxy == 1) ? {'checked': 'checked'} : {} ))),
                         m('span', {'class': 'checkmark checkmark-register-proxy'}),
                       ]),
                     ]),
                   ]),

                 ]),
                 m('div', {'style': {'width': '100%', 'height': '120px'}}, [
                   m('div', {'style': {'text-align': 'center'}}, [
                     m("Button", {'class': 'big-vote-now-button', 'onclick': e => this.proxy_now()},
                       (this.is_processing == false ? "Register Now" : [
                       m('span', {'style': {'display': 'inline-block'}}, "Registering"),
                       m('div', {'class': 'loader', 'style': {'display': 'inline-block', 'margin-left': '5px'}}),
                     ])),
                   ]),
                   m('div', [
                     m("a", {'class': 'vote-helper-button popup-cancel-button', 'href': '#!', 'onclick': (e) => {m.route.set('#!');}
                              }, "Cancel"),
                   ]),
                 ]),
               ]
    }
}

class BecomeProxyView extends VoteView {
  oncreate() {
    super.oncreate();
  }
  get_current_modal() {
    let ret =  super.get_current_modal();
    if (ret.length === 0) {
      let inst = m(BecomeProxyModal, {owner: this,
        delegated_cpu_weight: globals.delegated_cpu_weight,
        delegated_net_weight: globals.delegated_net_weight,
        balance: globals.balance});
      return [inst];
    } else {
      return ret;
    }
  }
}
exports.BecomeProxyView = BecomeProxyView
