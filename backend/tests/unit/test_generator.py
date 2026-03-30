import string

from src.services.shortener import ShortenerGenerator as gen


def test_generator_length():
    code = gen.generate(length=6)
    assert len(code) == 6

def test_generator_alphabet():
    code = gen.generate()
    alphabet = string.ascii_letters + string.digits
    for char in code:
        assert char in alphabet
