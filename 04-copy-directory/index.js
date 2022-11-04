const fs = require('fs');
const { mkdir, rm } = require('fs/promises');
const path = require('path');
const { pipeline } = require('stream');

async function copyDirectory(dir, dirCopy) {
  const directoryPath = path.join(__dirname, dir);
  const directoryPathCopy = path.join(__dirname, dirCopy);
  const files = await fs.promises.readdir(directoryPath, { withFileTypes: true });

  await rm(directoryPathCopy, { recursive: true, force: true }, (error) => {
    if(error) throw error;
  });
  await mkdir(directoryPathCopy, { recursive: true, force: true }, (error) => {
    if (error) throw error;
  })

  files.forEach( async file => {
    if (!file.isDirectory()) {
      const filePath = path.join(directoryPath, file.name);
      const filePathCopy = path.join(directoryPathCopy, file.name);
      const readStream = fs.createReadStream(filePath);
      const writeStream = fs.createWriteStream(filePathCopy, 'utf-8');
      pipeline(
        readStream,
        writeStream,
        error => { if (error) console.error(error.message) }
      )
    } else {
      dir = path.join(dir, file.name);
      dirCopy = path.join(dirCopy, file.name);
      copyDirectory(dir, dirCopy);
    }
  })
}

try {
  copyDirectory('/files/', '/files-copy/');
} catch (error) {
  console.error(error.message);
}