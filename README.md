# Project Finder

A Visual Studio Code extension that allows you to quickly find and open your projects using a popup dialog triggered by keyboard shortcuts.

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-support-yellow.svg?style=flat-square)](https://buymeacoffee.com/doonfrs)

![Project Finder Demo](images/project-finder-demo.gif)

## Features

- Quick access to your projects with simple keyboard shortcuts (Shift+Space or Ctrl+Shift+Space)
- Configurable list of project folders to search
- Automatic detection of valid projects (looks for .git, package.json, .vscode, etc.)
- Seamless integration with VS Code's folder opening functionality
- Open projects in the same window or a new window (using Shift+Enter)

## Support

If you find this extension helpful, consider buying me a coffee:

[![Buy Me A Coffee](https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png)](https://buymeacoffee.com/doonfrs)

## Installation

1. Launch VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Project Finder"
4. Click Install

## Configuration

Before using Project Finder, you need to configure the folders where your projects are located:

1. Open VS Code Settings (File > Preferences > Settings)
2. Search for "Project Finder"
3. Add your project folders to the "Project Finder: Project Folders" setting

Example configuration:

```json
"projectFinder.projectFolders": [
  "C:\\Users\\YourName\\Projects",
  "D:\\Work\\Repositories"
]
```

## Usage

1. Press Shift+Space or Ctrl+Shift+Space anywhere in VS Code
2. Select a project from the dropdown list
3. Press Enter to open in the same window, or Shift+Enter to open in a new window
4. Alternatively, click the split-window button to toggle "New Window Mode"

## How It Works

Project Finder scans the configured folders for valid projects. A folder is considered a valid project if it contains any of the following:

- .git directory
- package.json file
- .vscode directory
- pom.xml file
- build.gradle file
- Cargo.toml file
- go.mod file

## Requirements

- Visual Studio Code version 1.60.0 or higher

## Extension Settings

- `projectFinder.projectFolders`: Array of folder paths to search for projects

## Known Issues

None at the moment.

## Release Notes

### 0.0.1

Initial release of Project Finder

---

## For Development

### Building the Extension

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run watch` to compile in watch mode
4. Press F5 to launch the extension in debug mode

### Publishing

Follow the [VS Code Extension Publishing](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) guide.

Your support helps maintain and improve this extension!
