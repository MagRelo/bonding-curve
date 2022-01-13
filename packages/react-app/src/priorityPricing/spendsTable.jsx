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

function SpendsTable({ subgraphUri, price, tx, writeContracts, mainnetProvider, readContracts, address, owner }) {
  function graphQLFetcher(graphQLParams) {
    return fetch(subgraphUri, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(graphQLParams),
    }).then(response => response.json());
  }

  const EXAMPLE_GRAPHQL = `
  {
    spends {
      from
      to
      value
    }
  }
  `;
  const EXAMPLE_GQL = gql(EXAMPLE_GRAPHQL);
  const { loading, data, error } = useQuery(EXAMPLE_GQL, { pollInterval: 2500 });
  const tableColumns = [
    {
      title: "From",
      key: "from",
      dataIndex: "from",
      render: record => <Address value={record} ensProvider={mainnetProvider} fontSize={14} />,
    },
    {
      title: "To",
      key: "to",
      dataIndex: "to",
      render: record => <Address value={record} ensProvider={mainnetProvider} fontSize={14} />,
    },
    {
      title: "Value",
      key: "value",
      dataIndex: "value",
      render: value => {
        return ethers.utils.formatEther(value);
      },
    },
  ];

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
        <h2>Spend Credits</h2>
        <p>Transfer tokens to pricipal</p>

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
              tx(writeContracts.PriorityPricing.transfer(owner, parseEther(amount)));
            }}
          >
            Spend
          </Button>
        </div>
      </div>

      <h2>Spends</h2>
      {data ? (
        <>
          <Table dataSource={data.spends} columns={tableColumns} rowKey="id" />
        </>
      ) : (
        <Typography>{loading ? "Loading..." : error}</Typography>
      )}

      {/* 
      <hr />
      <div style={{ margin: 32, height: 400, border: "1px solid #888888", textAlign: "left" }}>
        <GraphiQL fetcher={graphQLFetcher} docExplorerOpen query={EXAMPLE_GRAPHQL} />
      </div> */}
    </div>
  );
}

export default SpendsTable;

const deployWarning = <div style={{ marginTop: 8, padding: 8 }}>Warning: 🤔 Have you deployed your subgraph yet?</div>;
