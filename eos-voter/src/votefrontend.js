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
import {VoteView} from './vote-view.js';

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
  "/": VoteView,
} )
