"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useTonWallet, useTonConnectUI } from "@tonconnect/ui-react";
import ConnectWallet from "./connect-wallet";
import { TacLocalTestSdk, JettonInfo, TokenMintInfo } from "tac-l2-ccl";
// import sdk from "tac-sdk";
import { ethers } from "ethers";
import { SenderFactory } from "tac-sdk";


export function TokenSupply() {
  const [supplyAmount, setSupplyAmount] = React.useState<number>(0);
  const [referralCode, setReferralCode] = React.useState<number>(0);
  
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI()
  let testSdk: TacLocalTestSdk;

  const handleSupply = async () => {

    const JETTON_TVM_ADDRESS = "kQCmRPHBHHqg0zf05dVvMmEwNh_cj8nRaYaYf0IoI8NIDHBa";
    const TON_PROXY_APP_ADDRESS = "";
    try {
      if (!wallet) return

      const queryId = BigInt(1);

      const jettonInfo: JettonInfo = {
        tvmAddress: JETTON_TVM_ADDRESS, // jetton minter contract address
        name: "ZeroLend",
        symbol: "ZERO",
        decimals: BigInt(9),
        description: "ZeroLend Token on TON",
        image: "https://cache.tonapi.io/imgproxy/cOMlJuViiVXDCkAghnyNj7plX8pAZ9pv3WhklvebpTY/rs:fill:200:200:1/g:no/aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3RvbmtlZXBlci9vcGVudG9uYXBpL21hc3Rlci9wa2cvcmVmZXJlbmNlcy9tZWRpYS90b2tlbl9wbGFjZWhvbGRlci5wbmc.webp",
      };

      const tokenMintInfo: TokenMintInfo = {
        info: jettonInfo,
        mintAmount: BigInt(supplyAmount) * BigInt(10 ** 9),
      };

      // Initialize SDK
      testSdk = new TacLocalTestSdk();
      const provider = new ethers.JsonRpcProvider("https://ton-testnet.core.chainstack.com/820a1a4a79e25c497e622fbb4c6e7da1/api/v2");

      const crossChainLayerAddress = testSdk.create(provider);
      const operationId = "supplyOperationID";
      // create sender abstraction
      const sender = await SenderFactory.getSender({
        tonConnect: tonConnectUI,
      });
      // define untrusted extra data by executor (it's not implemented yet on tac infrasctaucture - just empty bytes)
      const extraData = "0x";

      const timestamp = BigInt(Math.floor(Date.now() / 1000));

      // console.log("🚀 ~ handleSupply ~ sender:", sender)

      const tokenEVMAddress = testSdk.getEVMJettonAddress(JETTON_TVM_ADDRESS);
      const tvmCallerAddress = sender.getSenderAddress()
      // create evm proxy msg
      const abi = new ethers.AbiCoder();
      const encodedParameters = abi.encode(
        ["tuple(address,uint256,uint16)"],
        [tokenEVMAddress, supplyAmount, referralCode]
      );

      const methodName = "supplyZerolend(bytes,bytes)";
      const target = TON_PROXY_APP_ADDRESS;

      const { receipt, deployedTokens, outMessages } = await testSdk.sendMessage(
        queryId,
        target,
        methodName,
        encodedParameters,
        tvmCallerAddress,
        [tokenMintInfo],
        [],
        BigInt(0),
        extraData,
        operationId,
        timestamp
      );
      
      // console.log("🚀 ~ handleSupply ~ receipt:", receipt)
      
      // console.log("🚀 ~ handleSupply ~ deployedTokens:", deployedTokens)
      
      // console.log("🚀 ~ handleSupply ~ outMessages:", outMessages)
      
    } catch (e) {
      // console.log(e);
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
