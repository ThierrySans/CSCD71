import * as bitcoin from 'bitcoinjs-lib';
import { readFileSync } from 'fs';
import fetch from 'node-fetch';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';

const ECPair = ECPairFactory(ecc);

// Define the Signet network
const signetNetwork: bitcoin.Network = {
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bech32: 'tb', // Same as Testnet for bech32 addresses
    bip32: {
        public: 0x043587cf,
        private: 0x04358394,
    },
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
    wif: 0xef,
};

// Define the type for UTXO information
interface UTXO {
    txid: string;
    vout: number;
    value: number;
    nonWitnessUtxo: string; // Hex string of the full transaction
}

// Define the type for Mempool.space API response
type MempoolAddressData = {
    chain_stats: {
        funded_txo_sum: number;
        spent_txo_sum: number;
    };
};

// Load the wallet information from wallet.json
function loadWallet() {
    try {
        const walletData = readFileSync('wallet.json', 'utf-8');
        const wallet = JSON.parse(walletData);
        return wallet;
    } catch (error) {
        console.error('Failed to load wallet.json:', error);
        throw error;
    }
}

async function fetchUTXOs(address: string): Promise<UTXO[]> {
    try {
        const apiUrl = `https://mempool.space/signet/api/address/${address}/utxo`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Error fetching UTXOs: ${response.statusText}`);
        }

        // Explicitly cast the result of response.json() as an array of objects
        const utxos = (await response.json()) as { txid: string; vout: number; value: number }[];

        return Promise.all(
            utxos.map(async (utxo) => ({
                txid: utxo.txid,
                vout: utxo.vout,
                value: utxo.value,
                nonWitnessUtxo: await fetchNonWitnessUtxo(utxo.txid),
            }))
        );
    } catch (error) {
        console.error('Failed to fetch UTXOs:', error);
        throw error;
    }
}

// Fetch the raw transaction for a given txid
async function fetchNonWitnessUtxo(txid: string): Promise<string> {
    try {
        const apiUrl = `https://mempool.space/signet/api/tx/${txid}/hex`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Error fetching raw transaction: ${response.statusText}`);
        }

        return await response.text();
    } catch (error) {
        console.error(`Failed to fetch raw transaction for txid ${txid}:`, error);
        throw error;
    }
}

// Display Bitcoin address
function showBitcoinAddress(wallet: { address: string; privateKey: string }) {
    console.log(`Your Bitcoin Address: ${wallet.address}`);
}

// Fetch wallet balance using Mempool.space Signet API
async function showWalletBalance(address: string) {
    try {
        const apiUrl = `https://mempool.space/signet/api/address/${address}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Error fetching balance: ${response.statusText}`);
        }

        const data = (await response.json()) as MempoolAddressData;
        const balanceInSatoshis = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
        const balanceInBTC = balanceInSatoshis / 1e8;

        console.log(`Wallet Balance: ${balanceInBTC} BTC (${balanceInSatoshis} satoshis)`);
    } catch (error) {
        console.error('Failed to fetch wallet balance:', error);
    }
}


// Initialize a Bitcoin transaction
async function initializeTransaction(
    privateKey: string,
    recipientAddress: string,
    amountInSatoshis: number
) {
    try {
        const keyPair = ECPair.fromWIF(privateKey, signetNetwork);

        // Create a custom signer
        const signer: bitcoin.Signer = {
            publicKey: Buffer.from(keyPair.publicKey),
            sign: (hash: Buffer) => Buffer.from(keyPair.sign(hash)),
        };

        // Fetch UTXOs for the wallet address
        const wallet = loadWallet();
        const utxos = await fetchUTXOs(wallet.address);

        if (utxos.length === 0) {
            console.error('No UTXOs available for the wallet');
            return;
        }

        const psbt = new bitcoin.Psbt({ network: signetNetwork }); // Create a new PSBT

        // Add inputs from UTXOs
        let inputAmount = 0;
        for (const utxo of utxos) {
            psbt.addInput({
                hash: utxo.txid,
                index: utxo.vout,
                nonWitnessUtxo: Buffer.from(utxo.nonWitnessUtxo, 'hex'),
            });
            inputAmount += utxo.value;
            if (inputAmount >= amountInSatoshis) break; // Stop when we have enough inputs
        }

        if (inputAmount < amountInSatoshis) {
            console.error('Insufficient funds for the transaction');
            return;
        }

        // Add the output for the recipient
        psbt.addOutput({
            address: recipientAddress,
            value: amountInSatoshis,
        });

        // Add change output if needed
        const change = inputAmount - amountInSatoshis;
        if (change > 0) {
            psbt.addOutput({
                address: wallet.address, // Send change back to the wallet
                value: change,
            });
        }

        // Sign all inputs with the custom signer
        for (let i = 0; i < utxos.length; i++) {
            psbt.signInput(i, signer);
        }

        // Finalize and build the transaction
        psbt.finalizeAllInputs();
        const transactionHex = psbt.extractTransaction().toHex();
        console.log('Transaction Hex:', transactionHex);
    } catch (error) {
        console.error('Failed to initialize transaction:', error);
    }
}

// Main execution
(async () => {
    const recipientAddress = 'tb1qkqu30krvqxf8c2rwczg7gyj5gxjc3alufvtped'; // Replace with a real recipient address
    const amountInSatoshis = 1000; // Amount to send (in satoshis)

    const wallet = loadWallet();
    showBitcoinAddress(wallet);
	await showWalletBalance(wallet.address);
    // await initializeTransaction(wallet.privateKey, recipientAddress, amountInSatoshis);
})();
