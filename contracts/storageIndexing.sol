// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract storageIndexing {

    struct fileMetadata {
        string cid;
        address owner;
    }

    mapping(string => fileMetadata) private files;

    modifier onlyOwner (string calldata _filename) {
        require(msg.sender == files[_filename].owner, "you are not the file owner");
        _;
    }

    function store(string calldata _newname, string calldata _newcid) public {
        files[_newname] = fileMetadata(_newcid, msg.sender);
    }

    function retrieve(string calldata _filename) public view onlyOwner(_filename) returns (string memory cid) {
        return files[_filename].cid;
    }

    /* function getOwner(string calldata _filename) public view returns (address owner) {
        return files[_filename].owner;
    } */

    function clear(string calldata _filename) public onlyOwner(_filename) {
        files[_filename].cid = "";
        files[_filename].owner = 0x0000000000000000000000000000000000000000;
    }

}
