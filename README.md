# Veil - Hide Distracting Elements

![Veil Extension](screenshot.png)

A Chrome extension that helps you create a distraction-free browsing experience by hiding unwanted elements on any website.

## Features

- **Visual Element Picker**: Click to select and hide any element on a webpage
- **Custom Presets**: Save your hiding preferences for specific websites
- **Side Panel Interface**: Easy-to-use interface accessible from the browser toolbar
- **Persistent Storage**: Your preferences are saved and automatically applied
- **Universal Compatibility**: Works on all websites with `<all_urls>` permission

## Installation

### From Source

1. Clone this repository:
```bash
git clone <repository-url>
cd veil-hide-distracting-elements
```

2. Install dependencies:
```bash
pnpm install
```

3. Build the extension:
```bash
# On Linux/Mac
pnpm run build

# On Windows
pnpm run build:win
```

4. Load the extension in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder from this project

## Usage

1. Click the Veil extension icon in your browser toolbar to open the side panel
2. Navigate to any website
3. Use the element picker to select elements you want to hide
4. Your preferences are automatically saved for each website

## Development

### Project Structure

```
veil-hide-distracting-elements/
├── background/         # Background service worker
├── content/           # Content scripts and styles
├── popup/             # Side panel UI
├── shared/            # Shared utilities and constants
├── assets/            # Icons and images
├── scripts/           # Build scripts
├── tests/             # Test files
└── manifest.json      # Extension manifest
```

### Running Tests

```bash
# Run tests once
pnpm test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:coverage
```

### Building

```bash
# Build for distribution
pnpm run build        # Linux/Mac
pnpm run build:win    # Windows
```

The built extension will be in the `dist` directory.

## Tech Stack

- **Manifest Version**: 3 (Chrome Extension)
- **Testing**: Jest with jsdom
- **Package Manager**: pnpm
- **Build Tools**: Custom bash/PowerShell scripts

## Permissions

- `storage`: Save user preferences
- `activeTab`: Access current tab information
- `scripting`: Inject content scripts
- `sidePanel`: Display side panel interface
- `<all_urls>`: Work on all websites

## Documentation

- [Privacy Policy](docs/PRIVACY.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## License

See LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
