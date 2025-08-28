const fs = require('fs');
const path = require('path');

// Função para corrigir arquivos TypeScript em JSX
function fixTypeScriptInJSX(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Regex para encontrar React.forwardRef com tipos TypeScript
    const forwardRefRegex = /React\.forwardRef<[^>]+,\s*[^>]+>\(/g;
    
    // Substituir por React.forwardRef simples
    content = content.replace(forwardRefRegex, 'React.forwardRef(');
    
    // Escrever o arquivo corrigido
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Corrigido: ${filePath}`);
  } catch (error) {
    console.error(`Erro ao corrigir ${filePath}:`, error.message);
  }
}

// Lista de arquivos para corrigir
const filesToFix = [
  'src/components/ui/form.jsx',
  'src/components/ui/popover.jsx',
  'src/components/ui/textarea.jsx',
  'src/components/ui/navigation-menu.jsx',
  'src/components/ui/accordion.jsx',
  'src/components/ui/context-menu.jsx',
  'src/components/ui/carousel.jsx',
  'src/components/ui/toggle.jsx',
  'src/components/ui/sidebar.jsx',
  'src/components/ui/chart.jsx',
  'src/components/ui/switch.jsx',
  'src/components/ui/menubar.jsx',
  'src/components/ui/select.jsx',
  'src/components/ui/table.jsx',
  'src/components/ui/sheet.jsx',
  'src/components/ui/scroll-area.jsx',
  'src/components/ui/hover-card.jsx',
  'src/components/ui/dropdown-menu.jsx',
  'src/components/ui/slider.jsx',
  'src/components/ui/dialog.jsx',
  'src/components/ui/input-otp.jsx',
  'src/components/ui/drawer.jsx',
  'src/components/ui/avatar.jsx',
  'src/components/ui/radio-group.jsx',
  'src/components/ui/alert-dialog.jsx',
  'src/components/ui/pagination.jsx'
];

console.log('Iniciando correção de arquivos TypeScript em JSX...');

filesToFix.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    fixTypeScriptInJSX(fullPath);
  } else {
    console.log(`Arquivo não encontrado: ${fullPath}`);
  }
});

console.log('Correção concluída!');