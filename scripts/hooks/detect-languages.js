#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const LANGUAGE_PATTERNS = {
  typescript: ['.ts', '.tsx'],
  javascript: ['.js', '.jsx'],
  python: ['.py'],
  java: ['.java'],
  go: ['.go'],
  rust: ['.rs'],
  cpp: ['.cpp', '.cc', '.cxx', '.c', '.h', '.hpp'],
};

const EXCLUDE_DIRS = [
  'node_modules',
  'dist',
  'build',
  'coverage',
  '__pycache__',
  '.git',
  '.venv',
  'venv',
  'target',
];

function detectLanguages(dir = '.') {
  const languages = new Set();

  function traverse(currentDir) {
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        // Skip excluded directories
        if (EXCLUDE_DIRS.includes(entry.name)) {
          continue;
        }

        if (entry.isDirectory()) {
          traverse(fullPath);
        } else if (entry.isFile()) {
          // Check file extension against language patterns
          for (const [language, extensions] of Object.entries(LANGUAGE_PATTERNS)) {
            if (extensions.some(ext => entry.name.endsWith(ext))) {
              languages.add(language);
            }
          }
        }
      }
    } catch (error) {
      // Silently skip directories we can't read
    }
  }

  traverse(dir);
  return Array.from(languages);
}

function main() {
  const languages = detectLanguages();

  if (languages.length === 0) {
    console.log('No source files detected');
    process.exit(0);
  }

  // Output as comma-separated list
  console.log(languages.join(','));
  process.exit(0);
}

main();
