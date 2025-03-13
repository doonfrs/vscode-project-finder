import * as vscode from 'vscode';
import { ProjectFinderProvider } from './projectFinder';

export function activate(context: vscode.ExtensionContext) {
  console.log('Project Finder extension is now active');

  // Create a new instance of the project finder provider
  const projectFinderProvider = new ProjectFinderProvider(context);

  // Register the command that opens the project finder
  const disposable = vscode.commands.registerCommand('project-finder.openProjectFinder', () => {
    console.log('Project Finder command triggered');
    projectFinderProvider.showQuickPick();
  });

  // Register the command to toggle new window mode
  const toggleNewWindowCommand = vscode.commands.registerCommand('project-finder.toggleNewWindowMode', () => {
    console.log('Toggle New Window Mode command triggered');
    projectFinderProvider.toggleNewWindowMode();
    vscode.window.showInformationMessage(`Project Finder: New Window Mode ${projectFinderProvider.isNewWindowModeEnabled() ? 'Enabled' : 'Disabled'}`);
  });

  // Log initial configuration
  const initialConfig = vscode.workspace.getConfiguration('projectFinder');
  const initialFolders = initialConfig.get('projectFolders', []);
  const initialIndicators = initialConfig.get('projectIndicators', []);
  const initialEnableIndicators = initialConfig.get('enableProjectIndicators', false);
  console.log('Initial projectFinder.projectFolders:', initialFolders);
  console.log('Initial projectFinder.projectIndicators:', initialIndicators);
  console.log('Initial projectFinder.enableProjectIndicators:', initialEnableIndicators);

  // Listen for configuration changes with enhanced logging
  const configListener = vscode.workspace.onDidChangeConfiguration(e => {
    console.log('Configuration changed event fired');
    
    // Check if our configuration was affected
    const isAffected = e.affectsConfiguration('projectFinder');
    const isFoldersAffected = e.affectsConfiguration('projectFinder.projectFolders');
    const isIndicatorsAffected = e.affectsConfiguration('projectFinder.projectIndicators');
    const isEnableIndicatorsAffected = e.affectsConfiguration('projectFinder.enableProjectIndicators');
    
    console.log('projectFinder affected:', isAffected);
    console.log('projectFinder.projectFolders affected:', isFoldersAffected);
    console.log('projectFinder.projectIndicators affected:', isIndicatorsAffected);
    console.log('projectFinder.enableProjectIndicators affected:', isEnableIndicatorsAffected);
    
    if (isFoldersAffected || isIndicatorsAffected || isEnableIndicatorsAffected) {
      // Get the updated configuration
      const config = vscode.workspace.getConfiguration('projectFinder');
      
      if (isFoldersAffected) {
        const folders = config.get('projectFolders', []);
        console.log('Updated projectFinder.projectFolders:', folders);
      }
      
      if (isIndicatorsAffected) {
        const indicators = config.get('projectIndicators', []);
        console.log('Updated projectFinder.projectIndicators:', indicators);
      }
      
      if (isEnableIndicatorsAffected) {
        const enableIndicators = config.get('enableProjectIndicators', false);
        console.log('Updated projectFinder.enableProjectIndicators:', enableIndicators);
      }
      
      // Refresh the project folders and indicators
      console.log('Refreshing project settings...');
      projectFinderProvider.refreshProjectFolders();
    }
  });

  // Register a command to manually refresh project folders
  const refreshCommand = vscode.commands.registerCommand('project-finder.refreshProjectFolders', () => {
    console.log('Manual refresh of project settings triggered');
    projectFinderProvider.refreshProjectFolders();
    vscode.window.showInformationMessage('Project Finder: Settings refreshed');
  });

  context.subscriptions.push(disposable, toggleNewWindowCommand, configListener, refreshCommand);
}

// This method is called when the extension is deactivated
export function deactivate() {
  console.log('Project Finder extension is now deactivated');
} 