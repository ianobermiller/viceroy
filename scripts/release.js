#!/usr/bin/env node

import { exec } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execAsync = promisify(exec);
const __dirname = fileURLToPath(new URL('.', import.meta.url));

const args = process.argv.slice(2);
const versionType = args[0] || 'patch'; // major, minor, or patch

async function checkGitStatus() {
    try {
        const status = await runCommand('git status --porcelain', 'check git status');
        if (status) {
            console.error('❌ Working directory is not clean. Please commit or stash your changes first.');
            console.error('\nUncommitted changes:');
            console.error(status);
            process.exit(1);
        }
    } catch {
        console.error('❌ Not a git repository or git is not installed');
        process.exit(1);
    }
}

async function release() {
    try {
        // Check if working directory is clean
        await checkGitStatus();

        // Read package.json
        const packagePath = resolve(__dirname, '../package.json');
        const packageJson = JSON.parse(await readFile(packagePath, 'utf-8'));

        // Read manifest.json
        const manifestPath = resolve(__dirname, '../manifest.json');
        const manifest = JSON.parse(await readFile(manifestPath, 'utf-8'));

        // Parse current version
        const [major, minor, patch] = packageJson.version.split('.').map(Number);

        // Calculate new version
        let newVersion;
        switch (versionType) {
            case 'major':
                newVersion = `${major + 1}.0.0`;
                break;
            case 'minor':
                newVersion = `${major}.${minor + 1}.0`;
                break;
            case 'patch':
            default:
                newVersion = `${major}.${minor}.${patch + 1}`;
                break;
        }

        console.log(`📦 Bumping version from ${major}.${minor}.${patch} to ${newVersion} (${versionType})`);

        // Update version in both files
        packageJson.version = newVersion;
        manifest.version = newVersion;

        // Write files back
        await writeFile(packagePath, JSON.stringify(packageJson, null, 4) + '\n');
        await writeFile(manifestPath, JSON.stringify(manifest, null, 4) + '\n');
        console.log('✅ Updated package.json and manifest.json');

        // Git add
        await runCommand('git add package.json manifest.json', 'stage files');
        console.log('✅ Staged version files');

        // Git commit
        const commitMessage = `chore: bump version to v${newVersion}`;
        await runCommand(`git commit -m "${commitMessage}"`, 'commit changes');
        console.log(`✅ Committed: "${commitMessage}"`);

        // Git tag
        await runCommand(`git tag v${newVersion}`, 'create tag');
        console.log(`✅ Created tag: v${newVersion}`);

        // Git push with tags
        console.log('\n📤 Pushing to remote...');
        await runCommand('git push --follow-tags', 'push with tags');
        console.log('✅ Pushed to remote with tags');

        console.log('\n🎉 Release complete!');
        console.log(`\n✨ Version ${newVersion} has been released!`);
        console.log('\n📋 Next steps:');
        console.log('   1. Monitor the GitHub Actions workflow at:');
        console.log('      https://github.com/YOUR_USERNAME/viceroy/actions');
        console.log('   2. Wait for Chrome Web Store publishing to complete');
        console.log('   3. Check the GitHub release at:');
        console.log(`      https://github.com/YOUR_USERNAME/viceroy/releases/tag/v${newVersion}`);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

async function runCommand(command, description) {
    try {
        const { stderr, stdout } = await execAsync(command);
        if (stderr && !stderr.includes('warning')) {
            console.error(`⚠️  ${description}:`, stderr);
        }
        return stdout.trim();
    } catch (error) {
        throw new Error(`Failed to ${description}: ${error.message}`);
    }
}

release();
