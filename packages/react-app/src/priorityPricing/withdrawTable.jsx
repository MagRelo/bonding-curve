import { gql, useQuery } from "@apollo/client";
import { Button, Input, Table, Typography } from "antd";
import "antd/dist/antd.css";
import GraphiQL from "graphiql";
import "graphiql/graphiql.min.css";
import fetch from "isomorphic-fetch";
import React, { useState } from "react";
import { Address } from "../components";
import { useContractReader, useNonce } from "../hooks/index";

import { parseEther, formatEther } from "@ethersproject/units";
import { EtherInput, AddressInput } from "../components/index";

const { ethers } = require("ethers");

function Subgraph({ subgraphUri, price, tx, writeContracts, mainnetProvider, readContracts, address }) {
  function graphQLFetcher(graphQLParams) {
    return fetch(subgraphUri, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(graphQLParams),
    }).then(response => response.json());
  }

  const EXAMPLE_GRAPHQL = `
  {
   withdraws(orderBy: id, orderDirection:desc) {
     id
     sender
     amount
     refund
     burnType
   }
  }
  `;
  const EXAMPLE_GQL = gql(EXAMPLE_GRAPHQL);
  const { loading, data } = useQuery(EXAMPLE_GQL, { pollInterval: 2500 });
  const userColumns = [
    {
      title: "Public Address",
      dataIndex: "sender",
      key: "sender",
      render: record => <Address value={record} ensProvider={mainnetProvider} fontSize={14} />,
    },
    {
      title: "Credits",
      key: "amount",
      dataIndex: "amount",
      render: value => {
        return ethers.utils.formatEther(value);
      },
    },
    {
      title: "Refund (ETH)",
      key: "refund",
      dataIndex: "refund",
      render: value => {
        return ethers.utils.formatEther(value);
      },
    },
    {
      title: "Type",
      key: "burnType",
      dataIndex: "burnType",
    },
  ];

  // form
  const [amount, setAmount] = useState(0);
  const yourBalance = useContractReader(readContracts, "PriorityPricing", "balanceOf", [address]);

  return (
    <div>
      <div
        style={{
          padding: "1rem",
          background: "#fafafa",
          border: "1px solid #888",
          borderRadius: "1rem",
          marginBottom: "1rem",
        }}
      >
        <h2>Claim Refund</h2>
        <p>Sell credits back to contract</p>
        <div>Your Credit Balance: {yourBalance ? formatEther(yourBalance) : 0}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem" }}>
          <EtherInput
            price={price}
            value={amount}
            placeholder={"Credits"}
            onChange={value => {
              setAmount(value);
            }}
          />
          <Button
            onClick={() => {
              /* look how you call setPurpose on your contract: */
              tx(writeContracts.PriorityPricing.burn(parseEther(amount)));
            }}
          >
            Burn
          </Button>
        </div>
      </div>
      {data ? (
        <>
          <Table dataSource={data.withdraws} columns={userColumns} rowKey="id" />
        </>
      ) : (
        <Typography>{loading ? "Loading..." : deployWarning}</Typography>
      )}
      {/* 
      <hr />

      <div style={{ margin: 32, height: 400, border: "1px solid #888888", textAlign: "left" }}>
        <GraphiQL fetcher={graphQLFetcher} docExplorerOpen query={EXAMPLE_GRAPHQL} />
      </div> */}
    </div>
  );
}

export default Subgraph;

const deployWarning = <div style={{ marginTop: 8, padding: 8 }}>Warning: 🤔 Have you deployed your subgraph yet?</div>;
