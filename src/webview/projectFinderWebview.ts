import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ProjectItem } from '../types';
import { detectProjectTechnology } from '../utils/projectUtils';
import { technologyToDeviconClass } from '../utils/iconMapping';

/**
 * Generate the HTML content for the project finder webview
 */
export function getWebviewContent(
    projects: ProjectItem[], 
    isNewWindowMode: boolean, 
    isLightTheme: boolean,
    extensionUri: vscode.Uri,
    webview: vscode.Webview
): string {
    // Read the template file
    const templatePath = path.join(extensionUri.fsPath, 'src', 'webview', 'template.html');
    let templateContent: string;
    
    try {
        templateContent = fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
        console.error('Error reading template file:', error);
        // Fallback to a basic template if file can't be read
        templateContent = getBasicTemplate();
    }
    
    // Get the path to the devicon CSS file - use proper WebView resource URI
    const deviconCssUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'media', 'devicon', 'devicon.min.css')
    );
    
    // Get the path to the custom icons CSS file - use proper WebView resource URI
    const customIconsCssUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'media', 'devicon', 'custom-icons.css')
    );
    
    // Get the path to the devicon font CSS file - use proper WebView resource URI
    const deviconFontCssUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'media', 'devicon', 'devicon-font.css')
    );
    
    // Detect project technologies and create project HTML
    const projectsHtml = projects.map((project, index) => {
        const technology = detectProjectTechnology(project.path);
        const iconClass = technologyToDeviconClass[technology];
        
        return `<div class="project-item" data-index="${index}" data-path="${project.path}">
            <button class="favorite-button" data-path="${project.path}">☆</button>
            <div class="project-icon"><i class="${iconClass}"></i></div>
            <div class="project-name">${project.label}</div>
            <div class="project-path">${project.description}</div>
        </div>`;
    }).join('');
    
    // Define theme colors
    const themeColors = {
        backgroundColor: isLightTheme ? '#f3f3f3' : '#252526',
        foregroundColor: isLightTheme ? '#333333' : '#cccccc',
        itemHoverColor: isLightTheme ? '#e8e8e8' : '#2a2d2e',
        itemSelectedColor: isLightTheme ? '#d6ebff' : '#094771',
        borderColor: isLightTheme ? '#cecece' : '#3c3c3c',
        buttonBackground: isLightTheme ? '#007acc' : '#0e639c',
        buttonHoverBackground: isLightTheme ? '#006bb3' : '#1177bb',
        headerBackground: isLightTheme ? '#e4e4e4' : '#333333',
        shadowColor: isLightTheme ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.6)',
        cardBackground: isLightTheme ? '#ffffff' : '#1e1e1e',
        searchBackground: isLightTheme ? '#ffffff' : '#3c3c3c'
    };
    
    // Replace placeholders in the template
    let html = templateContent;
    
    // Add devicon CSS link with proper WebView resource URIs
    html = html.replace('</head>', `<link rel="stylesheet" href="${deviconFontCssUri}" />\n<link rel="stylesheet" href="${deviconCssUri}" />\n<link rel="stylesheet" href="${customIconsCssUri}" />\n</head>`);
    
    // Replace theme colors - convert camelCase property names to kebab-case for CSS variables
    Object.entries(themeColors).forEach(([key, value]) => {
        // Convert camelCase to kebab-case for CSS variable names
        const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        html = html.replace(new RegExp(`{{${cssVarName}}}`, 'g'), value);
    });
    
    // Replace other placeholders
    html = html.replace(/{{projects-html}}/g, projectsHtml);
    html = html.replace(/{{projects-count}}/g, projects.length.toString());
    html = html.replace(/{{new-window-checked}}/g, isNewWindowMode ? 'checked' : '');
    html = html.replace(/{{is-new-window-mode}}/g, isNewWindowMode.toString());
    
    return html;
}

/**
 * Get a basic template as fallback if the template file can't be read
 */
function getBasicTemplate(): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Project Finder</title>
        <style>
            :root {
                --background-color: {{background-color}};
                --foreground-color: {{foreground-color}};
                --item-hover-color: {{item-hover-color}};
                --item-selected-color: {{item-selected-color}};
                --border-color: {{border-color}};
                --button-background: {{button-background}};
                --button-foreground: white;
                --button-hover-background: {{button-hover-background}};
                --header-background: {{header-background}};
                --shadow-color: {{shadow-color}};
                --card-background: {{card-background}};
                --search-background: {{search-background}};
            }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe WPC', 'Segoe UI', system-ui, 'Ubuntu', 'Droid Sans', sans-serif;
                padding: 0;
                margin: 0;
                color: var(--foreground-color);
                background-color: var(--background-color);
            }
            .container {
                display: flex;
                flex-direction: column;
                height: 100vh;
                padding: 0;
                box-sizing: border-box;
                max-width: 800px;
                margin: 0 auto;
            }
            .project-list {
                flex: 1;
                overflow-y: auto;
            }
            .project-item {
                padding: 10px;
                cursor: pointer;
                border-bottom: 1px solid var(--border-color);
            }
            .project-item:hover {
                background-color: var(--item-hover-color);
            }
            .project-item.selected {
                background-color: var(--item-selected-color);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="project-list" id="projectList">
                {{projects-html}}
            </div>
        </div>
        <script>
            (function() {
                const vscode = acquireVsCodeApi();
                const projectItems = document.querySelectorAll('.project-item');
                
                projectItems.forEach((item, index) => {
                    item.addEventListener('click', () => {
                        vscode.postMessage({
                            command: 'openProject',
                            projectPath: item.dataset.path,
                            newWindow: "{{is-new-window-mode}}" === "true"
                        });
                    });
                });
            })();
        </script>
    </body>
    </html>`;
} 