// This file is part of eos-voter and is licenced under the Affero GPL 3.0 licence. See LICENCE file for details

var express = require('express');
var router = express.Router();
var chaininspector = require('../tasks/chainInspector')
var utils = require('../utils/utils.js');
var config = require('../config');
var Humanize = require('humanize-plus');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://mongo:27017/";
var {sprintf} = require('sprintf')

/* GET home page. */
router.get('/', function(req, res, next) {
    //let total_votes = utils.get_total_votes();

    //let active_block_producers = chaininspector.get_active_block_producers().map((x) => utils.format_block_producer(x, total_votes));
    //let backup_block_producers = chaininspector.get_backup_block_producers().map((x) => utils.format_block_producer(x, total_votes));
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("eos_producers");
      var query = { "_id": 1 };
      dbo.collection("producers").find(query).toArray(function(err, result) {
        if (err) throw err;
        //console.log("result=", result);
        var producers = result[0]['producers'];
        //console.log("1 result[0]['total_votes']=", result[0]['total_votes'])
        //console.log("1 typeof result[0]['total_votes']=", typeof result[0]['total_votes'])
        var total_votes = parseFloat(result[0]['total_votes']);
        var chain_id = result[0]['chain_id']
        var total_activated_stake = result[0]['total_activated_stake']
        //console.log("1 total_votes=", total_votes)

        var producer_list = Object.keys(producers).map((key) => producers[key] );
        producer_list.sort((a, b) => { return parseFloat(b.total_votes) - parseFloat(a.total_votes); });
        //console.log("Producers2=", producer_list);

        dbo.collection("bp_info").find().toArray(function(err, result2) {
          console.log('result2=', result2)
          var bp_info = {};
          for (let i = 0; i < result2.length ; i++) {
            bp_info[result2[i]._id] = result2[i];
          }
          let active_block_producers = producer_list.map((x) => utils.format_block_producer(x, total_votes, bp_info));
          for (let i = 0; i < active_block_producers.length; i++) {
            active_block_producers[i].position = sprintf('%02d', i + 1);
          }
          let backup_block_producers = active_block_producers.slice(21);
          //console.log("backup_block_producers=", backup_block_producers);
          active_block_producers = active_block_producers.slice(0, 21);

          has_activated = total_activated_stake > config.min_activated_stake;

          res.render('index', { title: 'EOS Voter',
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
                               });
        });

      });
    });

/*
    var active_block_producers = [];
    var backup_block_producers = [];

    res.render('index', { title: 'EOS Voter',
                          chainname: config.chain_name,
                         'activeblockproducers': active_block_producers,
                         'backupblockproducers': backup_block_producers,
                         'block_producer_list_empty': (active_block_producers.length + backup_block_producers.length) == 0,
                         'landing_page_content': config.landing_page_content,
                         'chainid': chaininspector.get_chainid(),
                         'total_activated_stake': Humanize.formatNumber(chaininspector.get_total_activated_stake() / 10.0 / 1000),
                         'min_activated_stake': Humanize.formatNumber(config.min_activated_stake / 10.0 / 1000),
                         'activated_percent': (chaininspector.get_total_activated_stake() / config.min_activated_stake * (15.0 / 100.0) * 100.0).toFixed(2),
                         'has_activated': utils.has_activated(),
                         'has_activated_message': config.has_activated_message,
                         });
                         */
});

module.exports = router;
