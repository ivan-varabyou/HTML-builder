const fs = require('fs');
const path = require('path');
const bundlePath = path.join(__dirname, '/project-dist/bundle.css');
const dir = '/styles/';
const output = fs.createWriteStream(bundlePath, 'utf-8');

try {
  mergeStyles(dir, output);
} catch (error) {
  console.error(error);
}

async function mergeStyles(dir) {
  const directory = path.join(__dirname, dir);
  const files = await fs.promises.readdir(directory, { withFileTypes: true });

  files.forEach(file => {
    if (!file.isDirectory()){
      const ext = file.name.split('.')[1];
      if (ext === 'css') {
        const filePath = path.join(directory, file.name);
        const input = fs.createReadStream(filePath);
        input.on('data', chank => output.write(chank));
      }
    } else {
      dir = path.join(dir, file.name);
      mergeStyles(dir);
    }
  })
}