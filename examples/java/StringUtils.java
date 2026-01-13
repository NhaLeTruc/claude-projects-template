package examples.java;

/**
 * String utility class demonstrating Java best practices.
 * Provides common string manipulation operations.
 */
public final class StringUtils {

    /**
     * Private constructor to prevent instantiation.
     */
    private StringUtils() {
        throw new UnsupportedOperationException("Utility class");
    }

    /**
     * Checks if a string is null or empty.
     *
     * @param str the string to check
     * @return true if string is null or empty, false otherwise
     */
    public static boolean isEmpty(final String str) {
        return str == null || str.isEmpty();
    }

    /**
     * Checks if a string is null, empty, or contains only whitespace.
     *
     * @param str the string to check
     * @return true if string is blank, false otherwise
     */
    public static boolean isBlank(final String str) {
        return str == null || str.trim().isEmpty();
    }

    /**
     * Reverses a string.
     *
     * @param str the string to reverse
     * @return reversed string, or null if input is null
     */
    public static String reverse(final String str) {
        if (str == null) {
            return null;
        }
        return new StringBuilder(str).reverse().toString();
    }

    /**
     * Capitalizes the first letter of a string.
     *
     * @param str the string to capitalize
     * @return capitalized string, or null if input is null
     */
    public static String capitalize(final String str) {
        if (isEmpty(str)) {
            return str;
        }
        return Character.toUpperCase(str.charAt(0)) + str.substring(1);
    }

    /**
     * Counts occurrences of a character in a string.
     *
     * @param str the string to search
     * @param ch the character to count
     * @return number of occurrences
     */
    public static int countOccurrences(final String str, final char ch) {
        if (isEmpty(str)) {
            return 0;
        }
        int count = 0;
        for (int i = 0; i < str.length(); i++) {
            if (str.charAt(i) == ch) {
                count++;
            }
        }
        return count;
    }

    /**
     * Checks if a string is a palindrome.
     *
     * @param str the string to check
     * @return true if string is a palindrome, false otherwise
     */
    public static boolean isPalindrome(final String str) {
        if (isEmpty(str)) {
            return false;
        }
        final String cleaned = str.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        final String reversed = new StringBuilder(cleaned).reverse().toString();
        return cleaned.equals(reversed);
    }
}
