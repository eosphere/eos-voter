// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details

import m from "mithril";
import {VoteView} from './vote-view.js';
import {CastVoteView} from './cast-vote-view.js';
import {StakeView} from './stake-view.js';
import {UnstakeView} from './unstake-view.js';
import {MoreInfoMyVotesView} from './more-info-my-votes-view.js';
import {TransferView} from './transfer-view.js';
import {ProxyView} from './proxy-my-vote-view.js';

var globals = require('./globals.js');

var root = document.body

var chain_addr = document.getElementById('allblockproducers').getAttribute('data-chain-addr');
var chain_port = document.getElementById('allblockproducers').getAttribute('data-chain-port');
var chain_secure_port = document.getElementById('allblockproducers').getAttribute('data-chain-secure-port');
globals.chain_protocol = document.getElementById('allblockproducers').getAttribute('data-chain-protocol');
globals.chain_name = document.getElementById('allblockproducers').getAttribute('data-chain-name');
globals.chain_id = document.getElementById('allblockproducers').getAttribute('data-chain-id');
globals.voting_page_content = document.getElementById('allblockproducers').getAttribute('data-voting-page-content');
globals.total_activated_stake = document.getElementById('allblockproducers').getAttribute('data-total-activated-stake');
globals.min_activated_stake = document.getElementById('allblockproducers').getAttribute('data-min-activated-stake');
globals.activated_percent = document.getElementById('allblockproducers').getAttribute('data-activated-percent');
globals.has_activated_message = document.getElementById('allblockproducers').getAttribute('data-has-activated-message');
globals.active_block_producers = JSON.parse(document.getElementById('allblockproducers').getAttribute('data-active-block-producers'));
globals.backup_block_producers = JSON.parse(document.getElementById('allblockproducers').getAttribute('data-backup-block-producers'));
globals.block_producer_invalid_images = [];
globals.votes = [];
globals.proxy_name = '';
globals.balance = 'Unknown';
globals.delegated_cpu_weight = 'Unknown';
globals.delegated_net_weight = 'Unknown';
globals.has_activated = parseFloat(globals.activated_percent) > 15.0;
globals.has_loaded =  false; // Has the account information loaded from the server
globals.scatter = null;
globals.account_name = '';

globals.network = {
    blockchain:'eos',
    host: chain_addr,
    port: chain_port,
    chainId: globals.chain_id,
}

globals.network_secure = {
    blockchain:'eos',
    host: chain_addr,
    port: chain_secure_port,
    chainId: globals.chain_id,
}

globals.eosOptions = {chainId: globals.chain_id,};



m.route(root, "/", {
  "": VoteView,
  "cast": CastVoteView,
  "stake": StakeView,
  "unstake": UnstakeView,
  "more-info-my-votes": MoreInfoMyVotesView,
  "transfer": TransferView,
  "proxy-my-vote": ProxyView,
} )
