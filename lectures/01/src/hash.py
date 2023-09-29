#!/usr/bin/python3

# using the PyNaCl: Python binding to the libsodium library
# https://pynacl.readthedocs.io/en/latest/

from nacl.encoding import Base64Encoder
from nacl.hash import sha256

msg = b'Hi, I am Alice'
digest_base64 = sha256(msg, encoder=Base64Encoder)
print(digest_base64.decode('utf-8'))

msg = b'Hi, I am Alica'
digest_base64 = sha256(msg, encoder=Base64Encoder)
print(digest_base64.decode('utf-8'))
