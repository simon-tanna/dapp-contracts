import hre from "hardhat";
import { expect } from "chai";

import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { toWei } from "./helpers/conversions";

describe.only("Exchange", function () {
  async function deployExchangeFixture() {
    const feeAccount = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const feePercent = BigInt(10);
    // We load the fixture
    const Exchange = await hre.ethers.getContractFactory("Exchange");
    const exchangeContract = await Exchange.deploy(feeAccount, feePercent);
    const name = "Zap Token";
    const symbol = "ZAP";
    const decimals = BigInt(18);
    const totalSupply = toWei("5000000");
    const tokenAllowance = toWei("1000");
    // We load the fixture
    const MyToken = await hre.ethers.getContractFactory("Token");
    const myToken = await MyToken.deploy();

    return {
      exchangeContract,
      feeAccount,
      feePercent,
      myToken,
      name,
      symbol,
      decimals,
      totalSupply,
      tokenAllowance,
    };
  }

  // async function deployTokenFixture() {
  //   const name = "Zap Token";
  //   const symbol = "ZAP";
  //   const decimals = BigInt(18);
  //   const totalSupply = toWei("5000000");
  //   const tokenAllowance = toWei("1000");
  //   // We load the fixture
  //   const MyToken = await hre.ethers.getContractFactory("Token");
  //   const myToken = await MyToken.deploy();

  //   return { myToken, name, symbol, decimals, totalSupply, tokenAllowance };
  // }

  describe("Deployment", function () {
    it("Should track the fee account", async function () {
      const { exchangeContract, feeAccount } = await loadFixture(
        deployExchangeFixture
      );

      expect(await exchangeContract.feeAccount()).to.equal(feeAccount);
    });
    it("Should track the fee percent", async function () {
      const { exchangeContract, feePercent } = await loadFixture(
        deployExchangeFixture
      );

      expect(await exchangeContract.feePercent()).to.equal(feePercent);
    });
  });
  describe("Deposit", function () {
    it("Tracks the token depoist", async function () {
      const { exchangeContract, feeAccount, myToken, tokenAllowance } =
        await loadFixture(deployExchangeFixture);

      const exchangeAddress = exchangeContract.target;

      const [sender, receiver] = await hre.ethers.getSigners();

      await myToken.connect(sender).transfer(receiver.address, tokenAllowance);

      const tokenAddress = myToken.target;

      const tokenBalance = await myToken.balanceOf(sender.address);

      const approval = await myToken
        .connect(receiver)
        .approve(exchangeAddress, tokenAllowance);
      console.log(approval);

      const deposit = await exchangeContract
        .connect(receiver)
        .depositToken(tokenAddress, tokenAllowance);

      console.log("deposit", deposit);

      const initialDepositBalance = await myToken.balanceOf(exchangeAddress);

      expect(initialDepositBalance).to.equal(tokenAllowance);
    });
  });
});
