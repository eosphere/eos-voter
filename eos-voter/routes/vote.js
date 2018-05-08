var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('vote', { title: 'EOS Voter - Cast my vote'});
});

module.exports = router;
