// https://www.oreilly.com/library/view/mastering-bitcoin/9781491902639/ch04.html
// https://medium.com/geekculture/generate-bitcoin-wallet-address-using-bitcoin-improvement-proposal-44-4672e5057bb
// https://medium.com/@blainemalone01/hd-wallets-why-hardened-derivation-matters-89efcdc71671
// https://medium.com/geekculture/what-is-bitcoin-improvement-proposal-39-bip-39-9a95ed07cb03
// https://medium.com/@robbiehanson15/the-math-behind-bip-32-child-key-derivation-7d85f61a6681
// https://arshbot.medium.com/hd-wallets-explained-from-high-level-to-nuts-and-bolts-9a41545f5b0
// https://www.npmjs.com/package/secp256k1

import { generateMnemonic, mnemonicToSeed } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

import { HDKey } from '@scure/bip32';

const mn = generateMnemonic(wordlist);
const seed = await mnemonicToSeed(mn);

const key = HDKey.fromMasterSeed(seed);
console.log(key.privateExtendedKey, key.publicExtendedKey);

const receivingKey = key.derive("m/44'/1'/0'/0");
console.log(receivingKey.privateExtendedKey, receivingKey.publicExtendedKey);

const checkKey = key.derive("m/44'/1'/0'/0/0");
console.log(checkKey.privateExtendedKey, checkKey.publicExtendedKey);

const transactionKey = HDKey.fromExtendedKey(receivingKey.publicExtendedKey).deriveChild(0);
console.log(transactionKey.publicExtendedKey);

// const sig = hdkey.sign(hash);
// hdkey.verify(hash, sig);

