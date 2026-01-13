package tests.examples.java;

import examples.java.StringUtils;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Unit tests for StringUtils class.
 */
public class StringUtilsTest {

    @Test
    public void testIsEmptyWithNull() {
        assertTrue(StringUtils.isEmpty(null));
    }

    @Test
    public void testIsEmptyWithEmptyString() {
        assertTrue(StringUtils.isEmpty(""));
    }

    @Test
    public void testIsEmptyWithNonEmptyString() {
        assertFalse(StringUtils.isEmpty("hello"));
    }

    @Test
    public void testIsBlankWithNull() {
        assertTrue(StringUtils.isBlank(null));
    }

    @Test
    public void testIsBlankWithWhitespace() {
        assertTrue(StringUtils.isBlank("   "));
    }

    @Test
    public void testIsBlankWithText() {
        assertFalse(StringUtils.isBlank("hello"));
    }

    @Test
    public void testReverseWithNull() {
        assertNull(StringUtils.reverse(null));
    }

    @Test
    public void testReverseWithString() {
        assertEquals("olleh", StringUtils.reverse("hello"));
    }

    @Test
    public void testReverseWithEmptyString() {
        assertEquals("", StringUtils.reverse(""));
    }

    @Test
    public void testCapitalizeWithNull() {
        assertNull(StringUtils.capitalize(null));
    }

    @Test
    public void testCapitalizeWithEmptyString() {
        assertEquals("", StringUtils.capitalize(""));
    }

    @Test
    public void testCapitalizeWithLowercase() {
        assertEquals("Hello", StringUtils.capitalize("hello"));
    }

    @Test
    public void testCapitalizeWithUppercase() {
        assertEquals("Hello", StringUtils.capitalize("Hello"));
    }

    @Test
    public void testCountOccurrencesWithNull() {
        assertEquals(0, StringUtils.countOccurrences(null, 'a'));
    }

    @Test
    public void testCountOccurrencesWithEmptyString() {
        assertEquals(0, StringUtils.countOccurrences("", 'a'));
    }

    @Test
    public void testCountOccurrencesWithCharacter() {
        assertEquals(3, StringUtils.countOccurrences("hello world", 'l'));
    }

    @Test
    public void testCountOccurrencesWithNoMatch() {
        assertEquals(0, StringUtils.countOccurrences("hello", 'z'));
    }

    @Test
    public void testIsPalindromeWithNull() {
        assertFalse(StringUtils.isPalindrome(null));
    }

    @Test
    public void testIsPalindromeWithEmptyString() {
        assertFalse(StringUtils.isPalindrome(""));
    }

    @Test
    public void testIsPalindromeWithValidPalindrome() {
        assertTrue(StringUtils.isPalindrome("racecar"));
    }

    @Test
    public void testIsPalindromeWithNonPalindrome() {
        assertFalse(StringUtils.isPalindrome("hello"));
    }

    @Test
    public void testIsPalindromeWithSpacesAndPunctuation() {
        assertTrue(StringUtils.isPalindrome("A man, a plan, a canal: Panama"));
    }

    @Test
    public void testUtilityClassCannotBeInstantiated() {
        assertThrows(UnsupportedOperationException.class, () -> {
            java.lang.reflect.Constructor<StringUtils> constructor =
                StringUtils.class.getDeclaredConstructor();
            constructor.setAccessible(true);
            constructor.newInstance();
        });
    }
}
