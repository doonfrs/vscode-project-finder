import * as vscode from 'vscode';
import { ProjectFinderProvider } from './projectFinder';

export function activate(context: vscode.ExtensionContext) {
  console.log('Project Finder extension is now active');

  // Create a new instance of the project finder provider
  const projectFinderProvider = new ProjectFinderProvider(context);

  // Register the command that opens the project finder
  let disposable = vscode.commands.registerCommand('project-finder.openProjectFinder', () => {
    projectFinderProvider.showQuickPick();
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {} 