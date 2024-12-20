import { mnemonicToWalletKey } from "@ton/crypto";
import TonWeb from "tonweb";

async function main() {
  // const mnemonicArray = 'put your mnemonic'.split(' ') // get our mnemonic as array
  const mnemonicArray = [
    "parrot",
    "during",
    "fitness",
    "matrix",
    "planet",
    "elevator",
    "era",
    "dash",
    "ceiling",
    "network",
    "real",
    "behind",
    "nasty",
    "tackle",
    "hawk",
    "office",
    "disagree",
    "sister",
    "bulk",
    "nose",
    "stove",
    "raven",
    "ride",
    "sausage",
  ]; // 24 is the number of words in a seed phrase
  const keyPair = await mnemonicToWalletKey(mnemonicArray); // extract private and public keys from mnemonic
  const keyPairData = {
    publicKey: TonWeb.utils.bytesToHex(keyPair.publicKey),
    secretKey: TonWeb.utils.bytesToHex(keyPair.secretKey),
  };
  console.log(keyPairData); // if we want, we can print our mnemonic
}
main();
