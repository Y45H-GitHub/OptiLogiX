// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DataStore {
    string private storedData;

    event DataStored(string data);

    function storeData(string memory _data) public {
        storedData = _data;
        emit DataStored(_data);
    }

    function retrieveData() public view returns (string memory) {
        return storedData;
    }
}