import * as bitcoin from 'bitcoinjs-lib';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import { writeFileSync } from 'fs';

const ECPair = ECPairFactory(ecc);

const network = {
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bech32: 'tb', // Same as testnet
  bip32: {
    public: 0x043587cf,
    private: 0x04358394,
  },
  pubKeyHash: 0x6f, // Same as testnet
  scriptHash: 0xc4, // Same as testnet
  wif: 0xef,
};

async function createP2PKHwallet() {
    try {
        const keyPair = ECPair.makeRandom({ network });
        const { address } = bitcoin.payments.p2pkh({
          pubkey: Buffer.from(keyPair.publicKey),
          network,
        });
        const privateKey = keyPair.toWIF()

        console.log(`| Public Address | ${address} |`)
        console.log(`| Private Key | ${privateKey} |`)

        const wallet = {
            address: address,
            privateKey: privateKey
        };

        const walletJSON = JSON.stringify(wallet, null, 4);

        writeFileSync('wallet.json', walletJSON);

        console.log(`Wallet created and saved to wallet.json`);
    } catch (error) {
        console.log(error)
    }
}

createP2PKHwallet();