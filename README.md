# Project Finder

A Visual Studio Code extension that allows you to quickly find and open your projects using a popup dialog triggered by keyboard shortcuts.

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-support-yellow.svg?style=flat-square)](https://buymeacoffee.com/doonfrs)

![Project Finder Demo](images/project-finder-demo.gif)

## 🚀 The Missing Project Finder for VS Code

Ever felt frustrated trying to find that project you worked on last week? Tired of navigating through File > Open Folder every time?

**Project Finder** solves the problem VS Code never addressed - quick access to ALL your projects with just a keyboard shortcut!

- **Lightning Fast** - Access any project in milliseconds with Shift+Space
- **Smart Detection** - Automatically identifies real projects (no more digging through random folders)
- **Workflow Optimized** - Stay in your coding flow without interruptions
- **Cross-Platform** - Works on Windows, macOS, and Linux with the same experience

Stop wasting time hunting for projects and get back to what matters - writing great code!

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
  "D:\\Work\\Repositories",
  "D:\\Work\\Repositories/*"
]
```

For Linux/macOS:

```json
"projectFinder.projectFolders": [
  "/home/username/projects",
  "/var/www/html",
  "/opt/development/*"
]
```

> **Note:** There are two ways to specify project folders:
>
> 1. Regular path (e.g., `/home/username/projects`) - The folder itself will be added as a single project
> 2. Wildcard path (e.g., `/opt/development/*`) - All subfolders will be scanned and added as separate projects
>
> **Windows users:** Git Bash style paths are also supported (e.g., `/c/Users/YourName/Projects`).

## Usage

1. Press Shift+Space or Ctrl+Shift+Space anywhere in VS Code
2. Select a project from the dropdown list
3. Press Enter to open in the same window, or Shift+Enter to open in a new window
4. Alternatively, click the split-window button to toggle "New Window Mode"

## 💡 Pro Tips

### Organize Your Projects Like a Pro

- **Development Hub**: Create a central development folder with `/*` wildcard
  ```json
  "projectFinder.projectFolders": ["/home/username/dev/*"]
  ```

- **Mixed Approach**: Combine specific projects with wildcard directories
  ```json
  "projectFinder.projectFolders": [
    "/home/username/dev/*",           // All projects in dev folder
    "/home/username/work/client-x",   // Specific client project
    "/var/www/html/*"                 // All web projects
  ]
  ```

- **Git Bash on Windows**: Use Unix-style paths for consistency across platforms
  ```json
  "projectFinder.projectFolders": [
    "/c/Users/YourName/Projects/*",
    "/d/work/repositories/*"
  ]
  ```

### Keyboard Ninja Workflow

1. Press `Shift+Space` to open Project Finder
2. Type a few characters to filter projects
3. Use arrow keys to navigate
4. Press `Enter` to open in same window
5. Hold `Shift` while pressing `Enter` to open in new window
6. Press `Alt+N` to toggle New Window Mode

## How It Works

Project Finder scans the configured folders for valid projects. A folder is considered a valid project if it contains any of the following:

- .git directory
- package.json file
- .vscode directory
- pom.xml file
- build.gradle file
- Cargo.toml file
- go.mod file

The extension supports two ways to specify project folders:

1. Regular paths - The folder itself will be added as a single project
2. Wildcard paths (ending with `/*`) - All subfolders will be scanned and added as separate projects

On Windows, Git Bash style paths (e.g., `/c/Users/YourName/Projects`) are automatically converted to Windows paths (e.g., `C:/Users/YourName/Projects`).

## ⚡ Why Project Finder?

| Feature | Project Finder | VS Code Built-in | Other Extensions |
|---------|---------------|------------------|------------------|
| Keyboard-first approach | ✅ | ❌ | ⚠️ Limited |
| Smart project detection | ✅ | ❌ | ⚠️ Some |
| Wildcard folder support | ✅ | ❌ | ❌ |
| Git Bash path support | ✅ | ❌ | ❌ |
| New window toggle | ✅ | ⚠️ Requires extra steps | ⚠️ Limited |
| Shift+Enter shortcut | ✅ | ❌ | ❌ |
| Lightweight | ✅ | ✅ | ⚠️ Varies |

Project Finder was built by developers who were tired of the friction in the standard VS Code workflow. We wanted something that felt like it should have been built into VS Code from the beginning.

## Requirements

- Visual Studio Code version 1.75.0 or higher

## Extension Settings

- `projectFinder.projectFolders`: Array of folder paths to search for projects

## Known Issues

None at the moment.

## Release Notes

### 0.0.2

- Added support for wildcard paths (e.g., `/home/username/projects/*`)
- Added support for Git Bash style paths on Windows
- Added Shift+Enter functionality to open projects in a new window
- Added Ctrl+Shift+Space as an alternative keyboard shortcut
- Updated minimum VS Code version to 1.75.0 for improved extension activation

### 0.0.1

Initial release of Project Finder

---

## 👥 Community & Contributions

Project Finder is an open-source project that thrives on community feedback and contributions!

### Ways to Contribute

- **Star the Repository**: Show your support and help others discover the extension
- **Report Issues**: Found a bug? Let us know on the GitHub issues page
- **Suggest Features**: Have ideas for improvements? We'd love to hear them
- **Submit Pull Requests**: Code contributions are always welcome
- **Share with Friends**: Help spread the word about Project Finder

Join our growing community of developers who value efficiency and productivity in their VS Code workflow!

## For Development

### Building the Extension

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run watch` to compile in watch mode
4. Press F5 to launch the extension in debug mode

### Publishing

Follow the [VS Code Extension Publishing](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) guide.

Your support helps maintain and improve this extension!
