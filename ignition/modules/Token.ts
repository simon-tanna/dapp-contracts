import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MyToken", (m) => {
  const myToken = m.contract("Token");

  return { myToken };
});
