import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("IjazahSBT", (m) => {
  const defaultAdmin = m.getAccount(0);
  const minter = m.getAccount(1);

  const ijazahSBT = m.contract("IjazahSBT", [defaultAdmin, minter]);

  return { ijazahSBT };
});

// npx hardhat ignition deploy ignition/modules/IjazahSBT.ts --network polygonAmoy