#!/bin/bash

# Script to verify and update GitHub Actions SHA pins
# This script helps you find the correct SHA for each action version

echo "📌 GitHub Actions SHA Pin Helper"
echo "================================="
echo ""

# Function to get the latest commit SHA for a tag/ref
get_sha_for_action() {
    local repo=$1
    local ref=$2

    echo "Looking up $repo@$ref..."

    # Use GitHub API to get the SHA
    local api_url="https://api.github.com/repos/$repo/git/refs/tags/$ref"
    local response=$(curl -s "$api_url")

    # Try to extract SHA from tag object or commit
    local sha=$(echo "$response" | grep -o '"sha": "[^"]*"' | head -1 | cut -d'"' -f4)

    if [ -z "$sha" ]; then
        # Try direct commit lookup
        api_url="https://api.github.com/repos/$repo/commits/$ref"
        response=$(curl -s "$api_url")
        sha=$(echo "$response" | grep -o '"sha": "[^"]*"' | head -1 | cut -d'"' -f4)
    fi

    if [ -n "$sha" ]; then
        echo "  ✓ SHA: $sha"
        echo "  uses: $repo@$sha # $ref"
    else
        echo "  ✗ Could not find SHA for $repo@$ref"
        echo "  Visit: https://github.com/$repo/releases"
    fi
    echo ""
}

echo "Current actions used in workflows:"
echo ""

# List all actions from both workflow files
get_sha_for_action "actions/checkout" "v4.2.2"
get_sha_for_action "actions/setup-node" "v4.1.0"
get_sha_for_action "actions/upload-artifact" "v4.5.0"
get_sha_for_action "PlasmoHQ/bpp" "v3"
get_sha_for_action "softprops/action-gh-release" "v2"

echo ""
echo "💡 Tip: Use the 'pin-github-action' npm package to automate this:"
echo "   npm install -g pin-github-action"
echo "   pin-github-action .github/workflows/"
echo ""
echo "📚 Or configure Dependabot (already set up in .github/dependabot.yml)"
echo "   Dependabot will automatically create PRs to update action versions"

