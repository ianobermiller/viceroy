# Publishing Guide

This document explains how to publish the Viceroy Chrome extension to the Chrome
Web Store.

## Initial Setup

### 1. Chrome Web Store Developer Account

1. Go to the
   [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Sign in with your Google account
3. Pay the one-time $5 developer registration fee
4. Create your extension listing (if not already created)

### 2. Get Chrome Web Store API Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Chrome Web Store API:
    - Navigate to "APIs & Services" > "Library"
    - Search for "Chrome Web Store API"
    - Click "Enable"

4. Create OAuth 2.0 credentials:
    - Go to "APIs & Services" > "Credentials"
    - Click "Create Credentials" > "OAuth client ID"
    - Choose "Desktop app" as the application type
    - Name it something like "Viceroy Extension Publisher"
    - Download the credentials JSON file

5. Generate a refresh token using Google OAuth 2.0 Playground:

    **Option A: Using OAuth 2.0 Playground (Recommended)**

    a. Go to
    [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)

    b. Click the **Settings** gear icon (⚙️) in the top right

    c. Check **"Use your own OAuth credentials"**

    d. Enter your OAuth Client ID and Client Secret from step 4

    e. Close the settings

    f. In the left sidebar under **"Select & authorize APIs"**, scroll down and
    enter:

    ```
    https://www.googleapis.com/auth/chromewebstore
    ```

    g. Click **"Authorize APIs"**

    h. Sign in with your Google account and grant permissions

    i. Click **"Exchange authorization code for tokens"**

    j. Copy the **"Refresh token"** - this is what you need!

    **Option B: Using chrome-webstore-upload-cli**

    If you prefer the CLI tool:

    ```bash
    # Install the tool
    npm install -g chrome-webstore-upload-cli

    # Generate token (note: no --refresh-token flag, it's automatic)
    chrome-webstore-upload generate-refresh-token \
      --client-id YOUR_CLIENT_ID \
      --client-secret YOUR_CLIENT_SECRET
    ```

    Follow the browser prompts to authorize and get your refresh token.

### 3. Configure GitHub Repository Secret

The automated publishing workflow uses the
[Browser Platform Publisher (BPP)](https://github.com/PlasmoHQ/bpp) action,
which requires a specific format for credentials.

**Important: Create a repository secret (not an environment secret)**

1. Go to your GitHub repository: `https://github.com/YOUR_USERNAME/viceroy`
2. Click **Settings** (in the top navigation bar)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click the green **New repository secret** button
5. Enter the secret details:
    - **Name:** `BPP_KEYS`
    - **Secret:** Paste the JSON structure below

```json
{
    "$schema": "https://raw.githubusercontent.com/PlasmoHQ/bpp/v3/keys.schema.json",
    "chrome": {
        "extId": "YOUR_EXTENSION_ID",
        "clientId": "YOUR_GOOGLE_CLIENT_ID",
        "clientSecret": "YOUR_GOOGLE_CLIENT_SECRET",
        "refreshToken": "YOUR_REFRESH_TOKEN"
    }
}
```

Replace the placeholders:

- `YOUR_EXTENSION_ID`: Your Chrome extension ID (found in the Chrome Web Store
  Developer Dashboard)
- `YOUR_GOOGLE_CLIENT_ID`: From your OAuth credentials
- `YOUR_GOOGLE_CLIENT_SECRET`: From your OAuth credentials
- `YOUR_REFRESH_TOKEN`: From the chrome-webstore-upload-cli command above

6. Click **Add secret**

The secret is now available to your GitHub Actions workflows as
`secrets.BPP_KEYS`.

## Publishing Process

### Automated Publishing (Recommended)

The extension is automatically published when you push a git tag:

1. **Release a new version (one command does everything):**

    ```bash
    # For a patch release (1.0.0 -> 1.0.1)
    npm run release:patch

    # For a minor release (1.0.0 -> 1.1.0)
    npm run release:minor

    # For a major release (1.0.0 -> 2.0.0)
    npm run release:major
    ```

    This script will automatically:
    - Check that your working directory is clean
    - Update `package.json` and `manifest.json` versions
    - Commit the changes
    - Create a git tag (e.g., `v1.0.1`)
    - Push to remote with tags

2. **Monitor the workflow:**
    - Go to the "Actions" tab in your GitHub repository
    - Watch the "Publish Chrome Extension" workflow
    - The workflow will run these quality checks:
        - Linting with ESLint
        - Type checking with TypeScript
        - Building the extension
    - If all checks pass, the extension will be uploaded to the Chrome Web Store
    - A GitHub release will be created with the extension ZIP file

### Manual Publishing

If you need to publish manually:

1. **Build the extension:**

    ```bash
    npm run build
    ```

2. **Upload to Chrome Web Store:**
    - Go to the
      [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
    - Select your extension
    - Click "Upload new package"
    - Upload the `viceroy.zip` file
    - Fill in any required information
    - Submit for review

### Manual Workflow Trigger

You can also trigger the publishing workflow manually from GitHub:

1. Go to the "Actions" tab in your repository
2. Select "Publish Chrome Extension"
3. Click "Run workflow"
4. Enter the version number (e.g., 1.0.1)
5. Click "Run workflow"

## Version Management

The project maintains version numbers in two places:

- `package.json` - NPM package version
- `manifest.json` - Chrome extension version

The version bump scripts automatically update both files to keep them in sync.

## Continuous Integration

Every push to `main` and every pull request triggers the CI workflow, which:

- Runs the linter
- Performs type checking
- Builds the extension
- Uploads the build artifact for verification

This ensures that the code is always in a publishable state.

## Troubleshooting

### Publishing Fails

- **Invalid credentials**: Verify that your `BPP_KEYS` secret is properly
  formatted
- **Extension not found**: Ensure your extension ID is correct
- **API not enabled**: Make sure the Chrome Web Store API is enabled in Google
  Cloud Console
- **Token expired**: You may need to generate a new refresh token

### Build Fails

- **Type errors**: Run `npm run ts` locally to check for TypeScript errors
- **Lint errors**: Run `npm run lint` locally and fix any issues
- **Dependencies**: Try deleting `node_modules` and running `npm install` again

### Version Conflicts

If you accidentally create a version conflict:

1. Manually edit both `package.json` and `manifest.json` to have the same
   version
2. Delete any incorrect git tags: `git tag -d vX.Y.Z`
3. Force push to remove remote tags: `git push origin :refs/tags/vX.Y.Z`

## Security

### GitHub Actions SHA Pinning

All GitHub Actions in this project are pinned to specific commit SHAs for
security. This prevents potential supply chain attacks where an action
maintainer could update a tag to point to malicious code.

**Keeping Actions Up to Date:**

1. **Dependabot (Automatic):** The project includes a `.github/dependabot.yml`
   configuration that automatically creates PRs when action updates are
   available.

2. **Manual Update Script:** Run the provided script to check for updates:

    ```bash
    bash scripts/update-action-shas.sh
    ```

3. **Using pin-github-action tool:**
    ```bash
    npm install -g pin-github-action
    pin-github-action .github/workflows/
    ```

## Resources

- [Chrome Web Store Developer Documentation](https://developer.chrome.com/docs/webstore/)
- [Browser Platform Publisher (BPP)](https://github.com/PlasmoHQ/bpp)
- [Chrome Web Store API](https://developer.chrome.com/docs/webstore/api/)
- [Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [GitHub Actions Security Best Practices](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions#using-third-party-actions)
