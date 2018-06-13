var config = module.exports = {};
 
config.refresh_secs = 5;

// Warning landing page content should include HTML tag it will be injected into a div tag
config.landing_page_content = '<p class=\'centre\'>EOS Voter is a provided as a free service to the community by EOSphere. You can use it to monitor the votes of block producers and to vote</p>';

// Warning voting page content should include HTML tag it will be injected into a div tag
config.voting_page_content = '<p class=\'centre\'>You may vote for up to 30 block producer candidates. Or you can proxy your vote to another EOS user.</p>'

// Message to give this users when this chain activates
// Warning voting page content should include HTML tag it will be injected into a div tag
config.has_activated_message = '<p class=\'centre-activated\'>This particular EOS block chain has now reached the 15% activation threshold</p>'

// Content of the what's this (fake bp) page 
// Warning voting page content should include HTML tag it will be injected into a div tag
config.whats_this_bp_name_mismatch = `
<p>Caution - the registered name of this producer does not match the name listed publicly on the corresponding website.</p>

<p>This block producer may be impersonating another to get community votes. This is knows as spoofing.</p>

<p>This may mean that you could be voting for the wrong entity if you cast a vote for this producer.</p>

<p>It could also be because the producer has not properly configured their website to show the correct name.</p>

<p>Ask the entity to update their producer name to match the name in the bp.json on their website or contact EOSphere for help.</p>
`

config.whats_this_bp_json_missing = `
<p>The bp.json file is either missing or badly formed</p>

<p>Information about this block producer cannot be accurately determined</p>
`

config.whats_this_constitutional_compliance = `
<p>This column represents constitutional compliance</p>
<p>The Eos consitution requires each block producer to have two nodes and each node to keep p2p and api end points open</p>
<p>A green tick here means that eos-voter has tested that the p2p address is valid and the api addresses are working</p>
`

config.min_activated_stake = 1500000000000; // 150'000'000'0000

// Votes are weighted by how far in the future they are cast. They double in value for every year later.
// In Dawn 4.1 the epoch was changed to 2000.

// Post Dawn 4.1 weighting factor
//config.timefactor = Math.pow(2, ((new Date).getTime() - 946684800000.0) / 1000.0 / 86400.0 / 7.0 / 52.0);
// Dawn 4 and earlier weighting factor
//config.timefactor = Math.pow(2, ((new Date).getTime()) / 1000.0 / 86400.0 / 7.0 / 52.0);

//Magic number calculated by reverse engineering Jungle not sure why this disagrees with the above possible issue with upgrade from dawn4.0 -> dawn4.1 where this changed
config.timefactor = 7218513226.892367735;

config.bp_info_refresh_secs = 60;
