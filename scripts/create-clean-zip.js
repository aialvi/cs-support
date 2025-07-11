#!/usr/bin/env node

/**
 * Create a clean ZIP file for WordPress.org submission
 * 
 * This script creates a ZIP file that excludes hidden files, development files,
 * and other files that are not needed for the production plugin while keeping
 * the source code for transparency.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get plugin info from package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const pluginName = packageJson.name;
const version = packageJson.version;

// Create temp directory name
// const tempDir = `${pluginName}-${version}`;
// const zipFileName = `${pluginName}-${version}.zip`;

const tempDir = `${pluginName}`;
const zipFileName = `${pluginName}.zip`;

console.log('🏗️  Creating clean plugin ZIP for WordPress.org submission...');
console.log(`📦 Plugin: ${pluginName} v${version}`);

// Files and directories to exclude
const excludePatterns = [
    // Hidden files
    '.DS_Store',
    '.editorconfig',
    '.gitignore',
    '.gitattributes',
    '.git',
    '.github',

    // Development files
    'node_modules',
    'npm-debug.log*',
    'yarn-debug.log*',
    'yarn-error.log*',
    '.npm',
    '.yarn',

    // IDE files
    '.vscode',
    '.idea',
    '*.swp',
    '*.swo',
    '*~',

    // OS files
    'Thumbs.db',
    'ehthumbs.db',
    'Desktop.ini',

    // Build scripts (keep source, exclude build tools)
    'webpack.config*.js',
    'postcss.config.js',
    'tailwind.config.js',
    'scripts',

    // Package files
    'package*.json',
    'composer.lock',
    'pnpm-lock.yaml',
    'yarn.lock',

    // Development docs
    'ASSIGNMENT_SYSTEM.md',
    'shortcode-examples.md',

    // Any existing zip files
    '*.zip',

    // Temporary files
    'tmp',
    'temp',
    '.tmp',
    '.temp'
];

try {
    // Clean up any existing temp directory
    if (fs.existsSync(tempDir)) {
        console.log('🧹 Cleaning up existing temp directory...');
        execSync(`rm -rf "${tempDir}"`, { stdio: 'inherit' });
    }

    // Create temp directory
    console.log('📁 Creating temporary directory...');
    fs.mkdirSync(tempDir);

    // Copy files excluding patterns
    console.log('📋 Copying files...');

    // Build rsync exclude arguments
    const excludeArgs = excludePatterns
        .map(pattern => `--exclude='${pattern}'`)
        .join(' ');

    // Copy all files except excluded ones
    execSync(`rsync -av ${excludeArgs} --exclude='${tempDir}' ./ ${tempDir}/`, {
        stdio: 'inherit',
        cwd: process.cwd()
    });

    // Remove any hidden files that might have slipped through
    console.log('🔍 Removing any remaining hidden files...');
    try {
        execSync(`find "${tempDir}" -name ".*" -type f -delete`, { stdio: 'pipe' });
        execSync(`find "${tempDir}" -name ".*" -type d -empty -delete`, { stdio: 'pipe' });
    } catch (e) {
        // Ignore errors - some systems might not have find command
    }

    // Create the ZIP file
    console.log('🗜️  Creating ZIP file...');
    execSync(`zip -r "${zipFileName}" "${tempDir}"`, { stdio: 'inherit' });

    // Clean up temp directory
    console.log('🧹 Cleaning up...');
    execSync(`rm -rf "${tempDir}"`, { stdio: 'inherit' });

    // Get file size
    const stats = fs.statSync(zipFileName);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log('✅ ZIP file created successfully!');
    console.log(`📦 File: ${zipFileName}`);
    console.log(`📏 Size: ${fileSizeInMB} MB`);
    console.log('');
    console.log('🚀 This ZIP file is ready for WordPress.org submission!');
    console.log('');
    console.log('📋 What\'s included:');
    console.log('   ✅ All PHP source code');
    console.log('   ✅ Built CSS and JS files');
    console.log('   ✅ Block definitions and templates');
    console.log('   ✅ Language files');
    console.log('   ✅ Documentation (README.md, readme.txt)');
    console.log('   ✅ License and plugin headers');
    console.log('');
    console.log('🚫 What\'s excluded:');
    console.log('   ❌ Hidden files (.DS_Store, .gitignore, etc.)');
    console.log('   ❌ Development dependencies (node_modules)');
    console.log('   ❌ Build configuration files');
    console.log('   ❌ Development scripts and tools');

} catch (error) {
    console.error('❌ Error creating ZIP file:', error.message);

    // Clean up on error
    if (fs.existsSync(tempDir)) {
        execSync(`rm -rf "${tempDir}"`, { stdio: 'inherit' });
    }

    process.exit(1);
}
