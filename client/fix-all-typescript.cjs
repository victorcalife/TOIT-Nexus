const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components', 'ui');

// Função para corrigir um arquivo
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Padrão para React.forwardRef com tipos TypeScript
    const forwardRefPattern = /const\s+(\w+)\s*=\s*React\.forwardRef<[^>]+,\s*[^>]+>\s*\(/g;
    
    // Substituir por versão sem tipos
    content = content.replace(forwardRefPattern, (match, componentName) => {
      return `const ${componentName} = React.forwardRef(`;
    });
    
    // Salvar o arquivo corrigido
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Corrigido: ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`Erro ao corrigir ${filePath}:`, error.message);
  }
}

// Processar todos os arquivos .jsx na pasta components/ui
if (fs.existsSync(componentsDir)) {
  const files = fs.readdirSync(componentsDir);
  
  files.forEach(file => {
    if (file.endsWith('.jsx')) {
      const filePath = path.join(componentsDir, file);
      fixFile(filePath);
    }
  });
  
  console.log('Correção concluída!');
} else {
  console.error('Diretório components/ui não encontrado!');
}