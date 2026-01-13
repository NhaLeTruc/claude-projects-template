#!/bin/bash
# Emergency secret cleanup using git-filter-repo

echo "⚠️  WARNING: This will rewrite git history!"
echo "Make sure you have a backup and team coordination."
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted"
    exit 0
fi

if ! command -v git-filter-repo &> /dev/null; then
    echo "❌ git-filter-repo not installed"
    echo "Install: pip install git-filter-repo"
    exit 1
fi

# Example: Remove specific file from history
# git filter-repo --path path/to/secret/file --invert-paths

echo "Provide the file path to remove from history:"
read -p "File path: " filepath

git filter-repo --path "$filepath" --invert-paths --force

echo ""
echo "✅ File removed from history"
echo "⚠️  Force push required: git push --force"
echo "⚠️  Notify team to rebase their branches"
