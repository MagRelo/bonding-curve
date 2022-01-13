import { gql, useQuery } from "@apollo/client";
import { Button, Input, Table, Typography } from "antd";
import "antd/dist/antd.css";
import GraphiQL from "graphiql";
import "graphiql/graphiql.min.css";
import fetch from "isomorphic-fetch";
import React, { useState } from "react";
import { Address } from "../components";
import WithdrawTable from "../priorityPricing/withdrawTable";
import HoldersTable from "../priorityPricing/holdersTable";
import SpendsTable from "../priorityPricing/spendsTable";
import { useContractReader, useNonce } from "../hooks/index";

const { ethers } = require("ethers");

function Subgraph(props) {
  function graphQLFetcher(graphQLParams) {
    return fetch(props.subgraphUri, {
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
      render: record => <Address value={record} ensProvider={props.mainnetProvider} fontSize={16} />,
    },
    {
      title: "Credits",
      key: "bondingCurveTokenBalance",
      dataIndex: "bondingCurveTokenBalance",
      render: value => {
        return ethers.utils.formatEther(value);
      },
    },
    {
      title: "Deposited (ETH)",
      key: "reserveBalance",
      dataIndex: "reserveBalance",
      render: value => {
        return ethers.utils.formatEther(value);
      },
    },
  ];

  const deployWarning = (
    <div style={{ marginTop: 8, padding: 8 }}>Warning: 🤔 Have you deployed your subgraph yet?</div>
  );

  // profile
  const reserveBalance = useContractReader(props.readContracts, "PriorityPricing", "reserveBalance");
  const continuousSupply = useContractReader(props.readContracts, "PriorityPricing", "continuousSupply");
  const owner = useContractReader(props.readContracts, "PriorityPricing", "owner");
  const profile = {
    padding: "10px",
    border: "1px solid #ccc",
  };

  return (
    <div style={{ textAlign: "left", margin: "20px" }}>
      <div>
        <div>
          <div style={profile}>
            <h1>
              Matt Lovan &nbsp;
              <Address value={owner} ensProvider={props.mainnetProvider} fontSize={16} />
            </h1>
            <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "1rem" }}>
              <div>
                <p>Total Deposits: {reserveBalance && ethers.utils.formatEther(reserveBalance)} ETH </p>
                <p>Outstanding Credits: {continuousSupply && ethers.utils.formatEther(continuousSupply)}</p>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}></div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <HoldersTable subgraphUri={props.subgraphUri} />
            <WithdrawTable subgraphUri={props.subgraphUri} />
            <SpendsTable subgraphUri={props.subgraphUri} />
          </div>
        </div>
      </div>

      <hr />
      {/* 
      <div style={{ margin: 32, height: 400, border: "1px solid #888888", textAlign: "left" }}>
        <GraphiQL fetcher={graphQLFetcher} docExplorerOpen query={EXAMPLE_GRAPHQL} />
      </div> */}
    </div>
  );
}

export default Subgraph;
