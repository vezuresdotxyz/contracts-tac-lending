import { Network, TacSdk } from 'tac-sdk';
import TonWeb from 'tonweb';

const privateKey = '1209c23cd0bdd8ac708b29a29694955e9edf8560bdb2744b6cdde4104e0cf5edfea74ae47fc9ba7c7864bc5a8d385d9e4ecf5d9d330126df3b5c2a98e4b91184';

const httpProvider = new TonWeb.HttpProvider('https://ton-testnet.core.chainstack.com/0fa8c05c7bf921a575e20f051a312a84/api/v2/jsonRPC');
const tonweb = new TonWeb(httpProvider);

async function deployWallet() {
    try {
        const tacSdk = new TacSdk({
            tonClientParameters: {
                endpoint: "https://ton-testnet.core.chainstack.com/0fa8c05c7bf921a575e20f051a312a84/api/v2/jsonRPC",
            },
            network: Network.Testnet,
            delay: 3,
        });
        await tacSdk.init();
        const TON_TOKEN_ADDRESS = "EQA0xOG6KPZYhxm2zjoxBOIxVIMe2QY3X2s8mco6mhFLfl_4";
        const TOKEN_ADDRESS_ON_TAC = await tacSdk.getEVMTokenAddress(TON_TOKEN_ADDRESS);
        console.log("🚀 ~ handleSupply ~ TOKEN_ADDRESS_ON_TAC:", TOKEN_ADDRESS_ON_TAC)
    } catch (error) {
        console.error('Unexpected error:', error.message);
    }
}

deployWallet();