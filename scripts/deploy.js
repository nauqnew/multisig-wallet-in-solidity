
const { ethers } = require("hardhat")

async function main() {

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
  console.log("TestContract deployed to:", testContract.address)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
