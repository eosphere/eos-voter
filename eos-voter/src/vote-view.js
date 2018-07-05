// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details
let exports = module.exports = {};

let m = require("mithril");
let eosjs= require('eosjs');
let Humanize = require('humanize-plus');
let {DetectScatterModal} = require('./detect-scatter-modal.js');
let {ConnectingToScatter} = require('./connecting-to-scatter-modal.js');
let {VoteModal} = require('./vote-modal.js');
let {ModalStackMixin} = require('./eosvoter-modal.js');
let {StakeModal} = require('./stake-modal.js');
let {UnstakeModal} = require('./unstake-modal.js');
let {ErrorModal, errorDisplay, ErrorOKModal} = require('./error-modal.js');
let {NotDetectedModal} = require('./not-detected-modal.js');

var globals = require('./globals.js');

function eos_to_float(s) {
    //console.log('eos_to_float s=', s);
    var ret = s ? s.split(" ")[0] : 0;
    return parseFloat(ret);
}

class VoteView extends ModalStackMixin {
    constructor(vnode) {
      super();

      document.addEventListener('scatterLoaded', scatterExtension => {
          console.log('scatterLoaded called');

          if (globals.scatter != null)
            return;

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
        globals.proxy_name = document.getElementById('id-proxy-name').value;
        let checkboxes = Array.prototype.slice.call(document.getElementsByClassName("vote-checkbox"));
        globals.votes = checkboxes.filter(cb => cb.checked).map(cb => cb.getAttribute('id'));
        globals.votes.sort();
    }

    cast_vote() {
        if (globals.proxy_name === '' && globals.votes.length > 30)
            this.push_modal([ErrorOKModal, {owner: this, error_messages: ['Too many votes. You can only vote for 30 producers']}, null]);
        else
            this.push_modal([VoteModal, {owner: this, proxy_name: globals.proxy_name, votes: globals.votes}, null]);
    }

    display_connection_modal() {
      //Display the connecting screen
      this.push_modal([ConnectingToScatter, {owner: this, on_close: this.pop_modal}, null]);
      m.redraw();

      this.redrawAll();
    }

    current_vote() {
        let regions = (globals.active_block_producers.concat(globals.backup_block_producers))
            .filter((x) => globals.votes.includes(x.name)).map((x) => x.region)
            .filter((x) => x != '');
        let region_count = new Set(regions).size
        return m('p.header-info-text', (globals.proxy_name == '' ? ['Voting for ', m('strong', globals.votes.length), ' producers in '
                 , m('strong', region_count), ' regions ',
                 m('a', {'style': {'color':'white'}, 'href': '#!more-info-my-votes', 'onclick': (e) => {m.route.set('#!more-info-my-votes');}}, 'More info')] :
                  [  m('strong', 'Proxing vote to ' + globals.proxy_name + ' ') ]
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
            if (global.scatter != null) {
              this.push_modal([DetectScatterModal, {owner: this}, null]);
              this.set_pop_listener_fn(() => { this.redrawAll() });
            }
        }
    }

    redrawAll() {
        if (globals.active_block_producers.length == 0 && globals.backup_block_producers.length == 0)
            return;

       if (globals.has_loaded)
         return;

        var eos = globals.scatter.eos( globals.network, eosjs.Localnet, globals.eosOptions, globals.chain_protocol );

        const requiredFields = {
            accounts:[ globals.network ],
        };

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
                            globals.account_name = identity.accounts[0].name;
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
                                    globals.balance = row ? row.balance.split(" ")[0] : 0;
                                    m.redraw();
                            }).catch(
                                (error) => {
                                    errorDisplay(this.owner, 'Scatter returned an error from getTableRows', error);
                                    console.error('getTableRows error = ', error);
                            })

                            if (result.voter_info) {
                                globals.votes = result.voter_info.producers;
                                globals.proxy_name = result.voter_info.proxy;
                            } else {
                                globals.votes = [];
                                globals.proxy_name = '';
                            }
                            if (/*result.delegated_bandwidth == null || */(eos_to_float(result.total_resources.cpu_weight) == 0
                                && eos_to_float(result.total_resources.net_weight) == 0))
                            {
                                globals.delegated_cpu_weight = '0';
                                globals.delegated_net_weight = '0';
                            } else {
                                globals.delegated_cpu_weight = result ? result.total_resources.cpu_weight.split(" ")[0] : 0;
                                globals.delegated_net_weight = result ? result.total_resources.net_weight.split(" ")[0] : 0;
                            }
                            globals.has_loaded = true;

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
                            ((globals.votes.includes(block_producer.id)) ? {'checked': 'checked'} : {}))),
                       m('span', {'class': 'checkmark'}),
                     ]),
                   ]),
                   m('div', {'class': 'block-producer-cell block-producer-cell-2'}, (!block_producer.fake_bp ? [
                     m('span', block_producer.position + ' '),
                   ((globals.block_producer_invalid_images.includes(block_producer.name) || block_producer.bp_logo_256 == '') ? [] : [
                      m('img.bp-small-logo', {'src':(block_producer.name in globals.block_producer_invalid_images) ? '' : block_producer.bp_logo_256, 'onerror': (x) => {globals.block_producer_invalid_images.push(block_producer.name); m.redraw(); /*x.target.src = '';*/ }}),
                    ]),
                    m('span', block_producer.name),

                   ]:[
                     m('span.fake-bp-title', block_producer.position + ' '),
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

  vote_for_eosphere() {
    //let bp_name = 'lioninjungle';
    let bp_name = 'eosphereiobp';
    if (globals.votes.includes(bp_name))
      return m('p.header-info-text', 'Thanks for voting for EOSphere');
    else
      return m('p.header-info-text', [
        'Service provided by EOSphere ',
        m('a', {'style': {'color':'white'}, href:'#',
                'onclick': (e) => {globals.votes.push(bp_name); globals.votes.sort();}},
                'Vote for EOSphere'),
      ])
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
                     m("a", {'class': 'signupbutton', 'href': '#!cast', 'onclick': (e) => {m.route.set('#!cast');}}, 'Cast Vote'),
                   ]),
                 ]),
                 m("div", {'class': 'pageheader-part2'}, [
                   m("div", {'style': {'width': 'calc(100% - 272px)',
                                       'height': '60px',
                                       'display': 'inline-block',
                                       'max-height':'60px'}}, [
                     m("div", {'class': 'header-info-block-container'}, [
                       m("div", {'class': 'header-info-block'}, [
                         m("p.header-info-text", [
                           m('strong', 'Name:'),
                           globals.account_name,
                         ])
                       ]),
                     ]),
                     m("div", {'class': 'header-info-block-container'}, [
                       m("div", {'class': 'header-info-block'}, [
                         m("span", [
                           m('p.header-info-text', [
                             m('strong', 'Available:'),
                             ' ' + globals.balance
                           ]),
                           m('p.header-info-text', [
                             ' Delegated CPU: ' + globals.delegated_cpu_weight,
                           ]),
                           m('p.header-info-text', [
                             'Net: ' + globals.delegated_net_weight,
                           ]),
                         ])
                       ]),
                     ]),
                     m("div", {'class': 'header-info-block-container'}, [
                       m("div", {'class': 'header-info-block'}, [
                         m("span", [
                           this.current_vote(),
                           this.vote_for_eosphere(),

                         ])
                       ]),
                     ]),
                   ]),
                   m("div", {'class':"more-options-dropdown"}, [
                     m("span", [
                       "More Options ",
                       m("i", {"class":"fa fa-chevron-down"}),
                     ]),
                     m("div", {'class':"more-options-dropdown-content"}, [
                       m("div", {'class': 'more-options-item'}, [
                         m('a', {'class': 'more-options-item-link', href: '#!stake', 'onclick': (e) => {m.route.set('#!stake');}}, 'Stake'),
                       ]),
                       m("div", {'class': 'more-options-item'}, [
                         m('a', {'class': 'more-options-item-link', href: '#!unstake', 'onclick': (e) => {m.route.set('#!unstake');}}, 'Unstake'),
                       ]),
                       m("div", {'class': 'more-options-item'}, [
                         m('a', {'class': 'more-options-item-link', href: '#!transfer', 'onclick': (e) => {m.route.set('#!transfer');}}, 'Transfer'),
                       ]),
                       m("div", {'class': 'more-options-item'}, [
                         m('a', {'class': 'more-options-item-link',
                                  href: '#!',
                                  'onclick': (e) => {
                                      globals.scatter.forgetIdentity().then(
                                        () => { globals.has_loaded = false;
                                                globals.account_name = '';
                                                this.redrawAll() })
                                }}, 'Sign out'),
                       ]),
                     ]),
                   ]),
                 ]),
                 m('div', {'class': 'pageheader-spacer2'}),
                 m("div", {'class': 'content-container'}, [
                   m("div", m.trust(globals.voting_page_content)),
                   m("p", {'class': 'centre'}, 'Currently connected to the ' + globals.chain_name + ' network'),
                   m("p", {'class': 'centre'}, 'Chain id = ' + globals.chain_id + '.'),
                   m("p.centre", 'Percentage of EOS voting ' + globals.activated_percent + '%'),
                   m("p.centre", Humanize.formatNumber(globals.total_activated_stake) + ' EOS have voted'),
                   (this.has_activated) ? [m("div", m.trust(globals.has_activated_message))] : [],
                 ].concat(this.block_producers_grid(globals.active_block_producers, globals.has_activated ? "Active Block Producers" : "Block Producer Candidates")).
                 concat(this.block_producers_grid(globals.backup_block_producers, "Backup Block Producers")).
                 concat([
                   m("div", [
                     m("div", {'style': 'margin-top: 15px;'}, [
                       m('div', {'style': 'display: inline-block; width: 240px;'}, [
                         m("span", "Proxy my vote to another user"),
                       ]),
                       m("span", "@"),
                       m("input", {'id': 'id-proxy-name', 'type': 'text', 'style': 'height:25px;width:200px;', 'value': globals.proxy_name}),
                       m("Button", {'class': 'vote-helper-button', 'onclick': (e) => { this.recalcVotes(); }}, "Set Proxy"),
                     ]),
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

exports.VoteView = VoteView
