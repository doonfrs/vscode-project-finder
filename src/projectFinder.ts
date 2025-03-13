import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ProjectItem } from './types';
import { getWebviewContent } from './webview/projectFinderWebview';

export class ProjectFinderProvider {
  private context: vscode.ExtensionContext;
  private isNewWindowMode = false;
  private projectFolders: string[] = [];
  private projectIndicators: string[] = [];
  private enableProjectIndicators = false;
  private hasLoadedFolders = false;
  private hasLoadedIndicators = false;
  private useNativeUI = false; // Changed from useCustomUI to useNativeUI (inverted logic)
  private favorites: { [key: string]: boolean } = {};
  private activePanel: vscode.WebviewPanel | undefined;
  private ignoredFolders: string[] = [];

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.loadProjectFolders();
    this.loadProjectIndicators();
    this.loadUIPreference();
    this.loadFavorites();
    this.loadIgnoredFolders();
  }

  /**
   * Toggle new window mode
   */
  public toggleNewWindowMode(): void {
    this.isNewWindowMode = !this.isNewWindowMode;
    console.log(`New window mode ${this.isNewWindowMode ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if new window mode is enabled
   */
  public isNewWindowModeEnabled(): boolean {
    return this.isNewWindowMode;
  }

  /**
   * Load UI preference from settings
   */
  private loadUIPreference(): void {
    const config = vscode.workspace.getConfiguration('projectFinder');
    this.useNativeUI = config.get<boolean>('useNativeUI', false);
    console.log(`Using native UI: ${this.useNativeUI}`);
  }

  /**
   * Load favorites from global state
   */
  private loadFavorites(): void {
    this.favorites = this.context.globalState.get<{ [key: string]: boolean }>('projectFinderFavorites', {});
    console.log(`Loaded ${Object.keys(this.favorites).length} favorite projects`);
  }

  /**
   * Save favorites to global state
   */
  private saveFavorites(): void {
    this.context.globalState.update('projectFinderFavorites', this.favorites);
    console.log(`Saved ${Object.keys(this.favorites).length} favorite projects`);
  }

  /**
   * Update favorites from WebView
   */
  public updateFavorites(favorites: { [key: string]: boolean }): void {
    this.favorites = favorites;
    this.saveFavorites();
    console.log(`Updated favorites from WebView: ${Object.keys(this.favorites).length} items`);
  }

  /**
   * Load project folders from settings
   */
  private loadProjectFolders(): void {
    // Get configuration from all scopes
    const config = vscode.workspace.getConfiguration('projectFinder');
    const oldFolders = [...this.projectFolders];
    this.projectFolders = config.get<string[]>('projectFolders', []);
    this.hasLoadedFolders = true;
    
    console.log(`Loaded ${this.projectFolders.length} project folders from settings`);
    console.log('Project folders:', this.projectFolders);
    
    // Log if folders changed
    const foldersChanged = JSON.stringify(oldFolders) !== JSON.stringify(this.projectFolders);
    console.log('Folders changed:', foldersChanged);
  }

  /**
   * Load project indicators from settings
   */
  private loadProjectIndicators(): void {
    const config = vscode.workspace.getConfiguration('projectFinder');
    const defaultIndicators = [
      '.git',
      'package.json',
      '.vscode',
      'pom.xml',
      'build.gradle',
      'Cargo.toml',
      'go.mod'
    ];
    
    // Load the enable flag
    const oldEnableIndicators = this.enableProjectIndicators;
    this.enableProjectIndicators = config.get<boolean>('enableProjectIndicators', false);
    
    // Load the indicators
    const oldIndicators = [...this.projectIndicators];
    this.projectIndicators = config.get<string[]>('projectIndicators', defaultIndicators);
    this.hasLoadedIndicators = true;
    
    console.log(`Project indicators enabled: ${this.enableProjectIndicators}`);
    console.log(`Loaded ${this.projectIndicators.length} project indicators from settings`);
    console.log('Project indicators:', this.projectIndicators);
    
    // Log if indicators changed
    const indicatorsChanged = JSON.stringify(oldIndicators) !== JSON.stringify(this.projectIndicators);
    const enableChanged = oldEnableIndicators !== this.enableProjectIndicators;
    console.log('Indicators changed:', indicatorsChanged);
    console.log('Enable flag changed:', enableChanged);
  }

  /**
   * Load ignored folders from settings
   */
  private loadIgnoredFolders(): void {
    const config = vscode.workspace.getConfiguration('projectFinder');
    const defaultIgnoredFolders = [
      '$RECYCLE.BIN',
      'System Volume Information',
      'Thumbs.db',
      '.Trash',
      '.DS_Store',
      'node_modules',
      '.git',
      '.idea',
      '.vscode',
      'dist',
      'build',
      'target',
      'bin',
      'obj',
      'out',
      'tmp',
      'temp',
      'logs',
      'coverage',
      '.next',
      '.nuxt'
    ];
    
    this.ignoredFolders = config.get<string[]>('ignoredFolders', defaultIgnoredFolders);
    console.log(`Loaded ${this.ignoredFolders.length} ignored folders from settings`);
  }

  /**
   * Refresh project folders and indicators from settings
   */
  public refreshProjectFolders(): void {
    console.log('Refreshing project folders and indicators...');
    
    // Force reload configuration from disk
    vscode.workspace.getConfiguration('projectFinder', null).update('', undefined, vscode.ConfigurationTarget.Global)
      .then(() => {
        this.loadProjectFolders();
        this.loadProjectIndicators();
        this.loadUIPreference();
        this.loadIgnoredFolders();
        console.log('Project folders and indicators refreshed successfully');
      }, (error) => {
        console.error('Error refreshing project settings:', error);
      });
  }

  /**
   * Show the project finder UI
   */
  public async showProjectFinder() {
    // Reload UI preference in case it changed
    this.loadUIPreference();
    
    // Use the appropriate UI based on settings
    if (!this.useNativeUI) {
      await this.showCustomProjectPanel();
    } else {
      await this.showQuickPick();
    }
  }

  /**
   * Show the quick pick dialog with project options
   */
  public async showQuickPick() {
    // Make sure we have the latest settings
    if (!this.hasLoadedFolders) {
      this.loadProjectFolders();
    }
    
    if (!this.hasLoadedIndicators) {
      this.loadProjectIndicators();
    }
    
    const projects = await this.getProjects();
    
    if (projects.length === 0) {
      vscode.window.showInformationMessage('No projects found. Please configure project folders in settings.');
      this.openSettings();
      return;
    }

    // Create QuickPick instead of using showQuickPick to handle keyboard events
    const quickPick = vscode.window.createQuickPick<ProjectItem>();
    quickPick.items = projects;
    quickPick.placeholder = 'Select a project to open (Press Enter or Shift+Enter for new window)';
    quickPick.matchOnDescription = true;
    quickPick.matchOnDetail = true;

    // Track if Shift key is pressed
    let isShiftPressed = false;

    // Create a status bar item to show instructions
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    statusBarItem.text = this.isNewWindowMode 
      ? "$(split-horizontal) NEW WINDOW MODE" 
      : "$(window) SAME WINDOW MODE (Hold Shift+Enter for new window)";
    statusBarItem.show();

    // Create a disposable for the key event detection
    const keyDetectionDisposable = vscode.commands.registerCommand('type', (args) => {
      // Check if Shift key is pressed
      if (args.source && args.source.shift) {
        isShiftPressed = true;
        statusBarItem.text = "$(split-horizontal) SHIFT PRESSED - Will open in new window";
        return args;
      } else {
        isShiftPressed = false;
        statusBarItem.text = this.isNewWindowMode 
          ? "$(split-horizontal) NEW WINDOW MODE" 
          : "$(window) SAME WINDOW MODE (Hold Shift+Enter for new window)";
        return args;
      }
    });

    // Handle selection
    quickPick.onDidAccept(() => {
      const selectedProject = quickPick.selectedItems[0];
      if (selectedProject) {
        // Use either the mode setting or the Shift key state
        const openInNewWindow = this.isNewWindowMode || isShiftPressed;
        this.openProject(selectedProject.path, openInNewWindow);
        
        // Show a message indicating how the project was opened
        vscode.window.showInformationMessage(
          `Opening ${path.basename(selectedProject.path)} in ${openInNewWindow ? 'new' : 'same'} window`
        );
        
        quickPick.hide();
      }
    });

    // Add a button for new window option
    const newWindowButton = {
      iconPath: new vscode.ThemeIcon('split-horizontal'),
      tooltip: 'Toggle New Window Mode'
    };
    quickPick.buttons = [newWindowButton];

    // Handle button click
    quickPick.onDidTriggerButton(button => {
      if (button === newWindowButton) {
        this.isNewWindowMode = !this.isNewWindowMode;
        statusBarItem.text = this.isNewWindowMode 
          ? "$(split-horizontal) NEW WINDOW MODE" 
          : "$(window) SAME WINDOW MODE (Hold Shift+Enter for new window)";
        quickPick.placeholder = this.isNewWindowMode 
          ? 'Select a project to open in NEW WINDOW' 
          : 'Select a project to open (Press Enter or Shift+Enter for new window)';
      }
    });

    // Clean up when quick pick is closed
    quickPick.onDidHide(() => {
      statusBarItem.dispose();
      keyDetectionDisposable.dispose();
    });

    quickPick.show();
  }

  /**
   * Convert Git Bash style paths to Windows paths
   * e.g., /d/ -> D:/
   */
  private convertGitBashPath(folderPath: string): string {
    // Only process on Windows
    if (os.platform() !== 'win32') {
      return folderPath;
    }

    // Check if it's a Git Bash style path (starts with / followed by a single letter and /)
    const gitBashPathRegex = /^\/([a-zA-Z])\/(.*)$/;
    const match = folderPath.match(gitBashPathRegex);
    
    if (match) {
      const driveLetter = match[1].toUpperCase();
      const remainingPath = match[2];
      return `${driveLetter}:/${remainingPath}`;
    }
    
    return folderPath;
  }

  /**
   * Expand tilde in paths to the user's home directory
   * e.g., ~/projects -> /home/username/projects
   */
  private expandTildePath(folderPath: string): string {
    if (folderPath.startsWith('~')) {
      const homedir = os.homedir();
      return path.join(homedir, folderPath.substring(1));
    }
    return folderPath;
  }

  /**
   * Get list of projects from configured folders
   */
  private async getProjects(): Promise<ProjectItem[]> {
    const projects: ProjectItem[] = [];

    for (let folder of this.projectFolders) {
      // Expand tilde in paths
      folder = this.expandTildePath(folder);
      
      // Convert Git Bash style paths to Windows paths
      folder = this.convertGitBashPath(folder);
      
      console.log(`Checking folder: ${folder}`);
      
      // Check if the folder path ends with /* (wildcard pattern)
      const isWildcardPath = folder.endsWith('/*');
      
      // Remove the /* suffix if present
      const actualFolderPath = isWildcardPath ? folder.slice(0, -2) : folder;
      
      if (fs.existsSync(actualFolderPath)) {
        try {
          if (isWildcardPath) {
            // For wildcard paths, add all subfolders as projects
            const entries = fs.readdirSync(actualFolderPath, { withFileTypes: true });
            
            for (const entry of entries) {
              if (entry.isDirectory()) {
                const projectPath = path.join(actualFolderPath, entry.name);
                
                // Skip ignored folders
                if (this.shouldIgnoreFolder(entry.name)) {
                  console.log(`Skipping ignored folder: ${entry.name}`);
                  continue;
                }
                
                // Check if it's a valid project (has package.json, .git, etc.)
                // Only check if project indicators are enabled
                const isValidProject = !this.enableProjectIndicators || this.isValidProject(projectPath);
                
                if (isValidProject) {
                  projects.push({
                    label: entry.name,
                    description: projectPath,
                    path: projectPath
                  });
                }
              }
            }
          } else {
            // For regular paths, add the folder itself as a project
            const folderName = path.basename(actualFolderPath);
            
            // Skip ignored folders
            if (this.shouldIgnoreFolder(folderName)) {
              console.log(`Skipping ignored folder: ${folderName}`);
              continue;
            }
            
            projects.push({
              label: folderName,
              description: actualFolderPath,
              path: actualFolderPath
            });
          }
        } catch (error) {
          console.error(`Error reading directory ${actualFolderPath}:`, error);
        }
      } else {
        console.warn(`Folder does not exist: ${actualFolderPath}`);
      }
    }

    // Sort projects: favorites first, then alphabetically
    return projects.sort((a, b) => {
      const aFav = this.favorites[a.path] ? 1 : 0;
      const bFav = this.favorites[b.path] ? 1 : 0;
      
      // First sort by favorite status
      if (aFav !== bFav) {
        return bFav - aFav;
      }
      
      // Then sort alphabetically
      return a.label.localeCompare(b.label);
    });
  }

  /**
   * Check if a folder should be ignored
   */
  private shouldIgnoreFolder(folderName: string): boolean {
    return this.ignoredFolders.some(ignored => {
      // Case-insensitive comparison for Windows
      if (os.platform() === 'win32') {
        return folderName.toLowerCase() === ignored.toLowerCase();
      }
      // Case-sensitive comparison for Unix-like systems
      return folderName === ignored;
    });
  }

  /**
   * Check if a directory is a valid project
   */
  private isValidProject(projectPath: string): boolean {
    // Use the configurable project indicators
    return this.projectIndicators.some(indicator => 
      fs.existsSync(path.join(projectPath, indicator))
    );
  }

  /**
   * Open the selected project in VS Code
   */
  private openProject(projectPath: string, newWindow = false) {
    const uri = vscode.Uri.file(projectPath);
    vscode.commands.executeCommand('vscode.openFolder', uri, { forceNewWindow: newWindow });
  }

  /**
   * Open the extension settings
   */
  private openSettings() {
    vscode.commands.executeCommand(
      'workbench.action.openSettings',
      'projectFinder.projectFolders'
    );
  }

  /**
   * Show a custom WebView panel for project selection as a popup dialog
   */
  public async showCustomProjectPanel() {
    // If there's already an active panel, just reveal it instead of creating a new one
    if (this.activePanel) {
      this.activePanel.reveal(vscode.ViewColumn.Active, true);
      return;
    }

    // Make sure we have the latest settings
    if (!this.hasLoadedFolders) {
      this.loadProjectFolders();
    }
    
    if (!this.hasLoadedIndicators) {
      this.loadProjectIndicators();
    }
    
    const projects = await this.getProjects();
    
    if (projects.length === 0) {
      vscode.window.showInformationMessage('No projects found. Please configure project folders in settings.');
      this.openSettings();
      return;
    }

    // Create and show a new webview panel as a popup dialog
    const panel = vscode.window.createWebviewPanel(
      'projectFinderPanel', // Identifies the type of the webview
      'Project Finder', // Title displayed in the UI
      {
        viewColumn: vscode.ViewColumn.Active, // Show in the active editor column
        preserveFocus: true // Keep focus on the current editor
      },
      {
        enableScripts: true, // Enable JavaScript in the webview
        localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'media')],
        retainContextWhenHidden: true // Keep the webview's context when hidden
      }
    );

    // Store the active panel reference
    this.activePanel = panel;

    // Make it look more like a dialog
    panel.webview.options = {
      enableScripts: true,
      enableCommandUris: true
    };

    // Get VS Code theme colors for native look and feel
    const isLightTheme = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Light;

    // Set the webview's initial HTML content
    panel.webview.html = getWebviewContent(
      projects, 
      this.isNewWindowMode, 
      isLightTheme, 
      this.context.extensionUri,
      panel.webview
    );

    // Handle messages from the webview
    panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'openProject':
            this.openProject(message.projectPath, message.newWindow);
            panel.dispose(); // Close the panel after selection
            return;
          case 'toggleNewWindowMode':
            this.isNewWindowMode = !this.isNewWindowMode;
            // Send updated state back to webview
            panel.webview.postMessage({ 
              command: 'updateNewWindowMode', 
              isNewWindowMode: this.isNewWindowMode 
            });
            return;
          case 'updateFavorites':
            this.updateFavorites(message.favorites);
            return;
          case 'close':
            panel.dispose(); // Close the panel
            return;
        }
      },
      undefined,
      this.context.subscriptions
    );

    // Clear the active panel reference when the panel is disposed
    panel.onDidDispose(() => {
      this.activePanel = undefined;
    }, null, this.context.subscriptions);
  }
} 