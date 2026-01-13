"""
Email and password validator demonstrating Python best practices.

This module provides validation utilities for common user input scenarios.
"""

import re
from typing import Tuple


class Validator:
    """Validates email addresses and passwords."""

    EMAIL_PATTERN = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
    MIN_PASSWORD_LENGTH = 8

    def validate_email(self, email: str) -> bool:
        """
        Validate email address format.

        Args:
            email: Email address to validate

        Returns:
            True if email is valid, False otherwise
        """
        if not email:
            return False
        return bool(self.EMAIL_PATTERN.match(email))

    def validate_password(self, password: str) -> Tuple[bool, str]:
        """
        Validate password strength.

        Password must:
        - Be at least 8 characters long
        - Contain at least one uppercase letter
        - Contain at least one lowercase letter
        - Contain at least one digit

        Args:
            password: Password to validate

        Returns:
            Tuple of (is_valid, error_message)
        """
        if not password:
            return False, "Password cannot be empty"

        if len(password) < self.MIN_PASSWORD_LENGTH:
            return (
                False,
                f"Password must be at least {self.MIN_PASSWORD_LENGTH} characters",
            )

        if not re.search(r"[A-Z]", password):
            return False, "Password must contain at least one uppercase letter"

        if not re.search(r"[a-z]", password):
            return False, "Password must contain at least one lowercase letter"

        if not re.search(r"\d", password):
            return False, "Password must contain at least one digit"

        return True, "Password is valid"

    def validate_username(self, username: str) -> bool:
        """
        Validate username format.

        Username must:
        - Be 3-20 characters long
        - Contain only letters, numbers, underscores, and hyphens
        - Start with a letter

        Args:
            username: Username to validate

        Returns:
            True if username is valid, False otherwise
        """
        if not username:
            return False

        if len(username) < 3 or len(username) > 20:
            return False

        if not username[0].isalpha():
            return False

        return bool(re.match(r"^[a-zA-Z][a-zA-Z0-9_-]*$", username))
