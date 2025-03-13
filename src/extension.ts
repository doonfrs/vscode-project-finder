import * as vscode from 'vscode';
import { ProjectFinderProvider } from './projectFinder';

export function activate(context: vscode.ExtensionContext) {
  console.log('Project Finder extension is now active');

  // Create a new instance of the project finder provider
  const projectFinderProvider = new ProjectFinderProvider(context);

  // Register the command that opens the project finder
  const disposable = vscode.commands.registerCommand('project-finder.openProjectFinder', () => {
    console.log('Project Finder command triggered');
    projectFinderProvider.showProjectFinder();
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
  const initialUseNativeUI = initialConfig.get('useNativeUI', false);
  console.log('Initial projectFinder.projectFolders:', initialFolders);
  console.log('Initial projectFinder.projectIndicators:', initialIndicators);
  console.log('Initial projectFinder.enableProjectIndicators:', initialEnableIndicators);
  console.log('Initial projectFinder.useNativeUI:', initialUseNativeUI);

  // Listen for configuration changes
  const configListener = vscode.workspace.onDidChangeConfiguration(event => {
    if (event.affectsConfiguration('projectFinder')) {
      console.log('Project Finder configuration changed');
      
      // Get the updated configuration
      const config = vscode.workspace.getConfiguration('projectFinder');
      const folders = config.get('projectFolders', []);
      const indicators = config.get('projectIndicators', []);
      const enableIndicators = config.get('enableProjectIndicators', false);
      const useNativeUI = config.get('useNativeUI', false);
      
      console.log('Updated projectFinder.projectFolders:', folders);
      console.log('Updated projectFinder.projectIndicators:', indicators);
      console.log('Updated projectFinder.enableProjectIndicators:', enableIndicators);
      console.log('Updated projectFinder.useNativeUI:', useNativeUI);
      
      // Refresh the project finder provider
      projectFinderProvider.refreshProjectFolders();
    }
  });

  // Register a command to manually refresh project folders
  const refreshCommand = vscode.commands.registerCommand('project-finder.refreshProjectFolders', () => {
    console.log('Manual refresh of project settings triggered');
    projectFinderProvider.refreshProjectFolders();
    vscode.window.showInformationMessage('Project Finder: Settings refreshed');
  });

  context.subscriptions.push(
    disposable,
    toggleNewWindowCommand, 
    configListener, 
    refreshCommand
  );
}

// This method is called when the extension is deactivated
export function deactivate() {
  console.log('Project Finder extension is now deactivated');
} 