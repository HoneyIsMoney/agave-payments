/* eslint no-use-before-define: "warn" */
import { ethers } from "hardhat";
import { encodeCallScript } from "@aragon/test-helpers/evmScript";
import { encodeActCall } from "@aragon/toolkit";
const { agvePayments } = require("./agvePayments.json");
const { hnyPayments } = require("./hnyPayments.json");
const { BigNumber } = ethers;

// https://rinkeby.client.aragon.org/#/agaveredemptions/permissions/
const agent = "0xcdbb935eeb8aa160b03f232fd58069e013206246";
const voting = "0x8ae92fcb956918a7b3167359d4bc0f4960493761";
const agve = "0x1b175454f9ccc6ff8e5da63cb93a60262a71de44";
const hny = "";

const main = async () => {
  const signers = await ethers.getSigners();
  const votingContract = await ethers.getContractAt("Voting", voting, signers[0]);
  console.log("\nusing: ", signers[0].address);
  console.log("creating AGVE payments...");
  await payments(agve, agvePayments, votingContract);
};

const payments = async (token, payments, votingContract) => {
  const calldatum = await Promise.all(
    payments.map(async (user) => await encodeTransfer(token, user.receiverAddress, user.amount))
  );

  const script = encodeCallScript(
    calldatum.map((data) => {
      return {
        to: agent,
        calldata: data,
      };
    })
  );

  await votingContract.newVote(script, "payments");
};

const encodeTransfer = async (token, to, amount) => {
  const call = await encodeActCall("transfer(address,address,uint256)", [token, to, ethers.utils.parseEther(amount)]);
  return call;
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
