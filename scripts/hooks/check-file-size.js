#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MAX_LINES = 500;
const EXCEPTIONS_FILE = '.filesize-exceptions';
const EXCLUDE_PATTERNS = ['node_modules', 'dist', 'coverage', 'build', '.git', '__pycache__'];

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
};

function loadExceptions() {
  if (!fs.existsSync(EXCEPTIONS_FILE)) {
    return [];
  }

  return fs.readFileSync(EXCEPTIONS_FILE, 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
}

function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.split('\n').length;
  } catch (error) {
    console.warn(`${colors.yellow}Warning: Could not read ${filePath}${colors.reset}`);
    return 0;
  }
}

function matchesPattern(filePath, pattern) {
  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/\./g, '\\.')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(filePath);
}

function isExcluded(filePath, exceptions) {
  return exceptions.some(pattern => matchesPattern(filePath, pattern));
}

function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf-8'
    });
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.warn(`${colors.yellow}Warning: Could not get staged files${colors.reset}`);
    return [];
  }
}

function getAllSourceFiles(dir = '.') {
  const files = [];

  function traverse(currentDir) {
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        const relativePath = fullPath.startsWith('./') ? fullPath.slice(2) : fullPath;

        // Skip excluded directories
        if (EXCLUDE_PATTERNS.some(pattern => relativePath.includes(pattern))) {
          continue;
        }

        if (entry.isDirectory()) {
          traverse(fullPath);
        } else if (entry.isFile()) {
          // Check source code extensions
          if (/\.(ts|tsx|js|jsx|py|java|go|rs|cpp|c|h)$/.test(entry.name)) {
            files.push(relativePath);
          }
        }
      }
    } catch (error) {
      // Silently skip directories we can't read
    }
  }

  traverse(dir);
  return files;
}

function formatViolationMessage(violations) {
  let message = `${colors.red}❌ File size violations detected:${colors.reset}\n\n`;

  violations.forEach(({ file, lines }) => {
    const excess = lines - MAX_LINES;
    message += `  ${colors.red}${file}${colors.reset}: ${lines} lines (${excess} over limit)\n`;
  });

  message += `\n${colors.yellow}Maximum allowed: ${MAX_LINES} lines per file${colors.reset}\n`;
  message += `\nTo add exceptions, update ${EXCEPTIONS_FILE}:\n`;
  message += `  ${colors.yellow}# Example:${colors.reset}\n`;
  message += `  ${colors.yellow}src/specific/file.ts${colors.reset}\n`;
  message += `  ${colors.yellow}src/generated/*.ts${colors.reset}\n`;

  return message;
}

function main() {
  console.log('🔍 Checking file sizes...\n');

  const exceptions = loadExceptions();
  const stagedFiles = getStagedFiles();

  // If running in git hook context, only check staged files
  // Otherwise, check all source files
  const filesToCheck = stagedFiles.length > 0 ? stagedFiles : getAllSourceFiles();

  if (filesToCheck.length === 0) {
    console.log(`${colors.yellow}No files to check${colors.reset}\n`);
    process.exit(0);
  }

  const violations = [];

  for (const file of filesToCheck) {
    if (!fs.existsSync(file)) continue;

    // Only check source code files
    if (!/\.(ts|tsx|js|jsx|py|java|go|rs|cpp|c|h)$/.test(file)) continue;

    // Skip if in exceptions list
    if (isExcluded(file, exceptions)) {
      continue;
    }

    const lineCount = countLines(file);

    if (lineCount > MAX_LINES) {
      violations.push({ file, lines: lineCount });
    }
  }

  if (violations.length > 0) {
    console.error(formatViolationMessage(violations));
    process.exit(1);
  }

  console.log(`${colors.green}✅ All files are within size limits${colors.reset}\n`);
  process.exit(0);
}

main();
