import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface ProjectItem extends vscode.QuickPickItem {
  path: string;
}

export class ProjectFinderProvider {
  private context: vscode.ExtensionContext;
  private isNewWindowMode = false;
  private projectFolders: string[] = [];
  private projectIndicators: string[] = [];
  private enableProjectIndicators = false;
  private hasLoadedFolders = false;
  private hasLoadedIndicators = false;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.loadProjectFolders();
    this.loadProjectIndicators();
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
   * Refresh project folders and indicators from settings
   */
  public refreshProjectFolders(): void {
    console.log('Refreshing project folders and indicators...');
    
    // Force reload configuration from disk
    vscode.workspace.getConfiguration('projectFinder', null).update('', undefined, vscode.ConfigurationTarget.Global)
      .then(() => {
        this.loadProjectFolders();
        this.loadProjectIndicators();
        console.log('Project folders and indicators refreshed successfully');
      }, (error) => {
        console.error('Error refreshing project settings:', error);
      });
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
   * Get list of projects from configured folders
   */
  private async getProjects(): Promise<ProjectItem[]> {
    const projects: ProjectItem[] = [];

    for (let folder of this.projectFolders) {
      // Convert Git Bash style paths to Windows paths
      folder = this.convertGitBashPath(folder);
      
      console.log(`Checking folder: ${folder}`);
      
      if (fs.existsSync(folder)) {
        try {
          const entries = fs.readdirSync(folder, { withFileTypes: true });
          
          for (const entry of entries) {
            if (entry.isDirectory()) {
              const projectPath = path.join(folder, entry.name);
              
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
        } catch (error) {
          console.error(`Error reading directory ${folder}:`, error);
        }
      } else {
        console.warn(`Folder does not exist: ${folder}`);
      }
    }

    return projects;
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
} 