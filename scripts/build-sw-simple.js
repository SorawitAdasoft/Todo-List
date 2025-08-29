const fs = require('fs');
const path = require('path');

/**
 * Build script for service worker
 * Simply copies the service worker file to public directory
 */

const sourceFile = path.join(__dirname, '..', 'sw.ts');
const targetFile = path.join(__dirname, '..', 'public', 'sw.js');

function buildServiceWorker() {
  try {
    console.log('Building service worker...');
    
    // Read the TypeScript source
    let sourceContent = fs.readFileSync(sourceFile, 'utf8');
    
    // Simple transformation: just remove basic TypeScript syntax
    sourceContent = sourceContent
      // Remove type annotations in function parameters and variables
      .replace(/:\\s*[a-zA-Z<>\\[\\]|\\s{},.]+(?=\\s*[=;,)])/g, '')
      // Remove interface declarations
      .replace(/interface\\s+\\w+\\s*{[^}]*}/g, '')
      // Remove type aliases
      .replace(/type\\s+\\w+\\s*=[^;]+;/g, '')
      // Remove empty lines
      .replace(/\n\\s*\n/g, '\n');
    
    // Ensure target directory exists
    const targetDir = path.dirname(targetFile);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Write the JavaScript version
    fs.writeFileSync(targetFile, sourceContent, 'utf8');
    
    console.log(`Service worker built successfully: ${targetFile}`);
  } catch (error) {
    console.error('Failed to build service worker:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  buildServiceWorker();
}

module.exports = { buildServiceWorker };