import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { InitializableAdminUpgradeabilityProxy, TonProxyApp } from "../typechain";
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
  const crossChainLayerAddress = "0xf101319630F67cEaa4612930FbDd2Ee26F6E8288";
  const zerolendPoolAddress = "0x4dFa558A5bDDA4A4396B41c1EC1B02e330137CAf";

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

  // Deploy the TonProxyApp implementation
  console.log("Deploying TonProxyApp implementation...");
  const tonProxyAppArtifact = await deploy("TonProxyAppImpl", {
    from: deployer,
    contract: "TonProxyApp",
    args: [crossChainLayerAddress],
    log: true,
  });
  console.log("TonProxyApp Impl artifact deployed")

  save(
    hre.network.name,
    "TonProxyAppImpl",
    "TonProxyApp",
    tonProxyAppArtifact.address
  )

  // Deploy the proxy contract
  console.log("Deploying Proxy...");

  const proxyArtifact = await deploy("TonProxyApp-Proxy", {
    from: deployer,
    contract: "InitializableAdminUpgradeabilityProxy",
    log: true,
  });
  console.log("Proxy artifact deployed) ");

  save(
    hre.network.name,
    "TonProxyApp-Proxy",
    "InitializableAdminUpgradeabilityProxy",
    proxyArtifact.address
  )

  // Initialize the proxy with the TonProxyApp implementation and initializer data
  const tonProxyAppImpl = (await hre.ethers.getContractAt(
      tonProxyAppArtifact.abi,
      tonProxyAppArtifact.address
  )) as any as TonProxyApp;

  const proxy = (await hre.ethers.getContractAt(
    proxyArtifact.abi,
    proxyArtifact.address
  )) as any as InitializableAdminUpgradeabilityProxy;

  const tx = await tonProxyAppImpl.initialize(
    bluePrint.address,
    zerolendPoolAddress,
   { gasLimit: 1000000 }
  );

  await tx.wait();
  console.log("ProxyImpl initialized with TonProxyApp and ZLSmartAccount blueprint, at tx: ", tx.hash);

  const initializePayload = tonProxyAppImpl.interface.encodeFunctionData(
    "initialize",
    [
        bluePrint.address,
        zerolendPoolAddress,
    ]
);
  const proxyInitTx = await proxy["initialize(address,address,bytes)"](
    tonProxyAppArtifact.address,
    deployer,
    initializePayload
  );
  await proxyInitTx.wait();
    console.log("Proxy initialized with TonProxyApp and ZLSmartAccount blueprint, at tx: ", proxyInitTx.hash);
};

func.tags = ["TonProxyApp"];
func.dependencies = [];
func.id = "TonProxyApp";

export default func;