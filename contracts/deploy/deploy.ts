import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { InitializableAdminUpgradeabilityProxy, ZerolendPoolProxy } from "../typechain";
import { save } from "../scripts/utils";

const func: DeployFunction = async function ({
    getNamedAccounts,
    deployments,
    ...hre
  }: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deployer Address:", deployer);

  // Deployment parameters
  const crossChainLayerAddress = "0x9fee01e948353E0897968A3ea955815aaA49f58d";
  const zerolendPoolAddress = "0xc9205A79bca35D66c077cC625b41e4FaF2e2b04f";

  // Deploy the ZLSmartAccount blueprint
  console.log("Deploying ZLSmartAccount blueprint...");
  const bluePrint = await deploy("SmartAccountBluePrint", {
    from: deployer,
    contract: "ZLSmartAccount",
    log: true,
  });
  console.log("SmartAccountBluePrint deployed at:", bluePrint.address);

  save(
    hre.network.name,
    "SmartAccountBluePrint",
    "ZLSmartAccount",
    bluePrint.address,
  );

  // Deploy the ZLSmartAccountFactory
  console.log("Deploying ZLSmartAccountFactory...");
  const smartAccountFactory = await deploy("ZLSmartAccountFactory", {
    from: deployer,
    contract: "ZLSmartAccountFactory",
    log: true,
  });
  console.log("ZLSmartAccountFactory deployed at:", smartAccountFactory.address);

  save(
    hre.network.name,
    "ZLSmartAccountFactory",
    "ZLSmartAccountFactory",
    smartAccountFactory.address
  );

  // Initialize the ZLSmartAccountFactory with the blueprint
  console.log("Initializing ZLSmartAccountFactory...");
  const factoryContract = await hre.ethers.getContractAt("ZLSmartAccountFactory", smartAccountFactory.address);
  // const initTx = await factoryContract.initialize(bluePrint.address);
  console.log("ZLSmartAccountFactory initialized with tx:");

  // Deploy the ZerolendPoolProxy implementation
  console.log("Deploying ZerolendPoolProxy implementation...");
  const zerolendPoolProxyImpl = await deploy("ZerolendPoolProxyImpl", {
    from: deployer,
    contract: "ZerolendPoolProxy",
    log: true,
  });
  console.log("ZerolendPoolProxy Impl deployed at:", zerolendPoolProxyImpl.address);

  save(
    hre.network.name,
    "ZerolendPoolProxyImpl",
    "ZerolendPoolProxy",
    zerolendPoolProxyImpl.address
  );

  // Deploy the proxy contract
  console.log("Deploying Proxy...");
  const proxyArtifact = await deploy("ZerolendPoolProxy-Proxy", {
    from: deployer,
    contract: "InitializableAdminUpgradeabilityProxy",
    log: true,
  });
  console.log("Proxy deployed at:", proxyArtifact.address);

  save(
    hre.network.name,
    "ZerolendPoolProxy-Proxy",
    "InitializableAdminUpgradeabilityProxy",
    proxyArtifact.address
  );

  // Get contract instances
  const zerolendPoolProxyContract = (await hre.ethers.getContractAt(
    zerolendPoolProxyImpl.abi,
    zerolendPoolProxyImpl.address
  )) as any as ZerolendPoolProxy;

  const proxy = (await hre.ethers.getContractAt(
    proxyArtifact.abi,
    proxyArtifact.address
  )) as any as InitializableAdminUpgradeabilityProxy;

  // Encode the initialization data for the proxy
  const initializePayload = zerolendPoolProxyContract.interface.encodeFunctionData(
    "initialize",
    [
      deployer, // deployer
      zerolendPoolAddress, // appAddress
      smartAccountFactory.address, // ZLSmartAccountFactoryAddress
      crossChainLayerAddress // _crossChainLayer
    ]
  );

  // Initialize the proxy
  console.log("Initializing proxy with ZerolendPoolProxy implementation...");
  const proxyInitTx = await proxy["initialize(address,address,bytes)"](
    zerolendPoolProxyImpl.address,
    deployer,
    initializePayload
  );
  console.log("Proxy initialized with tx:", proxyInitTx);

  // Verify the deployment
  console.log("\nDeployment Summary:");
  console.log("SmartAccountBluePrint:", bluePrint.address);
  console.log("ZLSmartAccountFactory:", smartAccountFactory.address);
  console.log("ZerolendPoolProxy Implementation:", zerolendPoolProxyImpl.address);
  console.log("Proxy:", proxyArtifact.address);
  console.log("Cross Chain Layer:", crossChainLayerAddress);
  console.log("Zerolend Pool:", zerolendPoolAddress);
};

func.tags = ["ZerolendPoolProxy"];
func.dependencies = [];
func.id = "ZerolendPoolProxy";

export default func;