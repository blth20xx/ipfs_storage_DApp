// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract storageIndexing {

    struct fileMetadata {
        string cid;
        string name;
    }

    mapping(address => fileMetadata[]) private files;
    
    
    function store(string calldata _newname, string calldata _newcid) public {
        files[msg.sender].push(fileMetadata(_newcid,_newname));
    }


    function retrieveAll() public view returns (fileMetadata[] memory){
        return files[msg.sender];
    }

}
