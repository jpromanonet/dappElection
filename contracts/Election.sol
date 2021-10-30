pragma solidity 0.4.2;

contract Election {

    // Read/write candidate
    string public candidate;

    // Constructor
    function Election () public {
        candidate = "Candidate 1";
    }

    
}