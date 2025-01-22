import hre from "hardhat";
import {ethers} from "ethers";

async function main() {;
  const crossChainLayerAddress = "0xf101319630F67cEaa4612930FbDd2Ee26F6E8288";
  const zerolendPoolAddress = "0x4dFa558A5bDDA4A4396B41c1EC1B02e330137CAf";
  const deployer = "0xeD3Af36D7b9C5Bbd7ECFa7fb794eDa6E242016f5";
  const bluePrintFactoy = await hre.ethers.getContractFactory("ZLSmartAccount");
  const bluePrint = await bluePrintFactoy.deploy();
  await bluePrint.deployed();

  console.log("Smart Account bluePrint deployer at: ", bluePrint.address);

  const abi = [
    "function initialize(address _initBlueprint, address _pool) public",
  ];
  const iface = new ethers.utils.Interface(abi);

  const intializerData = iface.encodeFunctionData("initialize", [
    bluePrint,
    zerolendPoolAddress,
  ]);

  const TonProxyApp = await hre.ethers.getContractFactory("TonProxyApp");
  const tonProxyApp = await TonProxyApp.deploy(crossChainLayerAddress);
  await tonProxyApp.deployed();

  console.log("TonProxyApp impl deployed at: ", tonProxyApp.address);

  const proxyFactory = await hre.ethers.getContractFactory("InitializableImmutableAdminUpgradeabilityProxy");
  const proxy = await proxyFactory.deploy([deployer])

  console.log("Proxy deployed at: ", proxy.address);

  await proxy.initialize(tonProxyApp.address, intializerData);

  console.log("Proxy initialized with TonProxyApp and bluePrint");
}


main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });