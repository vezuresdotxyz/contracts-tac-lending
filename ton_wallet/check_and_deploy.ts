import TonWeb from 'tonweb';

const privateKey = '1209c23cd0bdd8ac708b29a29694955e9edf8560bdb2744b6cdde4104e0cf5edfea74ae47fc9ba7c7864bc5a8d385d9e4ecf5d9d330126df3b5c2a98e4b91184';

const httpProvider = new TonWeb.HttpProvider('https://ton-testnet.core.chainstack.com/0fa8c05c7bf921a575e20f051a312a84/api/v2/jsonRPC');
const tonweb = new TonWeb(httpProvider);

async function deployWallet() {
    try {
        const keyPair = TonWeb.utils.nacl.sign.keyPair.fromSecretKey(TonWeb.utils.hexToBytes(privateKey));
        const WalletClass = tonweb.wallet.all['v4R2'];
        const wallet = new WalletClass(tonweb.provider, {
            publicKey: keyPair.publicKey,
            wc: 0
        });
        console.log(TonWeb.utils.bytesToHex(keyPair.secretKey));

        const walletAddress = await wallet.getAddress();
        console.log('Wallet address:', walletAddress.toString(true, true, true));

        const balance = await tonweb.provider.getBalance(walletAddress.toString());
        console.log('Wallet balance:', balance);

        if (balance === '0') {
            console.error('Wallet has no balance. Please add funds before deploying.');
            return;
        }

        const seqno = await wallet.methods.seqno().call();
        console.log('Seqno:', seqno);

        if (seqno === null) {
            console.log('Wallet not deployed. Deploying...');
            const deployResult = await wallet.deploy(keyPair.secretKey).send();
            console.log('Deploy result:', deployResult);
        } else {
            console.log('Wallet already deployed. Seqno:', seqno);
        }
    } catch (error) {
        console.error('Unexpected error:', error.message);
    }
}

deployWallet();