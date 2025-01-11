import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FEE_ACCOUNT = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const FEE_PERCENT = BigInt(10);

export default buildModule("Exchange", (m) => {
  const feeAccount = m.getParameter("feeAccount", FEE_ACCOUNT);
  const feePercent = m.getParameter("feePercent", FEE_PERCENT);

  const exchange = m.contract("Exchange", [feeAccount, feePercent]);

  return { exchange };
});
