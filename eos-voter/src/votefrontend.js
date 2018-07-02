// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details

import m from "mithril";
import eosjs from 'eosjs';
import Humanize from 'humanize-plus';
import {DetectScatterModal} from './detect-scatter-modal.js';
import {ConnectingToScatter} from './connecting-to-scatter-modal.js';
import {VoteModal} from './vote-modal.js';
//import {modal_stack} from './eosvoter-modal.js';
import {ModalStackMixin} from './eosvoter-modal.js';
import {StakeModal} from './stake-modal.js';
import {UnstakeModal} from './unstake-modal.js';
import {ErrorModal, errorDisplay, ErrorOKModal} from './error-modal.js';
import {NotDetectedModal} from './not-detected-modal.js';

var globals = require('./globals.js');

var root = document.body

var chain_addr = document.getElementById('allblockproducers').getAttribute('data-chain-addr');
var chain_port = document.getElementById('allblockproducers').getAttribute('data-chain-port');
var chain_secure_port = document.getElementById('allblockproducers').getAttribute('data-chain-secure-port');
globals.chain_protocol = document.getElementById('allblockproducers').getAttribute('data-chain-protocol');
var chain_name = document.getElementById('allblockproducers').getAttribute('data-chain-name');
var chain_id = document.getElementById('allblockproducers').getAttribute('data-chain-id');
var voting_page_content = document.getElementById('allblockproducers').getAttribute('data-voting-page-content');
var total_activated_stake = document.getElementById('allblockproducers').getAttribute('data-total-activated-stake');
var min_activated_stake = document.getElementById('allblockproducers').getAttribute('data-min-activated-stake');
var activated_percent = document.getElementById('allblockproducers').getAttribute('data-activated-percent');
var has_activated_message = document.getElementById('allblockproducers').getAttribute('data-has-activated-message');
globals.active_block_producers = JSON.parse(document.getElementById('allblockproducers').getAttribute('data-active-block-producers'));
globals.backup_block_producers = JSON.parse(document.getElementById('allblockproducers').getAttribute('data-backup-block-producers'));

window.block_producer_invalid_images = [];

globals.network = {
    blockchain:'eos',
    host: chain_addr,
    port: chain_port,
    chainId: chain_id,
}

globals.network_secure = {
    blockchain:'eos',
    host: chain_addr,
    port: chain_secure_port,
    chainId: chain_id,
}

const requiredFields = {
    accounts:[ globals.network ],
};

globals.eosOptions = {chainId: chain_id,};



function eos_to_float(s) {
    //console.log('eos_to_float s=', s);
    var ret = s ? s.split(" ")[0] : 0;
    return parseFloat(ret);
}





