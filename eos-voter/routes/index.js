// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details

var express = require('express');
var router_index = express.Router();
var router_vote = express.Router();
var utils = require('../utils/utils.js');
var config = require('../config');
var Humanize = require('humanize-plus');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://" + config.mongodb_server + ":27017/";
var {sprintf} = require('sprintf')

function ProcessBPListRequest(res, template) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("eos_producers");
    var query = { "_id": 1 };
    dbo.collection(config.mongodb_prefix + "producers").find(query).toArray(function(err, result) {
      if (err) throw err;
      var producers = result[0]['producers'];
      var total_votes = parseFloat(result[0]['total_votes']);
      var chain_id = result[0]['chain_id']
      var total_activated_stake = result[0]['total_activated_stake']
      var updatetime = result[0]['updatetime']

      var producer_list = Object.keys(producers).map((key) => producers[key] );
      producer_list.sort((a, b) => { return parseFloat(b.total_votes) - parseFloat(a.total_votes); });

      dbo.collection(config.mongodb_prefix + "bp_info").find().toArray(function(err, result2) {
        var bp_info = {};
        for (let i = 0; i < result2.length ; i++) {
          bp_info[result2[i]._id] = result2[i];
        }
        let active_block_producers = producer_list.map((x) => utils.format_block_producer(x, total_votes, bp_info));
        for (let i = 0; i < active_block_producers.length; i++) {
          active_block_producers[i].position = sprintf('%02d', i + 1);
        }
        let backup_block_producers = active_block_producers.slice(21);
        active_block_producers = active_block_producers.slice(0, 21);

        has_activated = total_activated_stake > config.min_activated_stake;

        res.render(template, { title: 'EOS Voter',
                              chainname: config.chain_name,
                             'activeblockproducers': active_block_producers,
                             'backupblockproducers': backup_block_producers,
                             'block_producer_list_empty': (active_block_producers.length + backup_block_producers.length) == 0,
                             'landing_page_content': config.landing_page_content,
                             'chainid': chain_id,
                             'total_activated_stake': Humanize.formatNumber(total_activated_stake / 10.0 / 1000),
                             'min_activated_stake': Humanize.formatNumber(config.min_activated_stake / 10.0 / 1000),
                             'activated_percent': (total_activated_stake / config.min_activated_stake * (15.0 / 100.0) * 100.0).toFixed(2),
                             'has_activated': has_activated,
                             'has_activated_message': config.has_activated_message,
                             'protocol': config.protocol,
                             'chainaddr': config.chain_addr,
                             'chainport': config.chain_port,
                             'chain_secure_port': config.chain_secure_port,
                             'chain_protocol': config.protocol,
                             'voting_page_content': config.voting_page_content,
                             'raw_total_activated_stake': total_activated_stake /10.0 / 1000.0,
                             'updatetime': updatetime,
                             });
      });

    });
  });

}

/* GET home page. */
router_index.get('/', function(req, res, next) {
  ProcessBPListRequest(res, 'index');
});

router_vote.get('/', function(req, res, next) {
  ProcessBPListRequest(res, 'vote');
});

module.exports = { }

module.exports.indexRouter = router_index;
module.exports.voteRouter = router_vote;
