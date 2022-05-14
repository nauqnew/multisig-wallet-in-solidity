const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MultiSigWallet", function () {
  it("Should be executed when confirmed by 2 of the owners", async function () {
    const accounts = await ethers.getSigners()

    // get first 3 address to compose a multi-sig wallet
    const owners = accounts.slice(0, 3).map(account => account.address)

    // deploy multisig wallet
    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet")
    const multiSigWallet = await MultiSigWallet.deploy(owners, 2) // multiSig 2-of-3
    await multiSigWallet.deployed()
    console.log("multiSigWallet deployed to:", multiSigWallet.address)

    // deploy test contract
    const TestContract = await ethers.getContractFactory("TestContract")
    const testContract = await TestContract.deploy()
    await testContract.deployed()


    // read i from testContract before invoke
    expect(await testContract.i()).to.equal(0);

    const txData = await testContract.getData()

    // now submit a transaction from account[0]
    // const tx = await accounts[0].sendTransaction({
    //   to: testContract.address,
    //   value: 0,
    //   data: txData
    // })
    console.log('now submit a transaction from account 0 ...')
    const singer0 = await multiSigWallet.connect(accounts[0]);
    const tx = await singer0.submitTransaction(testContract.address, 0, txData)
    await tx.wait()

    // approve tx from account[0]
    // const txs = await singer0.transactions()
    let txId = 0
    console.log('now confirm a transaction from account 0 ...')

    const txConfirm = await singer0.confirmTransaction(txId)
    await txConfirm.wait()

    // approve tx from account[1]
    const singer1 = await multiSigWallet.connect(accounts[1])
    const txConfirm1 = await singer1.confirmTransaction(txId)
    await txConfirm1.wait()

    // execute tx from account[2]
    console.log('now execute the transaction from account 2 ...')
    const singer2 = await multiSigWallet.connect(accounts[2])
    const txExecute = await singer2.executeTransaction(txId)
    await txExecute.wait()

    // read i from testContract
    expect(await testContract.i()).to.equal(123);
  });
});
