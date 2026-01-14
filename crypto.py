from cryptography.fernet import Fernet
from os import getenv

key = getenv("EINVOICE_SECRET_KEY")
if not key:
    raise RuntimeError("EINVOICE_SECRET_KEY not set")

# Convert string key to bytes (Fernet requires bytes)
key_bytes = key.encode('utf-8')
fernet = Fernet(key_bytes)

def encrypt_password(password: str) -> bytes:
    return fernet.encrypt(password.encode())

def decrypt_password(token: bytes) -> str:
    return fernet.decrypt(token).decode()
