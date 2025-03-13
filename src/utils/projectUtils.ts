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
    laravel = 'laravel',
    django = 'django',
    symfony = 'symfony',
    wordpress = 'wordpress',
    yii = 'yii',
    zend = 'zend'
}

/**
 * Technology detection rule types
 */
type FileIndicator = string;
type ContentCheck = { file: string, content: string };
type SubdirectoryCheck = string;

interface TechnologyRule {
    priority: number;  // Lower number = higher priority
    files?: FileIndicator[];  // Simple file/directory existence checks
    extensions?: string[];  // File extension checks
    content?: ContentCheck[];  // Content-based checks
    subdirectories?: SubdirectoryCheck[];  // Subdirectory existence checks
}

/**
 * Technology detection rules with priority
 * Priority groups:
 * 1-99: Frameworks
 * 100-199: Programming languages
 * 200+: Tools and others
 */
const technologyRules: Record<ProjectTechnology, TechnologyRule> = {
    // PRIORITY GROUP 1: Frameworks (1-99)
    [ProjectTechnology.laravel]: {
        priority: 10,
        files: ['artisan'],
        subdirectories: ['app/Http/Controllers', 'app/Providers/RouteServiceProvider.php']
    },
    [ProjectTechnology.wordpress]: {
        priority: 11,
        files: ['wp-config.php', 'wp-content', 'wp-admin', 'wp-includes']
    },
    [ProjectTechnology.django]: {
        priority: 12,
        files: ['manage.py'],
        content: [{ file: 'manage.py', content: 'django' }]
    },
    [ProjectTechnology.symfony]: {
        priority: 13,
        files: ['symfony.lock', 'bin/console'],
        subdirectories: ['config/bundles.php']
    },
    [ProjectTechnology.yii]: {
        priority: 14,
        files: ['yii'],
        subdirectories: ['config/web.php', 'config/console.php']
    },
    [ProjectTechnology.zend]: {
        priority: 15,
        subdirectories: ['module/Application', 'config/application.config.php']
    },
    [ProjectTechnology.react]: {
        priority: 20,
        extensions: ['.jsx', '.tsx'],
        content: [{ file: 'package.json', content: '"react"' }]
    },
    [ProjectTechnology.vue]: {
        priority: 21,
        files: ['vue.config.js'],
        extensions: ['.vue'],
        content: [{ file: 'package.json', content: '"vue"' }]
    },
    [ProjectTechnology.angular]: {
        priority: 22,
        files: ['angular.json', '.angular-cli.json'],
        content: [{ file: 'package.json', content: '"@angular/core"' }]
    },

    // PRIORITY GROUP 2: Programming Languages (100-199)
    [ProjectTechnology.php]: {
        priority: 100,
        files: ['composer.json'],
        extensions: ['.php']
    },
    [ProjectTechnology.typescript]: {
        priority: 110,
        files: ['tsconfig.json'],
        extensions: ['.ts', '.tsx']
    },
    [ProjectTechnology.javascript]: {
        priority: 111,
        files: ['package.json', 'webpack.config.js', '.eslintrc', 'yarn.lock'],
        extensions: ['.js', '.jsx']
    },
    [ProjectTechnology.node]: {
        priority: 112,
        files: ['package.json', 'node_modules', 'npm-debug.log']
    },
    [ProjectTechnology.flutter]: {
        priority: 120,
        files: ['pubspec.yaml'],
        extensions: ['.dart']
    },
    [ProjectTechnology.ruby]: {
        priority: 130,
        files: ['Gemfile'],
        extensions: ['.rb', '.gemspec']
    },
    [ProjectTechnology.python]: {
        priority: 140,
        files: ['requirements.txt', 'setup.py', 'Pipfile', 'venv', '.venv'],
        extensions: ['.py']
    },
    [ProjectTechnology.java]: {
        priority: 150,
        files: ['pom.xml', 'build.gradle', 'gradle.properties'],
        extensions: ['.java', '.jar']
    },
    [ProjectTechnology.csharp]: {
        priority: 160,
        extensions: ['.csproj', '.cs', '.sln']
    },
    [ProjectTechnology.go]: {
        priority: 170,
        files: ['go.mod', 'go.sum'],
        extensions: ['.go']
    },
    [ProjectTechnology.rust]: {
        priority: 180,
        files: ['Cargo.toml', 'Cargo.lock'],
        extensions: ['.rs']
    },
    [ProjectTechnology.swift]: {
        priority: 190,
        extensions: ['.swift', '.xcodeproj', '.xcworkspace']
    },
    [ProjectTechnology.kotlin]: {
        priority: 191,
        extensions: ['.kt', '.kts'],
        files: ['build.gradle.kts']
    },
    [ProjectTechnology.cplusplus]: {
        priority: 192,
        extensions: ['.cpp', '.hpp'],
        files: ['CMakeLists.txt']
    },
    [ProjectTechnology.c]: {
        priority: 193,
        extensions: ['.c', '.h']
    },

    // PRIORITY GROUP 3: Tools and Others (200+)
    [ProjectTechnology.docker]: {
        priority: 200,
        files: ['Dockerfile', 'docker-compose.yml']
    },
    [ProjectTechnology.unknown]: {
        priority: 999
    }
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
        
        // Create a list of detected technologies with their priorities
        const detectedTechnologies: { tech: ProjectTechnology, priority: number }[] = [];
        
        // Check each technology rule
        for (const [tech, rule] of Object.entries(technologyRules)) {
            if (tech === ProjectTechnology.unknown) {
                continue; // Skip the unknown technology
            }
            
            let detected = false;
            
            // Check for file existence
            if (rule.files && rule.files.length > 0) {
                if (rule.files.some(file => files.includes(file))) {
                    detected = true;
                }
            }
            
            // Check for file extensions
            if (!detected && rule.extensions && rule.extensions.length > 0) {
                if (rule.extensions.some(ext => files.some(file => file.endsWith(ext)))) {
                    detected = true;
                }
            }
            
            // Check for content in files
            if (!detected && rule.content && rule.content.length > 0) {
                for (const contentCheck of rule.content) {
                    if (files.includes(contentCheck.file)) {
                        try {
                            const fileContent = fs.readFileSync(path.join(projectPath, contentCheck.file), 'utf8');
                            if (fileContent.includes(contentCheck.content)) {
                                detected = true;
                                break;
                            }
                        } catch (error) {
                            // Continue if we can't read the file
                        }
                    }
                }
            }
            
            // Check for subdirectories
            if (!detected && rule.subdirectories && rule.subdirectories.length > 0) {
                for (const subdir of rule.subdirectories) {
                    const fullPath = path.join(projectPath, subdir);
                    if (fs.existsSync(fullPath)) {
                        detected = true;
                        break;
                    }
                }
            }
            
            // If detected, add to the list
            if (detected) {
                detectedTechnologies.push({
                    tech: tech as ProjectTechnology,
                    priority: rule.priority
                });
            }
        }
        
        // Sort by priority (lower number = higher priority)
        detectedTechnologies.sort((a, b) => a.priority - b.priority);
        
        // Return the highest priority technology, or unknown if none detected
        return detectedTechnologies.length > 0 
            ? detectedTechnologies[0].tech 
            : ProjectTechnology.unknown;
    } catch (error) {
        console.error('Error detecting project technology:', error);
        return ProjectTechnology.unknown;
    }
} 