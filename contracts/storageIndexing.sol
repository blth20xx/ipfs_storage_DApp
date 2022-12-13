// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract storageIndexing {

    struct fileMetadata {
        string cid;
        string name;
    }

    mapping(address => fileMetadata[]) public files;

    /* modifier onlyOwner (string calldata _filename) {
        require(msg.sender == files[_filename].owner, "you are not the file owner");
        _;
    } */

    function store(string calldata _newname, string calldata _newcid) public {
        files[msg.sender].push(fileMetadata(_newcid,_newname));
    }

    function retrieve(string calldata _filename) public view returns (string memory cid){

        for(uint8 i=0; i < files[msg.sender].length; i++){
            if(keccak256(abi.encodePacked(files[msg.sender][i].name)) == keccak256(abi.encodePacked(_filename))){
                return files[msg.sender][i].cid;
            }
        }
        return "";
    }

    function clear(string calldata _filename) public {
        for(uint8 i=0; i < files[msg.sender].length; i++){
            if(keccak256(abi.encodePacked(files[msg.sender][i].name)) == keccak256(abi.encodePacked(_filename))){
                files[msg.sender][i].cid = "";
            }
        }
    }

    function retrieveAll() public view returns (fileMetadata[] memory){
        return files[msg.sender];
    }

}
