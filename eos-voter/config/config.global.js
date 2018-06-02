var config = module.exports = {};
 
config.refresh_secs = 5;

// Warning landing page content should include HTML tag it will be injected into a div tag
config.landing_page_content = '<p class=\'centre\'>EOS Voter is a provided as a free service to the community by EOSphere. You can use it to monitor the votes of block producers and to vote</p>';

// Warning voting page content should include HTML tag it will be injected into a div tag
config.voting_page_content = '<p class=\'centre\'>You may vote for up to 30 block producer candidates. Or you can proxy your vote to another EOS user.</p>'

config.min_activated_stake = 1500000000000; // 150'000'000'0000

// Votes are weighted by how far in the future they are cast. They double in value for every year later.
// In Dawn 4.1 the epoch was changed to 2000.

// Post Dawn 4.1 weighting factor
//config.timefactor = Math.pow(2, ((new Date).getTime() - 946684800000.0) / 1000.0 / 86400.0 / 7.0 / 52.0);
// Dawn 4 and earlier weighting factor
//config.timefactor = Math.pow(2, ((new Date).getTime()) / 1000.0 / 86400.0 / 7.0 / 52.0);

//Magic number calculated by reverse engineering Jungle not sure why this disagrees with the above possible issue with upgrade from dawn4.0 -> dawn4.1 where this changed
config.timefactor = 7218513226.892367735;

config.bp_info_refresh_secs = 20;
