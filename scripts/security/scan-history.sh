#!/bin/bash
# Deep historical secret scan using TruffleHog

echo "🔍 Running deep historical secret scan with TruffleHog..."
echo "This may take several minutes for large repositories."
echo ""

if ! command -v trufflehog &> /dev/null; then
    echo "❌ TruffleHog not installed"
    echo "Install: https://github.com/trufflesecurity/trufflehog"
    exit 1
fi

# Run TruffleHog on entire git history
trufflehog git file://. --since-commit="" --only-verified --json > trufflehog-results.json

if [ $? -eq 0 ]; then
    echo "✅ Deep scan complete"
    echo "Results saved to: trufflehog-results.json"
else
    echo "❌ Secrets detected in git history!"
    echo "Review: trufflehog-results.json"
    exit 1
fi
