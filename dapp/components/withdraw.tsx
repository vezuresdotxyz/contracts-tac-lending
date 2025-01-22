"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useTonWallet, useTonConnectUI } from "@tonconnect/ui-react";
import ConnectWallet from "./connect-wallet";
import { TacSdk, Network, SenderFactory, AssetBridgingData } from "tac-sdk";
// import sdk from "tac-sdk";
import { ethers } from "ethers";

export function TokenWithdraw() {
  const [withdrawAmount, setWithdrawAmount] = React.useState<number>(0);
  const [toAddress, settoAddress] = React.useState<string>("");

  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI()
  const handleWithdraw = async () => {

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
      console.log("🚀 ~ handleWithdraw ~ sender:", sender)

      // create evm proxy msg
      const abi = new ethers.AbiCoder();
      const encodedParameters = abi.encode(
        ["address", "uint256", "address"],
        ['0x7C9631C5534CDc197e2FD0d30f65C244b10EFa46', withdrawAmount, toAddress]
      );
      console.log("🚀 ~ handleWithdraw ~ encodedParameters:", encodedParameters)

      const evmProxyMsg = {
        evmTargetAddress: '0x7995aBd27dEd50542Fb7B58a3e0280a47C72a1d2',
        methodName: "withdraw(address,uint256,address)",
        encodedParameters,
      };
      console.log("🚀 ~ handleWithdraw ~ evmProxyMsg:", evmProxyMsg)

      // create JettonTransferData
      const jettons: AssetBridgingData[] = [];
      jettons.push({
        address: TON_TOKEN_ADDRESS,
        amount: withdrawAmount,
      });
      console.log("🚀 ~ handleWithdraw ~ jettons:", jettons)

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

        {/* Withdraw Amount */}
        <div>
          <label className="text-md text-gray-400">Withdraw Amount</label>
          <input
            type="number"
            placeholder="Enter Amount"
            value={withdrawAmount > 0 ? withdrawAmount : ""}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value >= 0) setWithdrawAmount(value);
            }}
            className="w-full h-12 mt-2 text-white bg-transparent border border-gray-700 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* to Address */}
        <div>
          <label className="text-md text-gray-400">Referral Code (optional)</label>
          <input
            type="text"
            placeholder="Enter to Address"
            value={toAddress}
            onChange={(e) => settoAddress(e.target.value)}
            className="w-full h-12 mt-2 text-white bg-transparent border border-gray-700 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Submit Button */}
        {/* <button
          onClick={handleWithdraw}
          className="w-full h-12 mt-4 text-lg text-white bg-primary rounded-lg hover:bg-primary-dark focus:outline-none"
        >
          Withdraw
        </button> */}

        {/* Get Started Button */}
        {wallet ? (
          <ConnectWallet
            text="Withdraw"
            onClick={handleWithdraw}
            disabled={withdrawAmount === 0}
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