var express = require('express');
var router = express.Router();
var blockproducers = require('./blockproducers')
// Connect to mongo
var mongo = require('mongodb'); 

var url = "mongodb://mongo:27017/eos-voter";

var MongoClient = mongo.MongoClient;

/* GET home page. */
router.get('/', function(req, res, next) {
    return MongoClient.connect(url, function(err, connected_db) {
      // Connect to mongodb and query the list of block producers
      if (err) throw err;
      db = connected_db;
      var dbo = db.db("eos-voter");
      dbo.createCollection("block_producers", function(err, block_producers_collection) {
        if (err) throw err;
        block_producers_collection.find({}).sort({'name': 1}).toArray(function(err, result) {
           if (err) throw err;
           res.render('index', { title: 'EOS Voter',
                                 'networkname': 'Jungle Testnet',
                                 'activeblockproducers': result,
                                 'backupblockproducers': blockproducers.getBackupBlockProducers(),
                                 });
         });
      });
    });
});

module.exports = router;
