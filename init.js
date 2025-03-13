const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Initializing Project Finder extension...');

// Check if node_modules exists
if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('Dependencies installed successfully.');
  } catch (error) {
    console.error('Failed to install dependencies:', error.message);
    process.exit(1);
  }
}

// Compile TypeScript
console.log('Compiling TypeScript...');
try {
  execSync('npm run compile', { stdio: 'inherit' });
  console.log('Compilation successful.');
} catch (error) {
  console.error('Failed to compile TypeScript:', error.message);
  process.exit(1);
}

console.log('\nProject Finder extension is ready to use!');
console.log('To run the extension in debug mode:');
console.log('1. Open this folder in VS Code');
console.log('2. Press F5 to start debugging');
console.log('\nTo configure project folders:');
console.log('1. Open VS Code settings');
console.log('2. Search for "Project Finder"');
console.log('3. Add your project folders to the "Project Finder: Project Folders" setting'); 