const fs = require('fs');
const path = require('path');
const folder = path.join(__dirname, '/secret-folder/');

async function readFolder(folder) {
  const data = await fs.promises.readdir(folder);
  let fileInfo, filePath, stats, size;
  data.forEach(async (file) => {
    filePath = path.join(folder, file);
    stats = await fs.promises.stat(filePath);
    if(stats.isFile()) {
      fileInfo = file.split('.').join(' - ');
      size = Number(stats.size / 2000).toFixed(3);
      console.log(`${fileInfo} - ${size}kb`);
    }
  });
};

try {
  readFolder(folder);
} catch (error) {
  console.error(error.message)
}