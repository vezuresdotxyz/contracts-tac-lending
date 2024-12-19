import TonWeb from 'tonweb';
import fs from 'fs';

const httpProvider = new TonWeb.HttpProvider('https://ton-testnet.core.chainstack.com/0fa8c05c7bf921a575e20f051a312a84/api/v2/jsonRPC');
const tonweb = new TonWeb(httpProvider);

async function generateAndInitializeWallet() {
    // Generate a new key pair
    const keyPair = TonWeb.utils.nacl.sign.keyPair();
    
    // Create a v4R2 wallet instance
    const WalletClass = tonweb.wallet.all['v4R2'];
    const wallet = new WalletClass(tonweb.provider, {
        publicKey: keyPair.publicKey,
        wc: 0
    });

    // Get the wallet address
    const walletAddress = await wallet.getAddress();
    const addressString = walletAddress.toString(true, true, true);

    console.log('Generated wallet address:', addressString);
    console.log('Please send some TON to this address to initialize the wallet.');

    // Save the key pair to a file
    const keyPairData = {
        publicKey: TonWeb.utils.bytesToHex(keyPair.publicKey),
        secretKey: TonWeb.utils.bytesToHex(keyPair.secretKey)
    };
    fs.writeFileSync('wallet_keys.json', JSON.stringify(keyPairData, null, 2));
    console.log('Key pair saved to wallet_keys.json');

    // Wait for the wallet to be topped up
    await waitForBalance(walletAddress);

    // Initialize the wallet
    console.log('Initializing wallet...');
    const deployResult = await wallet.deploy(keyPair.secretKey).send();
    console.log('Deployment transaction sent:', deployResult);

    console.log('Waiting for deployment to complete...');
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds

    const seqno = await wallet.methods.seqno().call();
    if (seqno !== null) {
        console.log('Wallet successfully initialized!');
    } else {
        console.log('Wallet initialization might have failed. Please check the address on a block explorer.');
    }
}

async function waitForBalance(address: string) {
    while (true) {
        const balance = await tonweb.getBalance(address);
        if (balance && balance !== '0') {
            console.log('Balance detected:', TonWeb.utils.fromNano(balance), 'TON');
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5 seconds
    }
}

generateAndInitializeWallet().catch(console.error);