"""Authentication services for account credentials and role authorization."""

import hashlib
import hmac
import secrets

from psycopg import Connection

from backend.app.models.user_account import UserAccount

_PASSWORD_HASH_ITERATIONS = 600_000
_PASSWORD_HASH_NAME = "pbkdf2_sha256"
_PASSWORD_SALT_BYTES = 16
_PASSWORD_DIGEST_BYTES = 32
_ALLOWED_ROLES = {"student", "committee", "faculty"}


class InvalidCredentialsError(Exception):
    """Raised when the username or password does not match an account."""


class UnauthorizedAccountError(Exception):
    """Raised when the account is suspended or has an unsupported role."""


# รองรับ: FR-LOG-03 และ Security ใน spec
def hash_password(password: str) -> str:
    """Hash a password with a per-password random salt; never log credentials."""
    salt = secrets.token_bytes(_PASSWORD_SALT_BYTES)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        _PASSWORD_HASH_ITERATIONS,
        dklen=_PASSWORD_DIGEST_BYTES,
    )
    return (
        f"{_PASSWORD_HASH_NAME}${_PASSWORD_HASH_ITERATIONS}"
        f"${salt.hex()}${digest.hex()}"
    )


# รองรับ: FR-LOG-03 และ Security ใน spec
def verify_password(password: str, password_hash: str) -> bool:
    """Verify a PBKDF2 password hash without exposing password data."""
    try:
        algorithm, raw_iterations, raw_salt, raw_digest = password_hash.split("$")
        iterations = int(raw_iterations)
        salt = bytes.fromhex(raw_salt)
        expected_digest = bytes.fromhex(raw_digest)
    except (AttributeError, TypeError, ValueError):
        return False

    if (
        algorithm != _PASSWORD_HASH_NAME
        or iterations != _PASSWORD_HASH_ITERATIONS
        or len(salt) != _PASSWORD_SALT_BYTES
        or len(expected_digest) != _PASSWORD_DIGEST_BYTES
    ):
        return False

    actual_digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        iterations,
        dklen=len(expected_digest),
    )
    return hmac.compare_digest(actual_digest, expected_digest)


# รองรับ: FR-LOG-03, FR-LOG-04, ASM-LOG-02, ASM-LOG-03
def authenticate_user(
    connection: Connection,
    username: str,
    password: str,
) -> UserAccount:
    """Validate credentials first, then account status and the supported role."""
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT username, password_hash, status, role
            FROM user_accounts
            WHERE username = %s
            """,
            (username,),
        )
        row = cursor.fetchone()

    if row is None or not verify_password(password, row[1]):
        raise InvalidCredentialsError

    account = UserAccount(
        username=row[0],
        password_hash=row[1],
        status=row[2],
        role=row[3],
    )
    if account.status != "active" or account.role not in _ALLOWED_ROLES:
        raise UnauthorizedAccountError
    return account
