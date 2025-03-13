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
    git = 'git',
    laravel = 'laravel',
    django = 'django',
    symfony = 'symfony',
    wordpress = 'wordpress',
    yii = 'yii',
    zend = 'zend'
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
    [ProjectTechnology.git]: ['.git'],
    [ProjectTechnology.laravel]: ['artisan', 'app/Http/Controllers', 'app/Providers/RouteServiceProvider.php'],
    [ProjectTechnology.django]: ['manage.py', 'django', 'settings.py', 'wsgi.py', 'asgi.py'],
    [ProjectTechnology.symfony]: ['symfony.lock', 'symfony', 'bin/console', 'config/bundles.php'],
    [ProjectTechnology.wordpress]: ['wp-config.php', 'wp-content', 'wp-admin', 'wp-includes'],
    [ProjectTechnology.yii]: ['yii', 'config/web.php', 'config/console.php'],
    [ProjectTechnology.zend]: ['zend', 'module/Application', 'config/application.config.php']
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
    [ProjectTechnology.git]: '📊',
    [ProjectTechnology.laravel]: '🔺',
    [ProjectTechnology.django]: '🐍',
    [ProjectTechnology.symfony]: '🎵',
    [ProjectTechnology.wordpress]: '📰',
    [ProjectTechnology.yii]: '🔶',
    [ProjectTechnology.zend]: '🔷'
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
        
        // PRIORITY 1: Check for specific framework files first
        
        // Laravel detection
        if (files.includes('artisan')) {
            return ProjectTechnology.laravel;
        }
        
        // WordPress detection
        if (files.includes('wp-config.php') || files.includes('wp-content')) {
            return ProjectTechnology.wordpress;
        }
        
        // Django detection
        if (files.includes('manage.py')) {
            try {
                const manageContent = fs.readFileSync(path.join(projectPath, 'manage.py'), 'utf8');
                if (manageContent.includes('django')) {
                    return ProjectTechnology.django;
                }
            } catch (error) {
                // Continue with other detection methods
            }
        }
        
        // Symfony detection
        if (files.includes('symfony.lock') || files.includes('bin/console')) {
            return ProjectTechnology.symfony;
        }
        
        // Yii detection
        if (files.includes('yii') || (files.includes('config') && fs.existsSync(path.join(projectPath, 'config/web.php')))) {
            return ProjectTechnology.yii;
        }
        
        // Zend detection
        if (files.includes('config') && fs.existsSync(path.join(projectPath, 'config/application.config.php'))) {
            return ProjectTechnology.zend;
        }
        
        // PRIORITY 2: Check for PHP before JavaScript
        if (files.some(file => file.endsWith('.php')) || files.includes('composer.json')) {
            return ProjectTechnology.php;
        }
        
        // PRIORITY 3: Check for package.json to read dependencies (JavaScript frameworks)
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
        
        // PRIORITY 4: Check for other programming languages
        
        // Flutter detection
        if (files.includes('pubspec.yaml') && files.some(file => file.endsWith('.dart'))) {
            return ProjectTechnology.flutter;
        }
        
        // Ruby detection
        if (files.includes('Gemfile') || files.some(file => file.endsWith('.rb'))) {
            return ProjectTechnology.ruby;
        }
        
        // Python detection (if not Django)
        if (files.includes('requirements.txt') || files.includes('setup.py') || 
            files.some(file => file.endsWith('.py')) || files.includes('Pipfile')) {
            return ProjectTechnology.python;
        }
        
        // Java detection
        if (files.includes('pom.xml') || files.includes('build.gradle') || 
            files.some(file => file.endsWith('.java'))) {
            return ProjectTechnology.java;
        }
        
        // C# detection
        if (files.some(file => file.endsWith('.csproj') || file.endsWith('.cs') || file.endsWith('.sln'))) {
            return ProjectTechnology.csharp;
        }
        
        // Go detection
        if (files.includes('go.mod') || files.includes('go.sum') || 
            files.some(file => file.endsWith('.go'))) {
            return ProjectTechnology.go;
        }
        
        // Rust detection
        if (files.includes('Cargo.toml') || files.includes('Cargo.lock') || 
            files.some(file => file.endsWith('.rs'))) {
            return ProjectTechnology.rust;
        }
        
        // Swift detection
        if (files.some(file => file.endsWith('.swift') || file.endsWith('.xcodeproj'))) {
            return ProjectTechnology.swift;
        }
        
        // Kotlin detection
        if (files.some(file => file.endsWith('.kt') || file.endsWith('.kts'))) {
            return ProjectTechnology.kotlin;
        }
        
        // C++ detection
        if (files.some(file => file.endsWith('.cpp') || file.endsWith('.hpp'))) {
            return ProjectTechnology.cplusplus;
        }
        
        // C detection
        if (files.some(file => file.endsWith('.c') || file.endsWith('.h'))) {
            return ProjectTechnology.c;
        }
        
        // Docker detection
        if (files.includes('Dockerfile') || files.includes('docker-compose.yml')) {
            return ProjectTechnology.docker;
        }
        
        // Git detection
        if (files.includes('.git')) {
            return ProjectTechnology.git;
        }

        // PRIORITY 5: Check for specific files to determine technology using the rules
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
                    
                    // Check for subdirectories
                    if (indicator.includes('/')) {
                        const parts = indicator.split('/');
                        let currentPath = projectPath;
                        let exists = true;
                        
                        for (const part of parts) {
                            currentPath = path.join(currentPath, part);
                            if (!fs.existsSync(currentPath)) {
                                exists = false;
                                break;
                            }
                        }
                        
                        if (exists) {
                            return tech as ProjectTechnology;
                        }
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