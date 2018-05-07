var express = require('express');
var router = express.Router();

function getActiveBlockProducer() {
    return [
             {'name': 'Simon', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'name': 'Peter', 'votes': '990,000', 'statement': 'Yellow'},
             {'name': 'Jones', 'votes': '980,000', 'statement': 'I am good'},
             {'name': 'Simon', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'name': 'Peter', 'votes': '990,000', 'statement': 'Yellow'},
             {'name': 'Jones', 'votes': '980,000', 'statement': 'I am good'},
             {'name': 'Simon', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'name': 'Peter', 'votes': '990,000', 'statement': 'Yellow'},
             {'name': 'Jones', 'votes': '980,000', 'statement': 'I am good'},
             {'name': 'Simon', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'name': 'Peter', 'votes': '990,000', 'statement': 'Yellow'},
             {'name': 'Jones', 'votes': '980,000', 'statement': 'I am good'},
             {'name': 'Simon', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'name': 'Peter', 'votes': '990,000', 'statement': 'Yellow'},
             {'name': 'Jones', 'votes': '980,000', 'statement': 'I am good'},
             {'name': 'Simon', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'name': 'Peter', 'votes': '990,000', 'statement': 'Yellow'},
             {'name': 'Jones', 'votes': '980,000', 'statement': 'I am good'},
             {'name': 'Simon', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'name': 'Peter', 'votes': '990,000', 'statement': 'Yellow'},
             {'name': 'Jones', 'votes': '980,000', 'statement': 'I am good'},
           ]
}

function getBackupBlockProducer() {
    return [
             {'name': 'Elizabeth', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'name': 'Sarah', 'votes': '990,000', 'statement': 'Yellow'},
             {'name': 'Kelly', 'votes': '980,000', 'statement': 'I am good'},
             {'name': 'Elizabeth', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'name': 'Sarah', 'votes': '990,000', 'statement': 'Yellow'},
             {'name': 'Kelly', 'votes': '980,000', 'statement': 'I am good'},
             {'name': 'Elizabeth', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'name': 'Sarah', 'votes': '990,000', 'statement': 'Yellow'},
             {'name': 'Kelly', 'votes': '980,000', 'statement': 'I am good'},
             {'name': 'Elizabeth', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'name': 'Sarah', 'votes': '990,000', 'statement': 'Yellow'},
             {'name': 'Kelly', 'votes': '980,000', 'statement': 'I am good'},
             {'name': 'Elizabeth', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'name': 'Sarah', 'votes': '990,000', 'statement': 'Yellow'},
             {'name': 'Kelly', 'votes': '980,000', 'statement': 'I am good'},
             {'name': 'Elizabeth', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'name': 'Sarah', 'votes': '990,000', 'statement': 'Yellow'},
             {'name': 'Kelly', 'votes': '980,000', 'statement': 'I am good'},
             {'name': 'Elizabeth', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'name': 'Sarah', 'votes': '990,000', 'statement': 'Yellow'},
             {'name': 'Kelly', 'votes': '980,000', 'statement': 'I am good'},
             {'name': 'Elizabeth', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'name': 'Sarah', 'votes': '990,000', 'statement': 'Yellow'},
             {'name': 'Kelly', 'votes': '980,000', 'statement': 'I am good'},
             {'name': 'Elizabeth', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'name': 'Sarah', 'votes': '990,000', 'statement': 'Yellow'},
             {'name': 'Kelly', 'votes': '980,000', 'statement': 'I am good'},
             {'name': 'Elizabeth', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'name': 'Sarah', 'votes': '990,000', 'statement': 'Yellow'},
             {'name': 'Kelly', 'votes': '980,000', 'statement': 'I am good'},
             {'name': 'Elizabeth', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'name': 'Sarah', 'votes': '990,000', 'statement': 'Yellow'},
             {'name': 'Kelly', 'votes': '980,000', 'statement': 'I am good'},
             {'name': 'Elizabeth', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'name': 'Sarah', 'votes': '990,000', 'statement': 'Yellow'},
             {'name': 'Kelly', 'votes': '980,000', 'statement': 'I am good'},
             {'name': 'Elizabeth', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'name': 'Sarah', 'votes': '990,000', 'statement': 'Yellow'},
             {'name': 'Kelly', 'votes': '980,000', 'statement': 'I am good'},
             {'name': 'Elizabeth', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'name': 'Sarah', 'votes': '990,000', 'statement': 'Yellow'},
             {'name': 'Kelly', 'votes': '980,000', 'statement': 'I am good'},
             {'name': 'Elizabeth', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'name': 'Sarah', 'votes': '990,000', 'statement': 'Yellow'},
             {'name': 'Kelly', 'votes': '980,000', 'statement': 'I am good'},
             {'name': 'Elizabeth', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'name': 'Sarah', 'votes': '990,000', 'statement': 'Yellow'},
             {'name': 'Kelly', 'votes': '980,000', 'statement': 'I am good'},
             {'name': 'Elizabeth', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'name': 'Sarah', 'votes': '990,000', 'statement': 'Yellow'},
             {'name': 'Kelly', 'votes': '980,000', 'statement': 'I am good'},
           ]
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'EOS Voter',
                        'activeblockproducers': getActiveBlockProducer(),
                        'backupblockproducers': getBackupBlockProducer(),
                        });
});

module.exports = router;
