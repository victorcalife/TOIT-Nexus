const fs = require('fs');
const path = require('path');

function fixTypeScriptInJSX(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Remove TypeScript generics from React.forwardRef
    const forwardRefRegex = /React\.forwardRef<[^>]*>/g;
    if (forwardRefRegex.test(content)) {
      content = content.replace(forwardRefRegex, 'React.forwardRef');
      modified = true;
    }
    
    // Remove TypeScript type annotations in function parameters
    const typeAnnotationRegex = /\(\{[^}]*\}\s*:\s*[^,)]+,?\s*ref\s*:\s*[^)]+\)/g;
    if (typeAnnotationRegex.test(content)) {
      content = content.replace(typeAnnotationRegex, '({ className, ...props }, ref)');
      modified = true;
    }
    
    // Fix broken className strings
    content = content.replace(/className={cn\(\s*"[^"]*,\s*className/g, (match) => {
      const fixed = match.replace(/,\s*className/, '",\n        className');
      if (fixed !== match) modified = true;
      return fixed;
    });
    
    // Remove standalone type parameters
    const standaloneTypeRegex = /^\s*[A-Z][a-zA-Z]*,?\s*$/gm;
    if (standaloneTypeRegex.test(content)) {
      content = content.replace(standaloneTypeRegex, '');
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        processDirectory(fullPath);
      } else if (file.endsWith('.jsx')) {
        fixTypeScriptInJSX(fullPath);
      }
    });
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error.message);
  }
}

// Process all JSX files in src/components
const componentsDir = path.join(__dirname, 'src', 'components');
processDirectory(componentsDir);

console.log('TypeScript syntax cleanup completed!');