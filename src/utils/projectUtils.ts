import * as fs from 'fs';
import * as path from 'path';

/**
 * Project technology types that can be detected
 */
export enum ProjectTechnology {
    unknown = 'unknown',
    javascript = 'javascript',
    typescript = 'typescript',
    react = 'react',
    vue = 'vue',
    angular = 'angular',
    node = 'node',
    python = 'python',
    java = 'java',
    csharp = 'csharp',
    php = 'php',
    go = 'go',
    rust = 'rust',
    ruby = 'ruby',
    flutter = 'flutter',
    swift = 'swift',
    kotlin = 'kotlin',
    cplusplus = 'cplusplus',
    c = 'c',
    docker = 'docker',
    git = 'git'
}

/**
 * Technology detection rules
 */
const technologyRules: { [key in ProjectTechnology]?: string[] } = {
    [ProjectTechnology.javascript]: ['package.json', 'webpack.config.js', '.eslintrc', 'yarn.lock', 'node_modules'],
    [ProjectTechnology.typescript]: ['tsconfig.json', '.ts', '.tsx'],
    [ProjectTechnology.react]: ['react', '.jsx', '.tsx', 'react-dom'],
    [ProjectTechnology.vue]: ['vue.config.js', '.vue'],
    [ProjectTechnology.angular]: ['angular.json', '.angular-cli.json'],
    [ProjectTechnology.node]: ['package.json', 'node_modules', 'npm-debug.log'],
    [ProjectTechnology.python]: ['requirements.txt', 'setup.py', '.py', 'Pipfile', 'venv', '.venv'],
    [ProjectTechnology.java]: ['pom.xml', 'build.gradle', '.java', '.jar', 'gradle.properties'],
    [ProjectTechnology.csharp]: ['.csproj', '.cs', '.sln'],
    [ProjectTechnology.php]: ['.php', 'composer.json'],
    [ProjectTechnology.go]: ['go.mod', 'go.sum', '.go'],
    [ProjectTechnology.rust]: ['Cargo.toml', 'Cargo.lock', '.rs'],
    [ProjectTechnology.ruby]: ['Gemfile', '.rb', '.gemspec'],
    [ProjectTechnology.flutter]: ['pubspec.yaml', '.dart'],
    [ProjectTechnology.swift]: ['.swift', '.xcodeproj', '.xcworkspace'],
    [ProjectTechnology.kotlin]: ['.kt', '.kts', 'build.gradle.kts'],
    [ProjectTechnology.cplusplus]: ['.cpp', '.hpp', 'CMakeLists.txt'],
    [ProjectTechnology.c]: ['.c', '.h'],
    [ProjectTechnology.docker]: ['Dockerfile', 'docker-compose.yml'],
    [ProjectTechnology.git]: ['.git']
};

/**
 * Icons for each technology
 */
export const technologyIcons: { [key in ProjectTechnology]: string } = {
    [ProjectTechnology.unknown]: '📁',
    [ProjectTechnology.javascript]: '🟨',
    [ProjectTechnology.typescript]: '🔷',
    [ProjectTechnology.react]: '⚛️',
    [ProjectTechnology.vue]: '🟩',
    [ProjectTechnology.angular]: '🅰️',
    [ProjectTechnology.node]: '🟢',
    [ProjectTechnology.python]: '🐍',
    [ProjectTechnology.java]: '☕',
    [ProjectTechnology.csharp]: '🔶',
    [ProjectTechnology.php]: '🐘',
    [ProjectTechnology.go]: '🔵',
    [ProjectTechnology.rust]: '⚙️',
    [ProjectTechnology.ruby]: '💎',
    [ProjectTechnology.flutter]: '🦋',
    [ProjectTechnology.swift]: '🦅',
    [ProjectTechnology.kotlin]: '🟣',
    [ProjectTechnology.cplusplus]: '🔧',
    [ProjectTechnology.c]: '©️',
    [ProjectTechnology.docker]: '🐳',
    [ProjectTechnology.git]: '📊'
};

/**
 * Detect the primary technology used in a project
 * @param projectPath Path to the project directory
 * @returns The detected technology
 */
export function detectProjectTechnology(projectPath: string): ProjectTechnology {
    try {
        if (!fs.existsSync(projectPath) || !fs.statSync(projectPath).isDirectory()) {
            return ProjectTechnology.unknown;
        }

        // Get all files in the root directory
        const files = fs.readdirSync(projectPath);
        
        // Check for package.json to read dependencies
        if (files.includes('package.json')) {
            try {
                const packageJsonPath = path.join(projectPath, 'package.json');
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                const allDependencies = {
                    ...(packageJson.dependencies || {}),
                    ...(packageJson.devDependencies || {})
                };
                
                // Check for specific dependencies
                if (allDependencies.react) {
                    return ProjectTechnology.react;
                }
                if (allDependencies.vue) {
                    return ProjectTechnology.vue;
                }
                if (allDependencies['@angular/core']) {
                    return ProjectTechnology.angular;
                }
                if (files.includes('tsconfig.json')) {
                    return ProjectTechnology.typescript;
                }
                return ProjectTechnology.javascript;
            } catch (error) {
                // If we can't read package.json, continue with file-based detection
                console.error('Error reading package.json:', error);
            }
        }

        // Check for specific files to determine technology
        for (const [tech, indicators] of Object.entries(technologyRules)) {
            for (const indicator of indicators || []) {
                // Check if indicator is a file extension
                if (indicator.startsWith('.')) {
                    // Look for any file with this extension
                    if (files.some(file => file.endsWith(indicator))) {
                        return tech as ProjectTechnology;
                    }
                } else {
                    // Check for exact file/directory match
                    if (files.includes(indicator)) {
                        return tech as ProjectTechnology;
                    }
                }
            }
        }

        return ProjectTechnology.unknown;
    } catch (error) {
        console.error('Error detecting project technology:', error);
        return ProjectTechnology.unknown;
    }
} 