class VoteView extends ModalStackMixin {
    constructor(vnode) {
      super();
      this.votes = [];
      this.proxy_name = '';
      this.balance = 'Unknown';
      this.delegated_cpu_weight = 'Unknown';
      this.delegated_net_weight = 'Unknown';
      this.has_activated = parseFloat(activated_percent) > 15.0;

      document.addEventListener('scatterLoaded', scatterExtension => {
          console.log('scatterLoaded called');

          if (globals.active_block_producers.length == 0 && globals.backup_block_producers.length == 0) {
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
          var ret = globals.scatter.requireVersion(5.0);

          this.display_connection_modal();
      })
    }

    recalcVotes() {
        this.proxy_name = document.getElementById('id-proxy-name').value;
        var checkboxes = Array.prototype.slice.call(document.getElementsByClassName("vote-checkbox"));
        this.votes = checkboxes.filter(cb => cb.checked).map(cb => cb.getAttribute('id'));
        this.votes.sort();
    }

    cast_vote() {
        if (this.proxy_name === '' && this.votes.length > 30)
            this.push_modal([ErrorOKModal, {owner: this, error_messages: ['Too many votes. You can only vote for 30 producers']}, null]);
        else
            this.push_modal([VoteModal, {owner: this, proxy_name: this.proxy_name, votes: this.votes}, null]);
    }

    display_connection_modal() {
      //Display the connecting screen
      this.push_modal([ConnectingToScatter, {owner: this, on_close: this.pop_modal}, null]);
      m.redraw();

      this.redrawAll();
    }

    current_vote() {
        return m('div', {'style': {'text-align':'center'}},
                 m("span.vote_info", (this.proxy_name == '' ?
                    ['You have voted for ', m('strong.bolded-vote-info', this.votes.length), ' producer candidates.'] :
                    m('strong.bolded-vote-info', 'You have proxied your vote to ' + this.proxy_name))
                 )
               )
    }

    oncreate() {
      // After two seconds complain that we couldn't detect scatter
      setTimeout(() => {
          if (globals.scatter === null) {
              this.push_modal([NotDetectedModal, {owner: this}, null]);
              m.redraw();
          }
          } ,2000);


        // If the list of block producers is empty reload the page. This usually means the server just started and is loading it's list of
        // block producers

        if (globals.active_block_producers.length == 0 && globals.backup_block_producers.length == 0) {
            setTimeout(() => document.location.reload(true), 2000);
        } else {
            this.push_modal([DetectScatterModal, {owner: this}, null]);
            this.set_pop_listener_fn(() => { this.redrawAll() });
        }
    }

    redrawAll() {
        if (globals.active_block_producers.length == 0 && globals.backup_block_producers.length == 0)
            return;

        var eos = globals.scatter.eos( globals.network, eosjs.Localnet, globals.eosOptions, globals.chain_protocol );

        globals.scatter.suggestNetwork(globals.network).then((result) => {
                globals.scatter.getIdentity(requiredFields).then(identity => {
                    // Set up any extra options you want to use eosjs with.
                    if (identity.accounts[0].authority != 'active'){
                        this.push_modal([ErrorModal, {owner: this, error_messages: ['You have chosen an account with the ' + identity.accounts[0].authority +
                              ' authority only the active authority can stake EOS. You should change identity'], show_retry: true}, null]);
                        m.redraw();
                        return;
                    }


                    // Get a reference to an 'Eosjs' instance with a Scatter signature provider.
                    eos = globals.scatter.eos( globals.network_secure, eosjs.Localnet, globals.eosOptions, globals.chain_protocol );

                    eos.getAccount({'account_name': identity.accounts[0].name}).then((result) => {
                            //console.log('getAccount result=', result);
                            this.pop_entire_stack();

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
                                    this.balance = row ? row.balance.split(" ")[0] : 0;
                                    m.redraw();
                            }).catch(
                                (error) => {
                                    errorDisplay(this.owner, 'Scatter returned an error from getTableRows', error);
                                    console.error('getTableRows error = ', error);
                            })

                            if (result.voter_info) {
                                this.votes = result.voter_info.producers;
                                this.proxy_name = result.voter_info.proxy;
                            } else {
                                this.votes = [];
                                this.proxy_name = '';
                            }
                            if (/*result.delegated_bandwidth == null || */(eos_to_float(result.total_resources.cpu_weight) == 0
                                && eos_to_float(result.total_resources.net_weight) == 0))
                            {
                                this.delegated_cpu_weight = '0';
                                this.delegated_net_weight = '0';
                            } else {
                                this.delegated_cpu_weight = result ? result.total_resources.cpu_weight.split(" ")[0] : 0;
                                this.delegated_net_weight = result ? result.total_resources.net_weight.split(" ")[0] : 0;
                            }

                            m.redraw();
                        })
                        .catch(   (e) => {
                                        console.error('Error returned by getAccount = ', e);
                                        errorDisplay(this.owner, 'Scatter returned an error from getAccount', e);
                                        }
                        );

                }).catch(error => {
                    console.error('scatter.getIdentity() gave error=', error);
                    if (error.type == 'identity_rejected') {
                        this.push_modal([ErrorModal, {owner: this, error_messages: ['No identity was chosen. Please config an identity in Scatter and link it to your private key'], show_retry: true}, null]);
                        m.redraw();
                    } else
                        errorDisplay(this.owner, 'Scatter returned an error from getIdentity', error);
                });


                m.redraw();



            }).catch((error) => {
                console.error('Suggested network was rejected result=', error);
                if (error.type == "locked") {
                    this.push_modal([ErrorModal, {owner: this, error_messages: ['Scatter is locked. Please unlock it and then retry'], show_retry: true}, null]);
                    m.redraw();
                } else
                    errorDisplay(this.owner, 'Scatter returned an error from suggestNetwork', error);
            });
    }

    block_producers_grid(block_producer_list, description) {
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
                   m('div', {'class': 'block-producer-cell block-producer-cell-4 block-producer-column-header'}, 'Country'),
                   m('div', {'class': 'block-producer-cell block-producer-cell-5 block-producer-column-header'}, 'Information'),
                 ]),

               ].concat(block_producer_list.map((block_producer) => {
                 return m('div', {'class': 'block-producer-row'}, [
                   m('div', {'class': 'block-producer-cell block-producer-cell-1 block-producer-column-header'}, [
                     m('label', {'class': 'checkbox-container'}, [
                       m.trust('&nbsp;'),
                       m('input', Object.assign({}, {'class': 'vote-checkbox', 'id': block_producer.id,'type': 'checkbox', 'onchange': (e) => { this.recalcVotes() }},
                            ((this.votes.includes(block_producer.id)) ? {'checked': 'checked'} : {}))),
                       m('span', {'class': 'checkmark'}),
                     ]),
                   ]),
                   m('div', {'class': 'block-producer-cell block-producer-cell-2'}, (!block_producer.fake_bp ? [
                   ((window.block_producer_invalid_images.includes(block_producer.name) || block_producer.bp_logo_256 == '') ? [] : [
                      m('img.bp-small-logo', {'src':(block_producer.name in window.block_producer_invalid_images) ? '' : block_producer.bp_logo_256, 'onerror': (x) => {window.block_producer_invalid_images.push(block_producer.name); m.redraw(); /*x.target.src = '';*/ }}),
                    ]),
                    m('span', block_producer.name),

                   ]:[
                     m('span.fake-bp-title', block_producer.name),
                     m('span.fake-bp-warning', ' !CAUTION! '),
                     m('a', {'class': 'fake-bp-whats-this', 'href':'/whats-this-bp-name-mismatch', 'target':'_blank'}, 'Whats this'),
                   ])),
                   m('div', {'class': 'block-producer-cell block-producer-cell-3 right'}, [
                     m('span.small-vote-total', block_producer.votes_absolute + 'M'),
                     ' ', block_producer.votes_percent,
                   ]),
                   m('div', {'class': 'block-producer-cell block-producer-cell-4'}, [block_producer.country_code, m.trust('&nbsp;')]),
                   m('div', {'class': 'block-producer-cell block-producer-cell-5'}, block_producer.valid_url ?
                     [m('a', {'href': block_producer.statement, 'class': 'statement', 'target': '_blank'}, block_producer.statement)] :
                       [block_producer.statement, m.trust('&nbsp;')]),
                 ]);
                }))

               ),
        ];
    }

  view() {
        return m("main", [
                 m("div", {'class': 'pageheader'}, [
                   m("div", {'class': 'pageheaderitem'}, [
                     m("img", {'class': 'eoslogo', 'src': '/images/Logo-dark-landscape-v2-1.png'})
                   ]),
                   m("div", {'class': 'centre-header'}, [
                     m("h1", {'class': 'centre-h1'}, "EOS Voter")
                   ]),
                   m("div", {'class': 'pageheaderitem signupbuttoncontainer'}, [
                     m("button", {'class': 'signupbutton', 'onclick': (e) => {this.cast_vote()}}, 'Cast Vote'),
                   ]),
                 ]),
                 m('div', {'class': 'pageheader-spacer'}),
                 m("div", {'class': 'content-container'}, [
                   m("div", m.trust(voting_page_content)),
                   this.current_vote(),
                   m("p", {'class': 'centre'}, 'Currently connected to the ' + chain_name + ' network'),
                   m("p", {'class': 'centre'}, 'Chain id = ' + chain_id + '.'),
                   m("p.centre", 'Percentage of EOS voting ' + activated_percent + '%'),
                   m("p.centre", Humanize.formatNumber(total_activated_stake) + ' EOS have voted ' + Humanize.formatNumber(min_activated_stake) + ' needed to activate the chain'),
                   (this.has_activated) ? [m("div", m.trust(has_activated_message))] : [],
                 ].concat(this.block_producers_grid(globals.active_block_producers, this.has_activated ? "Active Block Producers" : "Block Producer Candidates")).
                 concat(this.block_producers_grid(globals.backup_block_producers, "Backup Block Producers")).
                 concat([
                   m("div", [
                     m("div", {'style': 'margin-top: 15px;'}, [
                       m('div', {'style': 'display: inline-block; width: 240px;'}, [
                         m("span", "Proxy my vote to another user"),
                       ]),
                       m("span", "@"),
                       m("input", {'id': 'id-proxy-name', 'type': 'text', 'style': 'height:25px;width:200px;', 'value': this.proxy_name}),
                       m("Button", {'class': 'vote-helper-button', 'onclick': (e) => { this.recalcVotes(); }}, "Set Proxy"),
                     ]),
                     m("div", {'style': 'margin-top: 15px; margin-bottom: 15px;'}, [
                       m('div', {'style': 'display: inline-block; max-width: 458.2px;'}, [
                         'Your EOS balance is ' + this.balance + ' EOS. Delegated CPU = ' + this.delegated_cpu_weight +
                         ' EOS. Delegated Net = ' + this.delegated_net_weight + ' EOS.',
                       ]),
                       m('button', {'class': 'vote-helper-button',
                                    'onclick': (e) => { this.push_modal([StakeModal,
                                      {owner: this,
                                       delegated_cpu_weight: this.delegated_cpu_weight,
                                       delegated_net_weight: this.delegated_net_weight,
                                       balance: this.balance}, null]); }}, 'Stake now'),
                     ]),
                     m("div", {'style': 'margin-top: 15px; margin-bottom: 15px;'}, [
                       m('div', {'style': 'display: inline-block; width: 458.2px;'}, [
                         m.trust('&nbsp;'),
                       ]),
                       m('button', {'class': 'vote-helper-button', 'onclick': (e) => {
                         this.push_modal([UnstakeModal,
                           {
                             owner: this,
                             delegated_cpu_weight: this.delegated_cpu_weight,
                             delegated_net_weight: this.delegated_net_weight,
                             balance: this.balance
                           }, null]); }}, 'Unstake now'),
                     ]),
                     m("div", {'style': 'margin-top: 15px; margin-bottom: 15px;'}, [
                       m('div', {'style': 'display: inline-block; width: 458.2px;'}, [
                         'Sign out of scatter and load another identity',
                       ]),
                       m('button', {'class': 'vote-helper-button',
                                    'onclick': (e) => { globals.scatter.forgetIdentity().then(() => { this.redrawAll() }) }}, 'Change identity'),
                     ]),
                     this.current_vote(),
                   ]),
                 ])),
               ].concat(this.get_current_modal()
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
m.route(root, "/", {
  "/": VoteView,
} )
