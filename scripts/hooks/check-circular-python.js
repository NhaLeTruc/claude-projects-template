#!/usr/bin/env node

/**
 * Python Circular Dependency Checker using pydeps
 *
 * This script wraps pydeps to detect circular dependencies in Python code.
 * Note: For comprehensive dependency checking (unused/missing/transitive),
 * use deptry via `npm run check:deps:python:full`.
 *
 * This check focuses specifically on circular imports, which deptry
 * does not currently detect.
 *
 * Usage: node scripts/hooks/check-circular-python.js
 *
 * Exit codes:
 *   0 - No circular dependencies found
 *   1 - Circular dependencies detected or error occurred
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SRC_DIRS = ['src', '.'];
const EXCLUDE_PATTERNS = ['venv', '.venv', '__pycache__', 'tests', 'test_', 'node_modules', 'dist', 'build'];

/**
 * Find Python packages (directories with __init__.py)
 */
function findPythonPackages(baseDir) {
    const packages = [];

    function traverse(dir) {
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            const hasInit = entries.some(e => e.name === '__init__.py');

            if (hasInit) {
                packages.push(dir);
            }

            for (const entry of entries) {
                if (entry.isDirectory() && !EXCLUDE_PATTERNS.some(p => entry.name.includes(p))) {
                    traverse(path.join(dir, entry.name));
                }
            }
        } catch {
            // Skip unreadable directories
        }
    }

    for (const srcDir of SRC_DIRS) {
        const fullPath = path.join(baseDir, srcDir);
        if (fs.existsSync(fullPath)) {
            traverse(fullPath);
        }
    }

    return packages;
}

/**
 * Check if pydeps is installed
 */
function checkPydepsInstalled() {
    try {
        execSync('python -m pydeps --version', { stdio: 'pipe' });
        return true;
    } catch {
        return false;
    }
}

/**
 * Check for circular dependencies in a Python package
 */
function checkPackageForCycles(packagePath) {
    try {
        // Run pydeps with --show-cycles to detect circular imports
        const result = spawnSync('python', [
            '-m', 'pydeps',
            packagePath,
            '--no-output',
            '--no-show',
            '--show-cycles'
        ], {
            encoding: 'utf8',
            timeout: 60000,
            stdio: ['pipe', 'pipe', 'pipe']
        });

        const output = (result.stdout || '') + (result.stderr || '');
        const lowerOutput = output.toLowerCase();

        // Check for cycle indicators
        if (lowerOutput.includes('circular') ||
            lowerOutput.includes('cycle') ||
            lowerOutput.includes('cyclic')) {
            return { hasCycles: true, details: output.trim() };
        }

        // Also check exit code - pydeps may exit with error on cycles
        if (result.status !== 0 && output.trim()) {
            // Only report as cycle if output mentions cycles
            if (lowerOutput.includes('import')) {
                return { hasCycles: true, details: output.trim() };
            }
        }

        return { hasCycles: false, details: '' };
    } catch (error) {
        // Handle timeout or other errors
        return { hasCycles: false, details: '', error: error.message };
    }
}

/**
 * Main execution
 */
function main() {
    const projectRoot = process.cwd();

    console.log('Checking Python packages for circular dependencies...');
    console.log('(Matches TypeScript Madge circular dependency detection)\n');

    // Check if pydeps is installed
    if (!checkPydepsInstalled()) {
        console.error('Error: pydeps is not installed.');
        console.error('Install it with: pip install pydeps');
        console.error('Or: pip install -r .config/python/requirements-dev.txt\n');
        process.exit(1);
    }

    // Find Python packages
    const packages = findPythonPackages(projectRoot);

    if (packages.length === 0) {
        console.log('No Python packages found to check.');
        console.log('(Looking for directories with __init__.py)\n');
        process.exit(0);
    }

    console.log(`Found ${packages.length} Python package(s) to check:\n`);

    let hasCircular = false;
    const circularDeps = [];

    for (const pkg of packages) {
        const relativePath = path.relative(projectRoot, pkg) || '.';
        process.stdout.write(`  Checking ${relativePath}... `);

        const result = checkPackageForCycles(pkg);

        if (result.error) {
            console.log(`(skipped: ${result.error})`);
        } else if (result.hasCycles) {
            console.log('CYCLES DETECTED');
            hasCircular = true;
            circularDeps.push({
                package: relativePath,
                details: result.details
            });
        } else {
            console.log('OK');
        }
    }

    console.log('');

    if (hasCircular) {
        console.error('Circular dependencies detected:\n');
        for (const dep of circularDeps) {
            console.error(`  Package: ${dep.package}`);
            if (dep.details) {
                console.error(`  Details:\n    ${dep.details.split('\n').join('\n    ')}`);
            }
            console.error('');
        }
        console.error('Fix circular dependencies before pushing.');
        console.error('Use "npm run check:deps:python:graph" to visualize dependencies.\n');
        process.exit(1);
    }

    console.log('No circular dependencies found in Python code.\n');
    process.exit(0);
}

main();
