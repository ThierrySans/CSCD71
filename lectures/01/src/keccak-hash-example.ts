import create from "keccak";

const keccak = create("keccak224"); 

const message = "Hello, Keccak!";
const hash = keccak.update("alice").digest('hex');

console.log('Message:', message);
console.log('Keccak Hash:', hash);