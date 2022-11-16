// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract storageIndexing {

    mapping(string => string) private files;

    function store(string calldata _newcid, string calldata _newname) public {
        files[_newname] = _newcid;
    }

    function retrieve(string calldata _filename) public view returns (string memory _cid) {
        return files[_filename];
    }

    function clear(string calldata _filename) public {
        files[_filename] = "";
    }

}
