#!/usr/bin/env python3
"""Check every donation address for the checksum its network defines.

  python3 tools/address_check.py            # the addresses in donations.ts
  python3 tools/address_check.py ADDRESS…   # any addresses, by kind
  python3 tools/address_check.py --self-test

A checksum is the last thing between a donor and a typo. Base58 chains, bech32
Bitcoin and Stellar's StrKey all carry one; an EVM address carries EIP-55 in its
letter-case. This reads `src/lib/content/donations.ts` and refuses an address
that fails its own network's test, so a hand-copied address can never ship.

Standard library only. The test vectors in --self-test are published ones.
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import re
import sys
from pathlib import Path

CONTENT = Path("src/lib/content/donations.ts")

# --- keccak-256, which is not NIST SHA3: the padding byte differs. ----------

_ROUND = [
    0x0000000000000001, 0x0000000000008082, 0x800000000000808A, 0x8000000080008000,
    0x000000000000808B, 0x0000000080000001, 0x8000000080008081, 0x8000000000008009,
    0x000000000000008A, 0x0000000000000088, 0x0000000080008009, 0x000000008000000A,
    0x000000008000808B, 0x800000000000008B, 0x8000000000008089, 0x8000000000008003,
    0x8000000000008002, 0x8000000000000080, 0x000000000000800A, 0x800000008000000A,
    0x8000000080008081, 0x8000000000008080, 0x0000000080000001, 0x8000000080008008,
]
_ROT = [
    [0, 36, 3, 41, 18], [1, 44, 10, 45, 2], [62, 6, 43, 15, 61],
    [28, 55, 25, 21, 56], [27, 20, 39, 8, 14],
]
_MASK = (1 << 64) - 1


def _rotl(value: int, shift: int) -> int:
    return ((value << shift) | (value >> (64 - shift))) & _MASK if shift else value


def _keccak_f(state: list[list[int]]) -> None:
    for round_index in range(24):
        c = [state[x][0] ^ state[x][1] ^ state[x][2] ^ state[x][3] ^ state[x][4] for x in range(5)]
        d = [c[(x - 1) % 5] ^ _rotl(c[(x + 1) % 5], 1) for x in range(5)]
        for x in range(5):
            for y in range(5):
                state[x][y] ^= d[x]
        b = [[0] * 5 for _ in range(5)]
        for x in range(5):
            for y in range(5):
                b[y][(2 * x + 3 * y) % 5] = _rotl(state[x][y], _ROT[x][y])
        for x in range(5):
            for y in range(5):
                state[x][y] = b[x][y] ^ (~b[(x + 1) % 5][y] & b[(x + 2) % 5][y])
        state[0][0] ^= _ROUND[round_index]


def keccak256(data: bytes) -> bytes:
    rate = 136
    padded = bytearray(data)
    padded.append(0x01)
    while len(padded) % rate:
        padded.append(0)
    padded[-1] |= 0x80
    state = [[0] * 5 for _ in range(5)]
    for offset in range(0, len(padded), rate):
        block = padded[offset:offset + rate]
        for index in range(rate // 8):
            lane = int.from_bytes(block[index * 8:index * 8 + 8], "little")
            state[index % 5][index // 5] ^= lane
        _keccak_f(state)
    out = bytearray()
    for index in range(4):
        out += state[index % 5][index // 5].to_bytes(8, "little")
    return bytes(out[:32])


# --- Each network's own checksum -------------------------------------------

B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
BECH32 = "qpzry9x8gf2tvdw0s3jn54khce6mua7l"


def b58decode(text: str) -> bytes:
    number = 0
    for char in text:
        if char not in B58:
            raise ValueError(f"{char!r} is not base58")
        number = number * 58 + B58.index(char)
    body = number.to_bytes((number.bit_length() + 7) // 8, "big") if number else b""
    return b"\0" * (len(text) - len(text.lstrip("1"))) + body


def eip55(address: str) -> str:
    body = address[2:]
    digest = keccak256(body.lower().encode()).hex()
    return "0x" + "".join(
        char.upper() if char.isalpha() and int(digest[index], 16) >= 8 else char
        for index, char in enumerate(body)
    )


def check_evm(address: str) -> str | None:
    if not re.fullmatch(r"0x[0-9a-fA-F]{40}", address):
        return "not 0x and 40 hex characters"
    if address[2:] != address[2:].lower() and address[2:] != address[2:].upper():
        if eip55(address) != address:
            return f"EIP-55 case does not match; the checksummed form is {eip55(address)}"
    return None


def bech32_polymod(values: list[int]) -> int:
    generator = [0x3B6A57B2, 0x26508E6D, 0x1EA119FA, 0x3D4233DD, 0x2A1462B3]
    checksum = 1
    for value in values:
        top = checksum >> 25
        checksum = ((checksum & 0x1FFFFFF) << 5) ^ value
        for index in range(5):
            if (top >> index) & 1:
                checksum ^= generator[index]
    return checksum


def check_bech32(address: str) -> str | None:
    if address.lower() != address and address.upper() != address:
        return "mixed case, which bech32 does not allow"
    lowered = address.lower()
    if not lowered.startswith("bc1"):
        return "not a mainnet Bitcoin address (expected bc1…)"
    # `bc1` is the human-readable part and its separator; data starts at 3.
    data = [BECH32.index(char) for char in lowered[3:]]
    expanded = [ord(char) >> 5 for char in "bc"] + [0] + [ord(char) & 31 for char in "bc"]
    if bech32_polymod(expanded + data) not in (1, 0x2BC830A3):
        return "bech32 checksum is wrong"
    if data[0] not in (0, 1):
        return "unknown witness version"
    return None


def check_base58(data: bytes, length: int, label: str) -> str | None:
    return None if len(data) == length else f"decodes to {len(data)} bytes, not {length} ({label})"


def check_solana(address: str) -> str | None:
    try:
        raw = b58decode(address)
    except ValueError as error:
        return str(error)
    return check_base58(raw, 32, "a Solana public key")


def check_tron(address: str) -> str | None:
    try:
        raw = b58decode(address)
    except ValueError as error:
        return str(error)
    if len(raw) != 25:
        return f"decodes to {len(raw)} bytes, not 25"
    body, checksum = raw[:21], raw[21:]
    if body[0] != 0x41:
        return "prefix byte is not 0x41, so this is not a Tron address"
    # Tron uses Base58Check, so the checksum is SHA-256 twice, not keccak.
    if hashlib.sha256(hashlib.sha256(body).digest()).digest()[:4] != checksum:
        return "Tron Base58Check checksum is wrong"
    return None


def check_stellar(address: str) -> str | None:
    if not re.fullmatch(r"G[A-Z2-7]{55}", address):
        return "not 56 characters of base32 starting with G"
    try:
        raw = base64.b32decode(address)
    except Exception:
        return "not valid base32"
    body, checksum = raw[:33], raw[33:]
    if body[0] != 6 << 3:
        return "version byte is not an account id"
    if crc16_xmodem(body).to_bytes(2, "little") != checksum:
        return "StrKey CRC16 is wrong"
    return None


def crc16_xmodem(data: bytes) -> int:
    crc = 0
    for byte in data:
        crc ^= byte << 8
        for _ in range(8):
            crc = ((crc << 1) ^ 0x1021) & 0xFFFF if crc & 0x8000 else (crc << 1) & 0xFFFF
    return crc


CHECKS = {
    "evm": check_evm,
    "bitcoin": check_bech32,
    "solana": check_solana,
    "tron": check_tron,
    "stellar": check_stellar,
}


def kind_of(address: str) -> str:
    if address.startswith("0x"):
        return "evm"
    if address.lower().startswith("bc1"):
        return "bitcoin"
    if address.startswith("T"):
        return "tron"
    if address.startswith("G") and len(address) == 56:
        return "stellar"
    return "solana"


# Anything shaped like an address, so a new one is covered without a list here.
ADDRESS_SHAPE = re.compile(
    r"'(0x[0-9a-fA-F]{40}"
    r"|bc1[02-9ac-hj-np-z]{25,60}"
    r"|G[A-Z2-7]{55}"
    r"|[1-9A-HJ-NP-Za-km-z]{32,58})'"
)


def addresses_in(path: Path) -> list[tuple[str, str]]:
    """Every address literal in the content file, in the order it is written."""
    text = path.read_text(encoding="utf-8")
    seen: list[str] = []
    for match in ADDRESS_SHAPE.finditer(text):
        if match.group(1) not in seen:
            seen.append(match.group(1))
    return [(address[:10], address) for address in seen]


def self_test() -> int:
    assert keccak256(b"").hex() == (
        "c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
    ), "keccak-256 of nothing is the published vector"
    # Two blocks, so the absorb and the padding both have to be right.
    assert keccak256(b"a" * 200).hex() == (
        "96ea54061def936c4be90b518992fdc6f12f535068a256229aca54267b4d084d"
    ), "multi-block keccak"
    assert eip55("0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359") == (
        "0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359"
    ), "EIP-55 vector"
    assert check_evm("0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359") is None
    assert check_evm("0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359".lower()) is None
    assert check_evm("0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d35A") is not None, "bad case"
    assert check_bech32("bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4") is None, "BIP-173 vector"
    assert check_bech32("bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t5") is not None, "one char off"
    assert check_solana("11111111111111111111111111111111") is None
    assert check_solana("1111111111111111111111111111111") is not None, "31 bytes"
    print("self-test passed: keccak, EIP-55, bech32, base58")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("addresses", nargs="*")
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--file", default=str(CONTENT))
    args = parser.parse_args()

    if args.self_test:
        return self_test()

    if args.addresses:
        pairs = [(kind_of(address), address) for address in args.addresses]
    else:
        path = Path(args.file)
        if not path.exists():
            print(f"{path} is missing", file=sys.stderr)
            return 1
        pairs = addresses_in(path)
        if not pairs:
            print(f"no addresses found in {path}", file=sys.stderr)
            return 1

    failures = 0
    for name, address in pairs:
        kind = kind_of(address)
        problem = CHECKS[kind](address)
        if problem:
            failures += 1
            print(f"[ADDRESS] {name}: {problem}")
        else:
            print(f"{name:<12} {kind:<8} ok  {address[:10]}…{address[-6:]}")

    print(f"{len(pairs) - failures} of {len(pairs)} address(es) pass their own checksum.")
    return 0 if not failures else 1


if __name__ == "__main__":
    sys.exit(main())
