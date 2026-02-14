import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("IjazahSBT", (m) => {
  const deployer = m.getAccount(0);

  // Same wallet is both admin and minter (single private key deployment)
  const ijazahSBT = m.contract("IjazahSBT", [deployer, deployer]);

  return { ijazahSBT };
});

// npx hardhat ignition deploy ignition/modules/IjazahSBT.ts --network polygonAmoy