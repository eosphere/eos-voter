var exports = module.exports = {};

exports.getActiveBlockProducers = function() {
    return [
/*             {'id': '3b887c39-e497-4984-8ce1-5f01abec8c95', 'name': 'Simon', 'votes': '1,000,000', 'statement': 'Blah\" Blah'},
             {'id': '063d27bb-ec73-4baf-9f08-1918d5405a01', 'name': 'Peter', 'votes': '990,000', 'statement': 'Yel\'low'},
             {'id': '004b08bc-6494-4466-9c4a-6b0a4805aa05', 'name': 'Jones', 'votes': '980,000', 'statement': 'I am good'},
             {'id': 'd4f5cca3-42d6-4e6a-ab7e-4da0b4bd885d', 'name': 'Simon', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'id': '2b30e6a1-ae69-4151-8d4e-3836e1656bb8', 'name': 'Peter', 'votes': '990,000', 'statement': 'Yellow'},
             {'id': 'ed014049-a76e-4fca-8a60-d4bfdb6cb18d', 'name': 'Jones', 'votes': '980,000', 'statement': 'I am good'},
             {'id': '6374bd84-d631-4e94-a4f0-508cbc22e3b7', 'name': 'Simon', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'id': '2e602721-2c4e-464a-baa2-49f8c836371a', 'name': 'Peter', 'votes': '990,000', 'statement': 'Yellow'},
             {'id': '3891c4e1-b49b-4608-af4a-cff7196a38d5', 'name': 'Jones', 'votes': '980,000', 'statement': 'I am good'},
             {'id': 'a3e35a06-9f69-47e5-9fee-4959c7642e7c', 'name': 'Simon', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'id': '6b4ea36c-e131-4d4a-8d10-c8ee00dff1d4', 'name': 'Peter', 'votes': '990,000', 'statement': 'Yellow'},
             {'id': 'abcece8a-b129-4aa7-bff7-9473aa350032', 'name': 'Jones', 'votes': '980,000', 'statement': 'I am good'},
             {'id': 'a0394727-f571-485c-aa74-12f72c51d2f3', 'name': 'Simon', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'id': 'b34e7a7b-793b-4491-ae7a-0372f2ebeee2', 'name': 'Peter', 'votes': '990,000', 'statement': 'Yellow'},
             {'id': '5db1b236-7ac2-4237-b539-fd672510aaa2', 'name': 'Jones', 'votes': '980,000', 'statement': 'I am good'},
             {'id': '7b7c990e-ddac-47f3-a789-01fcbfcc2834', 'name': 'Simon', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'id': 'a0c67a55-1313-4543-8071-b444c678d9a8', 'name': 'Peter', 'votes': '990,000', 'statement': 'Yellow'},
             {'id': '23a8a506-f389-4ef7-9b2a-23e4ec692785', 'name': 'Jones', 'votes': '980,000', 'statement': 'I am good'},
             {'id': '19c42dba-4be2-41e4-a7d1-cbb3be9acf62', 'name': 'Simon', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'id': '16ee4037-2ebd-4019-9c53-f4bd1712998f', 'name': 'Peter', 'votes': '990,000', 'statement': 'Yellow'},
             {'id': '0e922b60-a185-4145-b8c7-1de4ca311efd', 'name': 'Jones', 'votes': '980,000', 'statement': 'I am good'},*/
           ]
}

exports.getBackupBlockProducers = function() {
    return [
/*             {'id': 'e6d00577-e97d-4965-88c0-2d9dda220d22', 'name': 'Elizabeth', 'votes': '1,000,000', 'statement': 'Blah\' Blah'},
             {'id': 'faa8364f-c368-42f9-bb90-419d65fb13bc', 'name': 'Sarah', 'votes': '990,000', 'statement': 'Yellow'},
             {'id': '66a9dd16-585b-4211-8ce0-26d2398f1c22', 'name': 'Kelly', 'votes': '980,000', 'statement': 'I am good'},
             {'id': '7e6ef68f-1d57-4c83-8ac5-9d19201e3a4d', 'name': 'Elizabeth', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'id': '120a7799-b5b9-46af-9d2f-ea630b618d8a', 'name': 'Sarah', 'votes': '990,000', 'statement': 'Yellow'},
             {'id': '7711d10d-6b07-4739-b626-f04f2481e6e1', 'name': 'Kelly', 'votes': '980,000', 'statement': 'I am good'},
             {'id': '1be910a0-4f04-4162-9f78-961de3149704', 'name': 'Elizabeth', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'id': '58910afd-d3a7-40b5-a5a3-e307e5d2c86a', 'name': 'Sarah', 'votes': '990,000', 'statement': 'Yellow'},
             {'id': '292fc63e-2390-49f9-964a-f0a069c7c6be', 'name': 'Kelly', 'votes': '980,000', 'statement': 'I am good'},
             {'id': '18c24bb7-372f-4577-9315-e0b9b5090316', 'name': 'Elizabeth', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'id': '948b93f9-b9f3-4363-92b6-fa9cd3709f15', 'name': 'Sarah', 'votes': '990,000', 'statement': 'Yellow'},
             {'id': '8cd3eb96-cb5b-406e-92ff-bf8018f0a929', 'name': 'Kelly', 'votes': '980,000', 'statement': 'I am good'},
             {'id': 'dcd8a37a-af5f-4069-8c41-f2d478f0b1da', 'name': 'Elizabeth', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'id': '4caf8d12-d929-4072-a4bc-b20a93fa7301', 'name': 'Sarah', 'votes': '990,000', 'statement': 'Yellow'},
             {'id': 'ae0de0ec-e8fd-44b2-b155-85ca6a539456', 'name': 'Kelly', 'votes': '980,000', 'statement': 'I am good'},
             {'id': '23034030-90dc-4008-979f-1720bdcb86e3', 'name': 'Elizabeth', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'id': '5fdfbd9e-abc3-4544-b213-bc3771fd3f66', 'name': 'Sarah', 'votes': '990,000', 'statement': 'Yellow'},
             {'id': '14554262-f33a-4036-815a-edfca578be30', 'name': 'Kelly', 'votes': '980,000', 'statement': 'I am good'},
             {'id': 'a04134dc-6e5d-4e89-87a1-569d12aac5fd', 'name': 'Elizabeth', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'id': 'a11fb719-a261-4914-9a05-6b49f3506d00', 'name': 'Sarah', 'votes': '990,000', 'statement': 'Yellow'},
             {'id': 'a623bce4-7bd2-4217-aad1-de8af90aa1c3', 'name': 'Kelly', 'votes': '980,000', 'statement': 'I am good'},
             {'id': '418b65ee-6e51-463e-addd-e04e4ee9c4a4', 'name': 'Elizabeth', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'id': '45cf2652-d8f9-4f8b-be36-276ddab133af', 'name': 'Sarah', 'votes': '990,000', 'statement': 'Yellow'},
             {'id': '0a918949-44b2-4b5c-ba4e-699211eef07a', 'name': 'Kelly', 'votes': '980,000', 'statement': 'I am good'},
             {'id': '3ad6bbb9-fa6a-4d5d-a1e1-a26998580f72', 'name': 'Elizabeth', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'id': 'd245b3e9-0102-4f4d-9411-890e3fde1eaf', 'name': 'Sarah', 'votes': '990,000', 'statement': 'Yellow'},
             {'id': '7a5d3194-1476-482c-b13f-fa461574d2fb', 'name': 'Kelly', 'votes': '980,000', 'statement': 'I am good'},
             {'id': 'cf63bc2f-cc4f-4cd1-9a38-a55bd2dea824', 'name': 'Elizabeth', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'id': '0a5044fc-dc32-40c6-b837-6ba52fef2b7b', 'name': 'Sarah', 'votes': '990,000', 'statement': 'Yellow'},
             {'id': '40eae6d9-8fab-4cdc-9cb1-25a170055624', 'name': 'Kelly', 'votes': '980,000', 'statement': 'I am good'},
             {'id': '1fee79a6-ac2e-4509-9c6c-901b363ba06b', 'name': 'Elizabeth', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'id': 'd4833a17-31f2-448c-84a3-f9c40eb2513b', 'name': 'Sarah', 'votes': '990,000', 'statement': 'Yellow'},
             {'id': '46f1e1be-c64c-4af4-9dca-94c122c45d28', 'name': 'Kelly', 'votes': '980,000', 'statement': 'I am good'},
             {'id': '21ff80a5-1c93-451a-8b06-3fa7d860e9e7', 'name': 'Elizabeth', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'id': '6c4b135e-d917-4c49-96d8-ec131b6b3560', 'name': 'Sarah', 'votes': '990,000', 'statement': 'Yellow'},
             {'id': '318c2a52-e522-4d77-8053-2e241d0488ef', 'name': 'Kelly', 'votes': '980,000', 'statement': 'I am good'},
             {'id': '72531b98-bd22-4c38-8124-9d8859d92db3', 'name': 'Elizabeth', 'votes': '1,000,000', 'statement': 'Blah Blah'},
             {'id': 'a18abe53-6db9-4f4a-8ccb-96eb667595e6', 'name': 'Sarah', 'votes': '990,000', 'statement': 'Yellow'},
             {'id': '65c6f30c-a2bf-4503-a161-aad96bada5fa', 'name': 'Kelly', 'votes': '980,000', 'statement': 'I am good'},
             {'id': '7e34316a-0ea1-4d7b-b359-a75a248f094a', 'name': 'Elizabeth', 'votes': '1,000,000', 'statement': 'Blah Blah'},*/
           ]
}

// Connect to mongo
var mongo = require('mongodb'); 
var url = "mongodb://mongo:27017/eos-voter";
var MongoClient = mongo.MongoClient;

exports.get_block_producers_from_db = function () {
    return MongoClient.connect(url).then(
        (db) => { return db.db("eos-voter").createCollection("block_producers") }
    ).then(
        (block_producers_collection) => { return block_producers_collection.find({}).sort({'name': 1}).toArray(); }
    )
}

exports.getAllBlockProducers = () => { return exports.getActiveBlockProducers().concat(exports.getBackupBlockProducers()); };



