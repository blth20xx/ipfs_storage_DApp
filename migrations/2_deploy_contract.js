const storageindexing = artifacts.require("storageIndexing");

module.exports = function (deployer) {
  deployer.deploy(storageindexing);
};
