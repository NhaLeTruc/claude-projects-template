#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DOCS_DIR = 'docs';
const DOC_EXTENSIONS = ['.md', '.pdf', '.txt'];
const ALLOWED_ROOT_DOCS = [
  'README.md',
  'LICENSE',
  'LICENSE.md',
  'LICENSE.txt',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'CODE_OF_CONDUCT.md',
];

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
};

function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf-8'
    });
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    return [];
  }
}

function isDocFile(file) {
  return DOC_EXTENSIONS.some(ext => file.toLowerCase().endsWith(ext));
}

function isAllowedRootDoc(file) {
  const basename = path.basename(file);
  return ALLOWED_ROOT_DOCS.includes(basename);
}

function main() {
  console.log('📚 Checking documentation location...\n');

  const stagedFiles = getStagedFiles();
  const violations = [];

  for (const file of stagedFiles) {
    if (!isDocFile(file)) continue;

    const isInDocs = file.startsWith(`${DOCS_DIR}/`);
    const isRoot = !file.includes('/');

    if (!isInDocs && !isRoot) {
      // Doc file in subdirectory that's not docs/
      violations.push({
        file,
        reason: `should be in ${DOCS_DIR}/ directory`,
      });
    } else if (isRoot && !isAllowedRootDoc(file)) {
      // Doc file in root that's not allowed
      violations.push({
        file,
        reason: `not in allowed root docs list`,
      });
    }
  }

  if (violations.length > 0) {
    console.error(`${colors.red}❌ Documentation files in wrong location:${colors.reset}\n`);
    violations.forEach(({ file, reason }) => {
      console.error(`  ${colors.red}${file}${colors.reset}`);
      console.error(`    → ${reason}\n`);
    });

    console.error(`${colors.yellow}Allowed root documentation files:${colors.reset}`);
    ALLOWED_ROOT_DOCS.forEach(doc => {
      console.error(`  - ${doc}`);
    });
    console.error('');
    console.error(`${colors.yellow}All other .md/.pdf files must be in ${DOCS_DIR}/${colors.reset}\n`);

    process.exit(1);
  }

  console.log(`${colors.green}✅ All documentation files are correctly placed${colors.reset}\n`);
  process.exit(0);
}

main();
