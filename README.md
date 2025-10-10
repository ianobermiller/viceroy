# Viceroy Chrome Extension

A Chrome extension for enhancing the Monarch app (https://monarch-app.aop.com/)
with React, TypeScript, and Tailwind CSS v4.

## Features

- 🤖 Console logging on Monarch app pages
- 👑 Visual indicator when extension is active
- ⚛️ React-based popup UI with Tailwind CSS v4 styling
- 📦 Built with Vite for fast development and building
- 🎨 Modern, responsive design

## Development Setup

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone or download this repository
2. Install dependencies:
    ```bash
    npm install
    ```

### Development

1. Start the development build:

    ```bash
    npm run dev
    ```

2. Build for production:

    ```bash
    npm run build
    ```

3. Format code with Prettier:
    ```bash
    npm run format
    ```

### Loading in Chrome

1. Build the extension:

    ```bash
    npm run build
    ```

2. Open Chrome and go to `chrome://extensions/`

3. Enable "Developer mode" in the top right

4. Click "Load unpacked" and select the project root directory

5. The extension should now appear in your extensions list

6. Navigate to https://monarch-app.aop.com/ to see the extension in action

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Maximum strictness with shared configuration
- **Tailwind CSS v4** - Styling with CSS-only config
- **Vite 7** - Build tool and dev server
- **Prettier** - Code formatting
- **Chrome Extensions Manifest V3** - Extension platform

## Project Structure

```
src/
├── components/     # React components
│   └── App.tsx    # Main popup component
├── content/       # Content scripts
│   └── content.ts # Runs on Monarch app pages
└── popup/         # Extension popup
    ├── popup.html # Popup HTML template
    ├── popup.tsx  # Popup entry point
    └── popup.css  # Tailwind CSS imports
```

## Notes

- The extension currently runs only on `https://monarch-app.aop.com/*`
- Icons are placeholder - add actual icon files to the `icons/` directory
- The content script adds a visual indicator and logs to the console
- The popup provides a clean UI for managing extension features
- [Insect icons](https://www.flaticon.com/free-icons/insect) created by
  Freepik - Flaticon

## Publishing

This extension uses automated publishing via GitHub Actions. See
[PUBLISHING.md](PUBLISHING.md) for detailed setup instructions.

Quick release process:

```bash
# Release a new version (bumps, commits, tags, and pushes automatically)
npm run release:patch
```

The GitHub Actions workflow will automatically:

- Run linting and type checking
- Build the extension
- Publish to the Chrome Web Store (only if all checks pass)

## License

MIT
