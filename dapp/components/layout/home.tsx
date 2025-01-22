import { TokenSupply } from "@/components/supply";
import Header from "@/components/layout/header";
import { TokenBorrow } from "../borrow";
import { TokenWithdraw } from "../withdraw";

export default function Home() {
  return (
    <div>
      <Header />
      <div className="mt-20 flex flex-col items-center justify-center gap-10">
        <h1 className="text-white text-6xl font-medium text-center leading-[1.2]">
          CONNECT WITH ZEROLEND
        </h1>
        <TokenSupply />
        <TokenBorrow />
        <TokenWithdraw />
        <p className="text-gray-400 text-center text-md w-1/4">
          This is just a demostration for supply.
        </p>
      </div> 
    </div>
  );
}
