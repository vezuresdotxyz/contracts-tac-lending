"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useTonWallet, useTonConnectUI } from "@tonconnect/ui-react";
import ConnectWallet from "./connect-wallet";
import { TacSdk, Network, SenderFactory, AssetBridgingData } from "tac-sdk";
import sdk from "tac-sdk";
import { ethers } from "ethers";

export function TokenSupply() {
  const [supplyAmount, setSupplyAmount] = React.useState<number>(0);
  const [referralCode, setReferralCode] = React.useState<number>(0);

  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI()
  const handleSupply = async () => {

    const TON_TOKEN_ADDRESS = "kQCmRPHBHHqg0zf05dVvMmEwNh_cj8nRaYaYf0IoI8NIDHBa";

    try {
      if (!wallet) return

      // Initialize SDK
      const tacSdk = new TacSdk({
        tonClientParameters: {
          endpoint: "https://ton-testnet.core.chainstack.com/0fa8c05c7bf921a575e20f051a312a84/api/v2/jsonRPC",
        },
        network: Network.Testnet,
      });

      // create sender abstraction
      const sender = await SenderFactory.getSender({
        tonConnect: tonConnectUI,
      });
      console.log("🚀 ~ handleSupply ~ sender:", sender)

      // create evm proxy msg
      const abi = new ethers.AbiCoder();
      const encodedParameters = abi.encode(
        ["address", "address", "uint256"],
        ['0x7C9631C5534CDc197e2FD0d30f65C244b10EFa46', '0x0F6e98A756A40dD050dC78959f45559F98d3289d', supplyAmount]
      );
      console.log("🚀 ~ handleSupply ~ encodedParameters:", encodedParameters)

      const evmProxyMsg = {
        evmTargetAddress: '0x7995aBd27dEd50542Fb7B58a3e0280a47C72a1d2',
        methodName: "supply(address,address,uint256)",
        encodedParameters,
      };
      console.log("🚀 ~ handleSupply ~ evmProxyMsg:", evmProxyMsg)

      // create JettonTransferData
      const jettons: AssetBridgingData[] = [];
      jettons.push({
        address: TON_TOKEN_ADDRESS,
        amount: supplyAmount,
      });
      console.log("🚀 ~ handleSupply ~ jettons:", jettons)

      const tx = await tacSdk.sendCrossChainTransaction(evmProxyMsg, sender, jettons);
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
        {/* <button
          onClick={handleSupply}
          className="w-full h-12 mt-4 text-lg text-white bg-primary rounded-lg hover:bg-primary-dark focus:outline-none"
        >
          Supply
        </button> */}

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
