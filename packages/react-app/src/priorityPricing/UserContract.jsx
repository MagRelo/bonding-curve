import { Button, Input, Table, Typography } from "antd";
import "antd/dist/antd.css";
import React, { useState } from "react";
import { Address } from "../components";
import WithdrawTable from "./withdrawTable";
import HoldersTable from "./holdersTable";
import SpendsTable from "./spendsTable";
import { useContractReader, useNonce } from "../hooks/index";

const { ethers } = require("ethers");

function UserContract({
  purpose,
  setPurposeEvents,
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
  subgraphUri,
}) {
  // profile
  const reserveBalance = useContractReader(readContracts, "PriorityPricing", "reserveBalance");
  const continuousSupply = useContractReader(readContracts, "PriorityPricing", "continuousSupply");
  const owner = useContractReader(readContracts, "PriorityPricing", "owner");
  const ownerBalance = useContractReader(readContracts, "PriorityPricing", "balanceOf", [owner]);

  const profile = {
    padding: "10px",
    border: "1px solid #ccc",
  };

  return (
    <div style={{ textAlign: "left", margin: "20px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
        <div>
          <div style={profile}>
            <h1>Matt Lovan &nbsp;</h1>
            <div>
              <p>
                Owner: <Address value={owner} ensProvider={mainnetProvider} fontSize={14} />
              </p>
              <p>Owner Credits: {ownerBalance && ethers.utils.formatEther(ownerBalance)}</p>
              <p>
                Lorem ipsum dolor sit, amet consectetur adipisicing elit. At mollitia hic doloremque quam consequatur
                culpa sit et sed nemo minus dolore, optio odit laudantium voluptates, numquam voluptatum ullam
                temporibus consectetur.
              </p>
            </div>

            <p>Total Deposits: {reserveBalance && ethers.utils.formatEther(reserveBalance)} ETH </p>
            <p>Outstanding Credits: {continuousSupply && ethers.utils.formatEther(continuousSupply)}</p>
          </div>

          <div style={{ marginBottom: "1rem" }}></div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <SpendsTable
              subgraphUri={subgraphUri}
              price={price}
              tx={tx}
              writeContracts={writeContracts}
              readContracts={readContracts}
              address={address}
              owner={owner}
            />
            <WithdrawTable
              subgraphUri={subgraphUri}
              price={price}
              tx={tx}
              writeContracts={writeContracts}
              readContracts={readContracts}
              address={address}
            />
          </div>
        </div>

        <HoldersTable
          subgraphUri={subgraphUri}
          price={price}
          tx={tx}
          writeContracts={writeContracts}
          readContracts={readContracts}
          address={address}
        />
      </div>

      {/* 
      <hr />
      <div style={{ margin: 32, height: 400, border: "1px solid #888888", textAlign: "left" }}>
        <GraphiQL fetcher={graphQLFetcher} docExplorerOpen query={EXAMPLE_GRAPHQL} />
      </div> */}
    </div>
  );
}

export default UserContract;
