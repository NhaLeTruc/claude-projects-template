"""Unit tests for the Validator class."""

import sys
import os

# Add examples directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../../examples/python'))

import pytest
from validator import Validator


class TestValidator:
    """Test cases for Validator class."""

    def setup_method(self):
        """Set up test fixtures."""
        self.validator = Validator()

    def test_validate_email_valid(self):
        """Test valid email addresses."""
        assert self.validator.validate_email('user@example.com') is True
        assert self.validator.validate_email('test.user@domain.co.uk') is True
        assert self.validator.validate_email('user+tag@example.com') is True

    def test_validate_email_invalid(self):
        """Test invalid email addresses."""
        assert self.validator.validate_email('') is False
        assert self.validator.validate_email('notanemail') is False
        assert self.validator.validate_email('@example.com') is False
        assert self.validator.validate_email('user@') is False
        assert self.validator.validate_email('user@domain') is False

    def test_validate_password_valid(self):
        """Test valid passwords."""
        is_valid, message = self.validator.validate_password('Password123')
        assert is_valid is True
        assert message == "Password is valid"

    def test_validate_password_empty(self):
        """Test empty password."""
        is_valid, message = self.validator.validate_password('')
        assert is_valid is False
        assert message == "Password cannot be empty"

    def test_validate_password_too_short(self):
        """Test password that is too short."""
        is_valid, message = self.validator.validate_password('Pass1')
        assert is_valid is False
        assert "at least 8 characters" in message

    def test_validate_password_no_uppercase(self):
        """Test password without uppercase letter."""
        is_valid, message = self.validator.validate_password('password123')
        assert is_valid is False
        assert "uppercase letter" in message

    def test_validate_password_no_lowercase(self):
        """Test password without lowercase letter."""
        is_valid, message = self.validator.validate_password('PASSWORD123')
        assert is_valid is False
        assert "lowercase letter" in message

    def test_validate_password_no_digit(self):
        """Test password without digit."""
        is_valid, message = self.validator.validate_password('Password')
        assert is_valid is False
        assert "digit" in message

    def test_validate_username_valid(self):
        """Test valid usernames."""
        assert self.validator.validate_username('user123') is True
        assert self.validator.validate_username('test_user') is True
        assert self.validator.validate_username('User-Name') is True

    def test_validate_username_invalid(self):
        """Test invalid usernames."""
        assert self.validator.validate_username('') is False
        assert self.validator.validate_username('ab') is False  # Too short
        assert self.validator.validate_username('a' * 21) is False  # Too long
        assert self.validator.validate_username('123user') is False  # Starts with number
        assert self.validator.validate_username('user@name') is False  # Invalid char
