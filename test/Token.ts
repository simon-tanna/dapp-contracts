import hre from "hardhat";
import { expect } from "chai";

import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import exp from "constants";

describe("Token", function () {
  async function deployTokenFixture() {
    const name = "Zap Token";
    const symbol = "ZAP";
    const decimals = BigInt(18);
    const totalSupply = BigInt("5000000000000000000000000");
    // We load the fixture
    const MyToken = await hre.ethers.getContractFactory("Token");
    const myToken = await MyToken.deploy();

    return { myToken, name, symbol, decimals, totalSupply };
  }

  describe("Deployment", function () {
    it("Should set the right name", async function () {
      const { myToken, name } = await loadFixture(deployTokenFixture);

      expect(await myToken.name()).to.equal(name);
    });

    it("Should set the right symbol", async function () {
      const { myToken, symbol } = await loadFixture(deployTokenFixture);

      expect(await myToken.symbol()).to.equal(symbol);
    });

    it("Should set the right decimals", async function () {
      const { myToken, decimals } = await loadFixture(deployTokenFixture);

      expect(await myToken.decimals()).to.equal(decimals);
    });

    it("Should set the right total supply", async function () {
      const { myToken, totalSupply } = await loadFixture(deployTokenFixture);

      expect(await myToken.totalSupply()).to.equal(totalSupply);
    });
    it("Assigns the total supply of tokens to the owner", async function () {
      const { myToken, totalSupply } = await loadFixture(deployTokenFixture);

      const ownerBalance = await myToken.balanceOf(
        (
          await hre.ethers.provider.getSigner(0)
        ).address
      );
      expect(ownerBalance).to.equal(totalSupply);
    });
  });
  describe("Transfer", function () {
    it("Should transfer tokens between accounts", async function () {
      const { myToken } = await loadFixture(deployTokenFixture);

      const [sender, receiver] = await hre.ethers.getSigners();

      const senderBalance = await myToken.balanceOf(sender.address);
      console.log("Sender balance:", senderBalance.toString());
      const receiverBalance = await myToken.balanceOf(receiver.address);
      console.log("Receiver balance:", receiverBalance.toString());

      const amount = BigInt(100);

      expect(await myToken.transfer(receiver.address, amount)).to.emit(
        myToken,
        "Transfer"
      );

      const newSenderBalance = await myToken.balanceOf(sender.address);
      console.log("New sender balance:", newSenderBalance.toString());
      const newReceiverBalance = await myToken.balanceOf(receiver.address);
      console.log("New receiver balance:", newReceiverBalance.toString());

      expect(newSenderBalance).to.equal(senderBalance - amount);
      expect(newReceiverBalance).to.equal(receiverBalance + amount);
    });
  });
});
