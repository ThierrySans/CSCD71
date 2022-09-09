#!/usr/bin/python3

# using the PyNaCl: Python binding to the libsodium library
# https://pynacl.readthedocs.io/en/latest/

from nacl.signing import SigningKey
from nacl.signing import VerifyKey
from nacl.encoding import Base64Encoder

# Generate a new random key pair
key_pair = SigningKey.generate()

# Sign a message, the value returned embeds the message and its signature
signed_base64 = key_pair.sign(b'Hi, I am Alice', encoder=Base64Encoder)

# Encode the signature
public_key_base64 = key_pair.verify_key.encode(encoder=Base64Encoder)

print(public_key_base64.decode('utf-8'))
print(signed_base64.decode('utf-8'))
print(signed_base64.message.decode('utf-8'))
print(signed_base64.signature.decode('utf-8'))

# Create a  object from a base64 serialized public key
public_key = VerifyKey(public_key_base64, encoder=Base64Encoder)

# Check the validity of a message's signature
# The message and the signature can either be passed together, or
# separately if the signature is decoded to raw bytes.
# These are equivalent:
message = public_key.verify(signed_base64, encoder=Base64Encoder)
print(message.decode('utf-8'))
signature_bytes = Base64Encoder.decode(signed_base64.signature)
message = public_key.verify(signed_base64.message, signature_bytes, encoder=Base64Encoder)
print(message.decode('utf-8'))

# Alter the signed message text
forged = signed_base64[:-1] + bytes([int(signed_base64[-1]) ^ 1])
# Will raise nacl.exceptions.BadSignatureError, since the signature check
# is failing
public_key.verify(forged)