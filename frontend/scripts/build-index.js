const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const srcComponentsDir = path.join(root, 'src', 'components');
const templatePath = path.join(srcComponentsDir, 'index.template.html');
const outputPath = path.join(root, 'public', 'index.html');

const componentFiles = {
  '{{sidebar}}': 'sidebar.html',
  '{{header}}': 'header.html',
  '{{chat-box}}': 'chat-box.html',
  '{{footer}}': 'footer.html',
  '{{help}}': 'help.html',
};

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function build() {
  let html = readText(templatePath);

  for (const [token, fileName] of Object.entries(componentFiles)) {
    const componentPath = path.join(srcComponentsDir, fileName);
    const componentHtml = readText(componentPath).trimEnd();
    html = html.replace(token, componentHtml);
  }

  fs.writeFileSync(outputPath, `${html.trimEnd()}\n`, 'utf8');
  console.log(`index gerado com sucesso: ${outputPath}`);
}

build();
