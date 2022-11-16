// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract storageIndexing {

  /* struct fileReference {
        string cid;
        string filename;
    } */

    mapping(string => string) private files;

    //fileReference[] files;
    //string[] files;

    function store(string calldata _newcid, string calldata _newname) public {
        files[_newname] = _newcid;
    }

    /* function store(string calldata newcid) public {
        files.push(newcid);
    }  */

    function retrieve(string calldata _filename) public view returns (string memory _cid) {
        return files[_filename];
    }

    /* function retrieve(uint16 index) public view returns (string memory cid) {
        return files[index];
    } */

}
