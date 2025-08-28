const fs = require('fs');
const path = require('path');

function fixJSXFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove TypeScript generics from React.forwardRef
    content = content.replace(/React\.forwardRef<[^>]*>/g, 'React.forwardRef');
    
    // Fix broken forwardRef declarations
    content = content.replace(/const\s+(\w+)\s*=\s*React\.forwardRef\s*,\s*[^>]*>\s*>\(/g, 'const $1 = React.forwardRef(');
    
    // Remove standalone type parameters
    content = content.replace(/^\s*[A-Z][a-zA-Z0-9]*\s*<[^>]*>\s*$/gm, '');
    
    // Fix broken className strings
    content = content.replace(/className={cn\(\s*"([^"]*),([^"]*)"/g, 'className={cn("$1 $2"');
    
    // Fix incomplete function parameters
    content = content.replace(/\(\{\s*([^}]*)\s*,\s*\}\s*,\s*ref\)/g, '({ $1 }, ref)');
    
    // Fix broken export statements
    content = content.replace(/export\s*{\s*}/g, 'export {}');
    
    // Fix incomplete catch blocks
    content = content.replace(/catch\s*\{/g, 'catch (error) {');
    
    // Fix broken object destructuring
    content = content.replace(/\{\s*([^}]*)\s*\)\s*=>/g, '({ $1 }) =>');
    
    // Fix incomplete template literals
    content = content.replace(/`([^`]*$)/gm, '`$1`');
    
    // Fix broken JSX attributes
    content = content.replace(/([a-zA-Z-]+)=\{([^}]*)$/gm, '$1={$2}');
    
    // Remove incomplete type annotations
    content = content.replace(/:\s*[A-Z][a-zA-Z0-9<>\[\]]*\s*=/g, ' =');
    
    // Fix broken imports
    content = content.replace(/import\s*{([^}]*)$/gm, 'import { $1 }');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      fixJSXFile(fullPath);
    }
  });
}

// Process all components
processDirectory('./src/components');
processDirectory('./src/pages');
processDirectory('./src/lib');

console.log('All files processed!');