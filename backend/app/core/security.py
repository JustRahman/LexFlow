from datetime import datetime, timedelta
from typing import Any
import hashlib
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings

# Password hashing - use SHA256 pre-hash for long passwords to avoid bcrypt 72-byte limit
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__ident="2b"  # Use bcrypt 2b variant
)

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


def create_access_token(subject: str | Any, expires_delta: timedelta | None = None) -> str:
    """Create JWT access token"""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def _prepare_password(password: str) -> str:
    """Prepare password for bcrypt by pre-hashing if too long"""
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        # Pre-hash with SHA256 to stay under bcrypt's 72-byte limit
        return hashlib.sha256(password_bytes).hexdigest()
    return password


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    prepared = _prepare_password(plain_password)
    return pwd_context.verify(prepared, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    prepared = _prepare_password(password)
    return pwd_context.hash(prepared)
