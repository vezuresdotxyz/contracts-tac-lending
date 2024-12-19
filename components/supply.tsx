"use client";

import * as React from "react";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTonWallet } from "@tonconnect/ui-react";
import { TonConnectUI } from "@tonconnect/ui";
import ConnectWallet from "./connect-wallet";
import { TacSdk, Network, SenderFactory, AssetBridgingData, TransactionLinker, startTracking, TransactionStatus, SimplifiedStatuses } from "tac-sdk";
import { ethers } from "ethers";
import { toNano } from "@ton/ton";
import 'dotenv/config';
import { vechain } from "viem/chains";

declare let process : {
  env: {
    MNEMONIC: string
  }
};

export function TokenSupply() {
  const [supplyAmount, setSupplyAmount] = React.useState<number>(0);
  
  const wallet = useTonWallet();
  async function trackTransaction(transactionLinker: TransactionLinker) {
    const tracker = new TransactionStatus();

    // Method 1: Detailed tracking
    const operationId = await tracker.getOperationId(transactionLinker);
    if (operationId) {
      const status = await tracker.getStatusTransaction(operationId);
      console.log("Detailed status:", status);
    }

    // Method 2: Simplified tracking
    const simplifiedStatus = await tracker.getSimplifiedTransactionStatus(
      transactionLinker
    );
    console.log("Simplified status:", SimplifiedStatuses[simplifiedStatus]);
  }

  const handleSupply = async () => {
    
    const TON_TOKEN_ADDRESS = "EQA0xOG6KPZYhxm2zjoxBOIxVIMe2QY3X2s8mco6mhFLfl_4";
    const USER_ADDRESS_ON_TAC = "0xeD3Af36D7b9C5Bbd7ECFa7fb794eDa6E242016f5";
    const EVM_PROXY_ZEROLEND = "0xd8C5AF9180Ac310169d48997D7A2C5bC387e1ca6";
    console.log("🚀 ~ handleSupply ~ ZEROLEND_POOL_ON_TAC:", EVM_PROXY_ZEROLEND)
    try { 
      // Initialize SDK
      const tacSdk = new TacSdk({
        tonClientParameters: {
          endpoint: "https://ton-testnet.core.chainstack.com/0fa8c05c7bf921a575e20f051a312a84/api/v2/jsonRPC",
        },
        network: Network.Testnet,
        delay: 3,
      });
      await tacSdk.init();
      
      const TOKEN_ADDRESS_ON_TAC = await tacSdk.getEVMTokenAddress(TON_TOKEN_ADDRESS);
      console.log("🚀 ~ handleSupply ~ TOKEN_ADDRESS_ON_TAC:", TOKEN_ADDRESS_ON_TAC)
      // create sender abstraction
      const mnemonic = "parrot during fitness matrix planet elevator era dash ceiling network real behind nasty tackle hawk office disagree sister bulk nose stove raven ride sausage";
      
      // create evm proxy msg
      const abi = new ethers.AbiCoder();
      const encodedParameters = abi.encode(
        ["address", "uint256", "address"],
        [
          TOKEN_ADDRESS_ON_TAC,
          Number(toNano(supplyAmount)),
          USER_ADDRESS_ON_TAC,
        ]
      );
      console.log("🚀 ~ handleSupply ~ encodedParameters:", encodedParameters)
      
      const evmProxyMsg = {
        evmTargetAddress: EVM_PROXY_ZEROLEND,
        methodName:
        "depositToZerolend(address,uint256,address)", 
        encodedParameters,
      };
      console.log("🚀 ~ handleSupply ~ evmProxyMsg:", evmProxyMsg)
      
      // const ecodedString = abi.encode(
      //   ["uint256"],
      //   [
      //     Number(toNano(supplyAmount)),
      //   ]
      // );
      // const evmProxyMesg = {
      //   evmTargetAddress: "0x8512Dd80732943670F0850517aC5D91f697b92ea",
      //   methodName:
      //   "increase(uint256)", 
      //   ecodedString,
      // }
      // console.log("🚀 ~ handleSupply ~ evmProxyMasg:", evmProxyMesg)
      
      const assets: AssetBridgingData[] = [
        {
          address: TON_TOKEN_ADDRESS,
          amount: supplyAmount
        },
      ]
      console.log("🚀 ~ handleSupply ~ jettons:", assets)
      

      const sender = await SenderFactory.getSender({
            mnemonic: mnemonic,
            version: "v3r2",
      });
      console.log("🚀 ~ handleSupply ~ sender:", sender)
      const transactionLinker  = await tacSdk.sendCrossChainTransaction(
        evmProxyMsg,
        sender,
        assets
      );

      console.log(transactionLinker);
      trackTransaction(transactionLinker);
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

        {/* Increase Button*/}
        {wallet ? (
          <ConnectWallet
            text="Increase"
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
