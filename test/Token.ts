import hre from "hardhat";
import { expect } from "chai";

import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ZeroAddress } from "ethers";

const toWei = (value: string) => {
  return hre.ethers.parseEther(value.toString());
};

const toEther = (value: bigint) => {
  return hre.ethers.formatEther(value);
};

describe("Token", function () {
  async function deployTokenFixture() {
    const name = "Zap Token";
    const symbol = "ZAP";
    const decimals = BigInt(18);
    const totalSupply = toWei("5000000");
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

      const amount = toWei("100");

      await myToken.transfer(receiver.address, amount);

      const newSenderBalance = await myToken.balanceOf(sender.address);
      console.log("New sender balance:", toEther(newSenderBalance));
      const newReceiverBalance = await myToken.balanceOf(receiver.address);
      console.log("New receiver balance:", toEther(newReceiverBalance));

      expect(newSenderBalance).to.equal(senderBalance - amount);
      expect(newReceiverBalance).to.equal(receiverBalance + amount);
      expect(toEther(newReceiverBalance)).to.equal(toEther(amount));
    });

    it("Should emit a Transfer event", async function () {
      const { myToken } = await loadFixture(deployTokenFixture);

      const [sender, receiver] = await hre.ethers.getSigners();

      const amount = toWei("100");

      await expect(myToken.transfer(receiver.address, amount))
        .to.emit(myToken, "Transfer")
        .withArgs(sender.address, receiver.address, amount);
    });

    it("Rejects transfers above the sender balance", async function () {
      const { myToken } = await loadFixture(deployTokenFixture);

      const [sender, receiver] = await hre.ethers.getSigners();

      const senderBalance = await myToken.balanceOf(sender.address);

      const amount = senderBalance + toWei("1");

      await expect(
        myToken.transfer(receiver.address, amount)
      ).to.be.revertedWith(
        "VM Exception while processing transaction: revert ERC20: transfer amount exceeds balance"
      );
    });

    it("Rejects transfers from zero address", async function () {
      const { myToken } = await loadFixture(deployTokenFixture);

      const amount = toWei("1");

      await expect(myToken.transfer(ZeroAddress, amount)).to.be.revertedWith(
        "ERC20: transfer to the zero address"
      );
    });
  });
});
