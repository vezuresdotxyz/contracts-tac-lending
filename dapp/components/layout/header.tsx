import React from "react";
import ConnectWallet from "../connect-wallet";

export default function Header() {
  const navItems = ["Trade", "Explore", "Pool"];

  return (
    <div className="flex justify-between items-center px-10 py-5 z-[100px] overflow-hidden">
      <div className="flex flex-row items-center gap-10">
        <div className="flex flex-row items-center gap-2">
          <span className="text-primary font-medium text-lg">
            Zerolend x TON
          </span>
        </div>
        <div className="flex flex-row items-center gap-6">
          {navItems.map((item) => (
            <p key={item} className="text-stone-400 font-medium">
              {item}
            </p>
          ))}
        </div>
      </div>
      <ConnectWallet />
    </div>
  );
}
