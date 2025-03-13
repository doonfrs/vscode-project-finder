import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface ProjectItem extends vscode.QuickPickItem {
  path: string;
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

    const selectedProject = await vscode.window.showQuickPick(projects, {
      placeHolder: 'Select a project to open',
      matchOnDescription: true,
      matchOnDetail: true
    });

    if (selectedProject) {
      this.openProject(selectedProject.path);
    }
  }

  /**
   * Get list of projects from configured folders
   */
  private async getProjects(): Promise<ProjectItem[]> {
    const config = vscode.workspace.getConfiguration('projectFinder');
    const projectFolders = config.get<string[]>('projectFolders', []);
    
    const projects: ProjectItem[] = [];

    for (const folder of projectFolders) {
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
  private openProject(projectPath: string) {
    const uri = vscode.Uri.file(projectPath);
    vscode.commands.executeCommand('vscode.openFolder', uri);
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