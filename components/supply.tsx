"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useTonWallet } from "@tonconnect/ui-react";
import ConnectWallet from "./connect-wallet";
import { TacSdk, RawSender, Network } from "tac-sdk";
import { ethers } from "ethers";
import { toNano } from "@ton/ton";
import { loadEnvConfig } from '@next/env'

const projectDir = process.cwd()
loadEnvConfig(projectDir)

export function TokenSupply() {
  const [supplyAmount, setSupplyAmount] = React.useState<number>(0);
  const [referralCode, setReferralCode] = React.useState<number>(0);
  
  const wallet = useTonWallet();
  const handleSupply = async () => {
    
    const TON_TOKEN_ADDRESS = "EQA0xOG6KPZYhxm2zjoxBOIxVIMe2QY3X2s8mco6mhFLfl_4";
    const TOKEN_ADDRESS_ON_TAC = "0x392D1cCB04d25fCBcA7D4fc0E429Dbc1F9fEe73F";
    const USER_ADDRESS_ON_TAC = "0xeD3Af36D7b9C5Bbd7ECFa7fb794eDa6E242016f5";
    const ZEROLEND_POOL_ON_TAC = "0xB3BAEf2461950B4F6Cc8566799ba6E13A6d8F6F8";
    console.log("🚀 ~ handleSupply ~ ZEROLEND_POOL_ON_TAC:", ZEROLEND_POOL_ON_TAC)
    try {
      
      // Initialize SDK
      const tacSdk = new TacSdk({
        tonClientParameters: {
          endpoint: "https://ton-testnet.core.chainstack.com/0fa8c05c7bf921a575e20f051a312a84/api/v2/jsonRPC",
        },
        network: Network.Testnet,
      });

      // create sender abstraction
      const mnemonic = process.env.MNEMONIC;
      const sender = new RawSender(mnemonic);
      console.log("🚀 ~ handleSupply ~ sender:", sender)

      // create evm proxy msg
      const abi = new ethers.AbiCoder();
      const encodedParameters = abi.encode(
        ["address", "uint256", "address", "uint16"],
        [
          TOKEN_ADDRESS_ON_TAC,
          Number(toNano(supplyAmount)),
          USER_ADDRESS_ON_TAC,
          referralCode
        ]
      );
      console.log("🚀 ~ handleSupply ~ encodedParameters:", encodedParameters)

      const evmProxyMsg = {
        evmTargetAddress: ZEROLEND_POOL_ON_TAC,
        methodName:
          "supply(address,uint256,address,uint16)", 
        encodedParameters,
      };
      console.log("🚀 ~ handleSupply ~ evmProxyMsg:", evmProxyMsg)

      // create JettonTransferData
      const jettons = [];
      jettons.push({
        fromAddress: await sender.getSenderAddress(Network.Testnet),
        tokenAddress: TON_TOKEN_ADDRESS,
        jettonAmount: supplyAmount,
        tonAmount: 0.35,
      });
      console.log("🚀 ~ handleSupply ~ jettons:", jettons)

      const tx = await tacSdk.sendShardJettonTransferTransaction(
        jettons,
        evmProxyMsg,
        sender
      );

      console.log(tx);

      console.log("transation submitted");
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-3 rounded-3xl bg-[#131313] z-20">
      <div className="space-y-4 border border-border rounded-2xl p-4">

        {/* Supply Amount */}
        <div>
          <label className="text-md text-gray-400">Supply Amount</label>
          <input
            type="number"
            placeholder="Enter Amount"
            value={supplyAmount > 0 ? supplyAmount : ""}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value >= 0) setSupplyAmount(value);
            }}
            className="w-full h-12 mt-2 text-white bg-transparent border border-gray-700 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Referral Code */}
        <div>
          <label className="text-md text-gray-400">Referral Code (optional)</label>
          <input
            type="number"
            placeholder="Enter Referral Code"
            value={referralCode > 0 ? referralCode : ""}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value >= 0 && value <= 65535) setReferralCode(value); // uint16 range
            }}
            className="w-full h-12 mt-2 text-white bg-transparent border border-gray-700 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSupply}
          className="w-full h-12 mt-4 text-lg text-white bg-primary rounded-lg hover:bg-primary-dark focus:outline-none"
        >
          Supply
        </button>

        {/* Get Started Button */}
        {wallet ? (
          <ConnectWallet
            text="Supply"
            onClick={handleSupply}
            disabled={supplyAmount === 0}
            className="w-full h-14 rounded-2xl mt-2 text-lg bg-primary text-white"
          />
        ) : (
          <Button className="w-full h-14 rounded-2xl mt-2 text-lg hover:text-white">
            Get started
          </Button>
        )}
      </div>
    </div>
  );

}
