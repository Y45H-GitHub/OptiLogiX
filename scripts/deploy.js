const { ethers } = require("hardhat");

async function main() {
  const DataStore = await ethers.getContractFactory("DataStore");
  const dataStore = await DataStore.deploy();

  await dataStore.waitForDeployment();
  console.log("DataStore deployed to:", dataStore.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });