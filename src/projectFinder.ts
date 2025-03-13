import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface ProjectItem extends vscode.QuickPickItem {
  path: string;
}

interface ShiftState {
  isPressed: boolean;
}

export class ProjectFinderProvider {
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  /**
   * Show the quick pick dialog with project options
   */
  public async showQuickPick() {
    const projects = await this.getProjects();
    
    if (projects.length === 0) {
      vscode.window.showInformationMessage('No projects found. Please configure project folders in settings.');
      this.openSettings();
      return;
    }

    // Create QuickPick instead of using showQuickPick to handle keyboard events
    const quickPick = vscode.window.createQuickPick<ProjectItem>();
    quickPick.items = projects;
    quickPick.placeholder = 'Select a project to open (Shift+Enter to open in new window)';
    quickPick.matchOnDescription = true;
    quickPick.matchOnDetail = true;

    // Track shift key state
    const shiftState: ShiftState = { isPressed: false };

    // Handle selection
    quickPick.onDidAccept(() => {
      const selectedProject = quickPick.selectedItems[0];
      if (selectedProject) {
        this.openProject(selectedProject.path, shiftState.isPressed);
        quickPick.hide();
      }
    });

    // Add a button for new window option
    const newWindowButton = {
      iconPath: new vscode.ThemeIcon('split-horizontal'),
      tooltip: 'Open in New Window (Shift+Enter)'
    };
    quickPick.buttons = [newWindowButton];

    // Handle button click
    quickPick.onDidTriggerButton(button => {
      if (button === newWindowButton) {
        shiftState.isPressed = !shiftState.isPressed;
        quickPick.placeholder = shiftState.isPressed 
          ? 'Select a project to open in NEW WINDOW' 
          : 'Select a project to open (Shift+Enter to open in new window)';
      }
    });

    // Create a status bar item to show instructions
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    statusBarItem.text = "$(keyboard) Hold Shift while pressing Enter to open in new window";
    statusBarItem.show();

    // Clean up when quick pick is closed
    quickPick.onDidHide(() => {
      statusBarItem.dispose();
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
    const config = vscode.workspace.getConfiguration('projectFinder');
    const projectFolders = config.get<string[]>('projectFolders', []);
    
    const projects: ProjectItem[] = [];

    for (let folder of projectFolders) {
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
              const isValidProject = this.isValidProject(projectPath);
              
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
    // Consider it a project if it has any of these files/folders
    const projectIndicators = [
      '.git',
      'package.json',
      '.vscode',
      'pom.xml',
      'build.gradle',
      'Cargo.toml',
      'go.mod'
    ];

    return projectIndicators.some(indicator => 
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