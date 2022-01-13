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

function HoldersTable({ subgraphUri, price, tx, writeContracts, mainnetProvider, readContracts, address }) {
  function graphQLFetcher(graphQLParams) {
    return fetch(subgraphUri, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(graphQLParams),
    }).then(response => response.json());
  }

  const EXAMPLE_GRAPHQL = `
  {
   users(orderBy: bondingCurveTokenBalance, orderDirection:desc) {
     id
     reserveBalance
     bondingCurveTokenBalance
   }
  }
  `;
  const EXAMPLE_GQL = gql(EXAMPLE_GRAPHQL);
  const { loading, data } = useQuery(EXAMPLE_GQL, { pollInterval: 2500 });
  const userColumns = [
    {
      title: "Public Address",
      dataIndex: "id",
      key: "id",
      render: record => <Address value={record} ensProvider={mainnetProvider} fontSize={14} />,
    },
    {
      title: "Credits",
      key: "bondingCurveTokenBalance",
      dataIndex: "bondingCurveTokenBalance",
      render: value => {
        return ethers.utils.formatEther(value);
      },
    },
    // ,
    // {
    //   title: "Deposited (ETH)",
    //   key: "reserveBalance",
    //   dataIndex: "reserveBalance",
    //   render: value => {
    //     return ethers.utils.formatEther(value);
    //   },
    // },
  ];

  // form
  const [amount, setAmount] = useState(0);
  const yourBalance = useContractReader(readContracts, "PriorityPricing", "balanceOf", [address]);

  const formStyle = {
    padding: "1rem",
    background: "#fafafa",
    border: "1px solid #888",
    borderRadius: "1rem",
    marginBottom: "1rem",
  };

  return (
    <div>
      <div style={formStyle}>
        <h2>Purchase Credits</h2>
        <p>Purchase credits from contract</p>
        <div>Your Credit Balance: {yourBalance ? formatEther(yourBalance) : 0}</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem" }}>
          <EtherInput
            price={price}
            value={amount}
            onChange={value => {
              setAmount(value);
            }}
          />
          <Button
            onClick={() => {
              tx(writeContracts.PriorityPricing.mint({ value: parseEther(amount) }));
            }}
          >
            Purchase
          </Button>
        </div>
      </div>

      <h2>In My Network</h2>
      {data ? (
        <>
          <Table dataSource={data.users} columns={userColumns} rowKey="id" />
        </>
      ) : (
        <Typography>{loading ? "Loading..." : deployWarning}</Typography>
      )}
      {/* 
      <div style={{ margin: 32, height: 400, border: "1px solid #888888", textAlign: "left" }}>
        <GraphiQL fetcher={graphQLFetcher} docExplorerOpen query={EXAMPLE_GRAPHQL} />
      </div>
       */}
    </div>
  );
}

export default HoldersTable;

const deployWarning = <div style={{ marginTop: 8, padding: 8 }}>Warning: 🤔 Have you deployed your subgraph yet?</div>;
