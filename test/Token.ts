import hre from "hardhat";
import { expect } from "chai";

import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ZeroAddress } from "ethers";
import { toWei, toEther } from "./helpers/conversions";

describe("Token", function () {
  async function deployTokenFixture() {
    const name = "Zap Token";
    const symbol = "ZAP";
    const decimals = BigInt(18);
    const totalSupply = toWei("5000000");
    const tokenAllowance = toWei("1000");
    // We load the fixture
    const MyToken = await hre.ethers.getContractFactory("Token");
    const myToken = await MyToken.deploy();

    return { myToken, name, symbol, decimals, totalSupply, tokenAllowance };
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

    it("Should transfer tokens between accounts using the transferFrom function", async function () {
      const { myToken, tokenAllowance } = await loadFixture(deployTokenFixture);

      const [sender, receiver, exchange] = await hre.ethers.getSigners();

      const initialSenderBalance = await myToken.balanceOf(sender.address);

      // Approve the exchange to spend the sender's tokens
      await myToken.connect(sender).approve(exchange.address, tokenAllowance);

      const transferFrom = await myToken
        .connect(exchange)
        .transferFrom(sender.address, receiver.address, tokenAllowance);

      const senderBalance = await myToken.balanceOf(sender.address);
      const receiverBalance = await myToken.balanceOf(receiver.address);

      expect(receiverBalance).to.equal(tokenAllowance);
      expect(senderBalance).to.equal(initialSenderBalance - tokenAllowance);
    });

    it("Should decrease the allowance after a transferFrom", async function () {
      const { myToken, tokenAllowance } = await loadFixture(deployTokenFixture);

      const [sender, receiver, exchange] = await hre.ethers.getSigners();

      // Approve the exchange to spend the sender's tokens
      await myToken.connect(sender).approve(exchange.address, tokenAllowance);

      await myToken
        .connect(exchange)
        .transferFrom(sender.address, receiver.address, tokenAllowance);

      const newAllowance = await myToken.allowance(
        sender.address,
        exchange.address
      );

      expect(newAllowance).to.equal(0);
    });

    it("Should revert if the exchange tries to transfer more than the allowance", async function () {
      const { myToken, tokenAllowance } = await loadFixture(deployTokenFixture);

      const [sender, receiver, exchange] = await hre.ethers.getSigners();

      // Approve the exchange to spend the sender's tokens
      await myToken.connect(sender).approve(exchange.address, tokenAllowance);

      await expect(
        myToken
          .connect(exchange)
          .transferFrom(
            sender.address,
            receiver.address,
            tokenAllowance + BigInt(1)
          )
      ).to.be.revertedWith(
        "VM Exception while processing transaction: revert ERC20: transfer amount exceeds allowance"
      );
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
  describe("Approve", function () {
    describe("Success", function () {
      it("Allocates an allowance for delegated token spending on an exchange", async function () {
        const { myToken, tokenAllowance } = await loadFixture(
          deployTokenFixture
        );
        const [sender, receiver] = await hre.ethers.getSigners();

        const approval = await myToken.approve(
          receiver.address,
          tokenAllowance,
          {
            from: sender.address,
          }
        );

        expect(approval).to.be.ok;

        const allowance = await myToken.allowance(
          sender.address,
          receiver.address
        );

        expect(allowance).to.equal(tokenAllowance);
      });
      it("Should emit an Approval event", async function () {
        const { myToken, tokenAllowance } = await loadFixture(
          deployTokenFixture
        );
        const [sender, receiver] = await hre.ethers.getSigners();

        await expect(myToken.approve(receiver.address, tokenAllowance))
          .to.emit(myToken, "Approval")
          .withArgs(sender.address, receiver.address, tokenAllowance);
      });
    });
  });
  describe("Failure", function () {
    it("Rejects approvals from zero address", async function () {
      const { myToken, tokenAllowance } = await loadFixture(deployTokenFixture);

      await expect(
        myToken.approve(ZeroAddress, tokenAllowance)
      ).to.be.revertedWith("ERC20: approve to the zero address");
    });
  });

  describe("Additional Tests", function () {
    it("Should revert transferFrom to the zero address", async function () {
      const { myToken, tokenAllowance } = await loadFixture(deployTokenFixture);
      const [sender, _, exchange] = await hre.ethers.getSigners();

      // Approve the exchange
      await myToken.connect(sender).approve(exchange.address, tokenAllowance);

      await expect(
        myToken
          .connect(exchange)
          .transferFrom(sender.address, ZeroAddress, tokenAllowance)
      ).to.be.revertedWith("ERC20: transfer to the zero address");
    });

    it("Should revert transferFrom with insufficient balance", async function () {
      const { myToken, tokenAllowance } = await loadFixture(deployTokenFixture);
      const [sender, receiver, exchange] = await hre.ethers.getSigners();

      const insufficientAmount =
        (await myToken.balanceOf(sender.address)) + BigInt(1);

      // Approve the exchange
      await myToken
        .connect(sender)
        .approve(exchange.address, insufficientAmount);

      await expect(
        myToken
          .connect(exchange)
          .transferFrom(sender.address, receiver.address, insufficientAmount)
      ).to.be.revertedWith(
        "VM Exception while processing transaction: revert ERC20: transfer amount exceeds balance"
      );
    });

    it("Should allow reapproval of reduced allowance", async function () {
      const { myToken, tokenAllowance } = await loadFixture(deployTokenFixture);
      const [sender, exchange] = await hre.ethers.getSigners();

      // Approve the exchange
      await myToken.connect(sender).approve(exchange.address, tokenAllowance);

      // Reduce allowance
      const reducedAllowance = tokenAllowance / BigInt(2);
      await myToken.connect(sender).approve(exchange.address, reducedAllowance);

      const allowance = await myToken.allowance(
        sender.address,
        exchange.address
      );
      expect(allowance).to.equal(reducedAllowance);
    });

    it("Should allow approval with zero allowance", async function () {
      const { myToken } = await loadFixture(deployTokenFixture);
      const [sender, receiver] = await hre.ethers.getSigners();

      const zeroAllowance = BigInt(0);

      await myToken.connect(sender).approve(receiver.address, zeroAllowance);

      const allowance = await myToken.allowance(
        sender.address,
        receiver.address
      );
      expect(allowance).to.equal(zeroAllowance);
    });

    it("Should emit Approval event on multiple approvals", async function () {
      const { myToken, tokenAllowance } = await loadFixture(deployTokenFixture);
      const [sender, receiver] = await hre.ethers.getSigners();

      await expect(
        myToken.connect(sender).approve(receiver.address, tokenAllowance)
      )
        .to.emit(myToken, "Approval")
        .withArgs(sender.address, receiver.address, tokenAllowance);

      const reducedAllowance = tokenAllowance / BigInt(2);
      await expect(
        myToken.connect(sender).approve(receiver.address, reducedAllowance)
      )
        .to.emit(myToken, "Approval")
        .withArgs(sender.address, receiver.address, reducedAllowance);
    });
  });
});
