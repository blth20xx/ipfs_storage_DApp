const storageIndexing = artifacts.require("storageIndexing");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("storageIndexing", function (/* accounts */) {
  it("retrieved values should be equal as stored", async function () {
    const instance = await storageIndexing.deployed();
    await instance.store(
      "lipsum.txt",
      "bafybeifjjcmidfqpoa7pczclc4qr3t2d6zra72rpkztpnn6faval2n6ebu"
    );
    const value = await instance.retrieveAll();

    assert.equal(
      value[0].cid,
      "bafybeifjjcmidfqpoa7pczclc4qr3t2d6zra72rpkztpnn6faval2n6ebu"
    );

    assert.equal(value[0].name, "lipsum.txt");
  });
});
