from src import config
import base64
from Crypto.Cipher import AES

def decrypt(encrypted_base64: str) -> str:
    key = bytes.fromhex(config.settings.SECRET_KEY)  # 32 bajty
    iv = bytes.fromhex(config.settings.SECRET_KEY_IV)    # 16 bajtów
    
    cipher = AES.new(key, AES.MODE_CBC, iv)
    
    # Dekodujemy z Base64 -> bajty
    encrypted_bytes = base64.b64decode(encrypted_base64)
    decrypted_bytes = cipher.decrypt(encrypted_bytes)
    
    # Usuwamy padding PKCS#7
    padding_len = decrypted_bytes[-1]
    decrypted_bytes = decrypted_bytes[:-padding_len]

    # Zamieniamy bajty na tekst (UTF-8)
    return decrypted_bytes.decode('utf-8')