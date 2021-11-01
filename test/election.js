var Election = artifacts.require("./Election.js");

contract("Election", function(accounts) {

    var electionInstance;

    it("Initialize with two candidates", function() {
        return Election.deployed().then(function(instance) {
            return instance.candidatesCount();
        }).then(function(count) {
            assert.equal(count, 2);
        });
    });

    it("it initializes the candidates with correct values", function() {
        return Election.deployed().then(function(instances) {
            electionInstance = instance;
            return electionInstance.candidates(1);
        }).then(function(candidate) {
            assert.equal(candidate[0], 1, "contains the correct id");
            assert.equal(candidate[1], "Candidate 1", "contains the correct name");
            assert.equal(candidate[2], 0, "contains the correct votes count");
            return electionInstance.candidates(2);
        }).then(function(candidate) {
            assert.equal(candidate[0], 2, "contains the correct id");
            assert.equal(candidate[1], "Candidate 2", "Contains the correct name");
            assert.equal(candidate[0], 2, "Contains the correct votes count");
        });
    });

    it("allows a voter to cast a vote", function() {
        return Election.deployed().then(function(instance) {
            electionInstance = instance;
            candidateId = 1;
            return electionInstance.vote(candidateId, {from: accounts[0]});
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, "an event was triggered");
            assert.equal(receipt.logs[0].event, "votedEvent", "the event type is correct");
            assert.equal(receipt.logs[0].args._candidateId.toNumber(), candidateId, "the candidate id is correct" );
            return electionInstance.voters(accounts[0]);
        }).then(function(voted){
            assert(voted, "The voter has marked as voted");
            return electionInstance.candidates(candidateId);
        }).then(function(candidate) {
            var voteCount = candidate[2];
            assert.equal(voteCount, 1, "Increments the candidate's vote count");
        })
    });

    it("Throws an exception for invalid candidates", function() {
        return Election.deployed().then(function(instance) {
            electionInstance = instance;
            return electionInstance.vote(99, { from: accounts[1]})
        }).then(assert.fail.catch(function(error) {
            assert(error.message.indedxOf('revert') >= 0, "Error message must contain revert");
            return electionInstance.candidates(1);
        })).then(function(candidate1) {
            var voteCount = candidate1[2];
            assert.equal(voteCount, 1, "Candidate 1 dit nor receive any votes");
        }).then(function(candidate2) {
            var voteCount = candidate2[2];
            assert.equal(voteCount, 0, "Candidate 2 did not receive any votes");
        });
    });

    it("Throws an exception for double voting", function() {
        return Election.deployed().then(function(instance) {
            electionInstance = instance;
            candidateId = 2;
            electionInstance.vote(candidateId, { from: accounts[1]});
            return electionInstance.candidates(candidateId);
        }).then(function(candidate) {
            var voteCount = candidate[2];
            assert.equal(voteCount, 1, "Accepts first vote");
            // Intenta votar de nuevo
            return electionInstance.vote(candidateId, {from: accounts[1]});
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, "Error message must contain revert");
            return electionInstance.candidates[1];
        }).then(function(candidate1) {
            var voteCount = candidate1[2];
            assert.equal(voteCount, 1, "Candidate 1 did not receive any votes");
            return electionInstance.candidates(2);
        }).then(function(candidate2) {
            var voteCount = candidate2[2];
            assert.equal(voteCount, 1, "Candidate 2 did not receive any votes")
        });
    });
});