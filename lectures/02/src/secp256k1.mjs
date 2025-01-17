import { randomBytes } from 'crypto';
import secp256k1 from 'secp256k1';

// generate privKey
let privKey
do {
  privKey = randomBytes(32)
} while (!secp256k1.privateKeyVerify(privKey))

console.log(new Uint8Array(privKey));

// get the public key in a compressed format
const pubKey = secp256k1.publicKeyCreate(privKey)

const msg = randomBytes(32)

// sign the message
const sigObj = secp256k1.ecdsaSign(msg, privKey)

// verify the signature
console.log(secp256k1.ecdsaVerify(sigObj.signature, msg, pubKey))