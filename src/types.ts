import * as vscode from 'vscode';

export interface ProjectItem extends vscode.QuickPickItem {
  path: string;
} 