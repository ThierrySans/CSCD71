import * as secp256k1 from 'tiny-secp256k1';
import * as crypto from 'crypto';

// Generate a random private key (32 bytes)
const privateKey = crypto.randomBytes(32);
console.log("Private Key:", privateKey.toString('hex'));

// Derive the public key from the private key
if (!secp256k1.isPrivate(privateKey)) {
    throw new Error("Invalid private key");
}
const publicKey = secp256k1.pointFromScalar(privateKey);
if (!publicKey) {
    throw new Error("Failed to generate public key");
}
console.log("Public Key:", Buffer.from(publicKey).toString('hex'));

// Message to sign
const message = "Hello, Tiny-secp256k1!";
console.log("Message:", message);

// Create a hash of the message
const messageHash = crypto.createHash('sha256').update(message).digest();
console.log("Message Hash:", messageHash.toString('hex'));

// Sign the message hash
const signature = secp256k1.sign(messageHash, privateKey);
if (!signature) {
    throw new Error("Signing failed");
}
console.log("Signature:", Buffer.from(signature).toString('hex'));

// Verify the signature
const isValid = secp256k1.verify(messageHash, publicKey, signature);
console.log("Signature valid:", isValid);
