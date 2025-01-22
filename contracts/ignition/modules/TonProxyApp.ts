// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition
import { ethers } from "ethers";
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TonProxyAppModule = buildModule("TonProxyAppModule", (m) => {
    const deployer = m.getAccount(0);
    const crossChainLayerAddress = "0xf101319630F67cEaa4612930FbDd2Ee26F6E8288";
    const zerolendPoolAddress = "0x4dFa558A5bDDA4A4396B41c1EC1B02e330137CAf";

    const bluePrint = m.contract("ZLSmartAccount")
    const abi = [
        "function initialize(address _initBlueprint, address _pool) public",
      ];
    const iface = new ethers.Interface(abi);
    console.log("bluePrint.module.id", bluePrint.module.id);
    
    const intializerData = iface.encodeFunctionData("initialize", [
        bluePrint, // Replace with actual _initBlueprint
        "0xYourPoolAddressHere",          // Replace with actual _pool
      ]);

    const tonProxyApp = m.contract("TonProxyApp", [crossChainLayerAddress]);

    const proxy = m.contract("TransparentUpgradeableProxy", [
        tonProxyApp,
        deployer,
        "0x",
      ]);
    
    return { bluePrint };
});

export default LockModule;
