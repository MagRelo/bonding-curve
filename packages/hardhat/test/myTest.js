const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("Priority Pricing", function () {
  let PriorityPricing;

  describe("Deploy PriorityPricing Contract", function () {
    const deployValue = "1";
    const deployTokenCount = "10000.0";
    it("deploy contract", async function () {
      const myContract = await ethers.getContractFactory("PriorityPricing");
      PriorityPricing = await myContract.deploy({
        value: ethers.utils.parseEther(deployValue),
      });
    });

    it("reserveBalance = 1 ETH", async function () {
      const reserveBalance = await PriorityPricing.reserveBalance();
      expect(reserveBalance).to.equal(ethers.utils.parseEther(deployValue));
    });
    it("initialSupply = 10,000 tokens", async function () {
      const initialSupply = await PriorityPricing.continuousSupply();
      expect(deployTokenCount).to.equal(
        ethers.utils.formatEther(initialSupply)
      );
    });

    it("owner balance = 10,000 tokens", async function () {
      const [owner] = await ethers.getSigners();
      const address = await owner.getAddress();
      const ownerBalance = await PriorityPricing.connect(owner).balanceOf(
        address
      );
      expect(deployTokenCount).to.equal(ethers.utils.formatEther(ownerBalance));
    });

    describe("Mint Tokens", function () {
      it("calc next purchase return", async function () {
        const value = ethers.utils.parseEther("1");
        // token return mint 1 ETH worth of tokens
        const tokens = await PriorityPricing.getContinuousMintReward(value);
        console.log("tokens", ethers.utils.formatEther(tokens));
      });

      it("calc spend refund", async function () {
        // refund amount for 100 tokens
        const value = ethers.utils.parseEther("100");
        const tokens = await PriorityPricing.getContinuousBurnRefund(value);
        console.log("ETH", ethers.utils.formatEther(tokens));
      });

      it("mints for addr1", async function () {
        const signers = await ethers.getSigners();
        // mint 1 ETH worth of tokens
        await PriorityPricing.connect(signers[1]).mint({
          value: ethers.utils.parseEther("1"),
        });

        // const address = await signers[1].getAddress();
        // const tokenBalance = await PriorityPricing.balanceOf(address);
        // console.log("addr1 balance", ethers.utils.formatEther(tokenBalance));
      });

      it("mints for addr2", async function () {
        const signers = await ethers.getSigners();
        // mint 1 ETH worth of tokens
        await PriorityPricing.connect(signers[2]).mint({
          value: ethers.utils.parseEther("1"),
        });

        // const address2 = await signers[2].getAddress();
        // const tokenBalance2 = await PriorityPricing.balanceOf(address2);
        // console.log("addr2 balance", ethers.utils.formatEther(tokenBalance2));
      });

      it("calc next purchase return", async function () {
        const value = ethers.utils.parseEther("1");
        // token return mint 1 ETH worth of tokens
        const tokens = await PriorityPricing.getContinuousMintReward(value);
        console.log("tokens", ethers.utils.formatEther(tokens));
      });

      it("calc spend refund", async function () {
        // refund amount for 100 tokens
        const value = ethers.utils.parseEther("100");
        const tokens = await PriorityPricing.getContinuousBurnRefund(value);
        console.log("ETH", ethers.utils.formatEther(tokens));
      });

      // it("print stats", async function () {
      //   const tokenSupply = await PriorityPricing.continuousSupply();
      //   console.log("tokenSupply", ethers.utils.formatEther(tokenSupply));
      //   const reserveBalance = await PriorityPricing.reserveBalance();
      //   console.log("reserveBalance", ethers.utils.formatEther(reserveBalance));
      // });
    });

    describe("Burn Tokens", function () {
      it("Addr2 Burn", async function () {
        const signers = await ethers.getSigners();
        // mint 1 ETH worth of tokens
        await PriorityPricing.connect(signers[2]).burn(
          ethers.utils.parseEther("1000")
        );

        const address2 = await signers[2].getAddress();
        const tokenBalance2 = await PriorityPricing.balanceOf(address2);
        const lockedBalance = await PriorityPricing.userLockedBalance(address2);

        console.log("Token Balance", ethers.utils.formatEther(tokenBalance2));
        console.log("Eth Balance", ethers.utils.formatEther(lockedBalance));
      });

      it("Addr1 Burn", async function () {
        const signers = await ethers.getSigners();
        // mint 1 ETH worth of tokens
        await PriorityPricing.connect(signers[1]).burn(
          ethers.utils.parseEther("1000")
        );

        const address2 = await signers[1].getAddress();
        const tokenBalance2 = await PriorityPricing.balanceOf(address2);
        const lockedBalance = await PriorityPricing.userLockedBalance(address2);

        console.log("Token Balance", ethers.utils.formatEther(tokenBalance2));
        console.log("Eth Balance", ethers.utils.formatEther(lockedBalance));
      });
    });

    describe("Spend Tokens", function () {
      it("transfer to owner [0]", async function () {
        const signers = await ethers.getSigners();

        // get addr0 token balance
        const address0 = await signers[0].getAddress();
        const tokenBalance0Before = await PriorityPricing.balanceOf(address0);

        // get addr2 token balance
        const address2 = await signers[2].getAddress();
        const tokenBalance2 = await PriorityPricing.balanceOf(address2);

        // mint 1 ETH worth of tokens
        await PriorityPricing.connect(signers[2]).transfer(
          address0,
          tokenBalance2
        );

        const tokenBalance0After = await PriorityPricing.balanceOf(address0);

        console.log(
          "[0] before",
          ethers.utils.formatEther(tokenBalance0Before)
        );
        console.log("[0] after", ethers.utils.formatEther(tokenBalance0After));
      });
    });
  });
});
