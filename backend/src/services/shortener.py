import secrets
import string

class ShortenerGenerator:
    ALPHABET = string.ascii_letters + string.digits

    @classmethod
    def generate(cls, length: int = 6) -> str:
        return "".join(secrets.choice(cls.ALPHABET) for i in range(length))